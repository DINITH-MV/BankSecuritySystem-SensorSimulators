import express from "express";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BASE_OFFICE_PORT = 3002; // Office Floor 1 starts at port 3002
const FIXED_ZONES = [
  {
    name: "External Perimeter",
    port: 3000,
    scriptFile: "start_external_perimeter_system.sh",
  },
  {
    name: "Ground Floor",
    port: 3001,
    scriptFile: "start_ground_floor_system.sh",
  },
  {
    name: "High Security Floor",
    port: 3100,
    scriptFile: "start_high_security_floor_system.sh",
  },
];

class SecuritySystemOrchestrator {
  constructor() {
    this.processes = [];
    this.officeFloors = 0;
    this.isRunning = false;
    this.app = express();
    this.setupWebServer();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  setupWebServer() {
    this.app.use(express.json());

    // GET endpoint to start zones with specified office floors
    this.app.get("/start/:floors", async (req, res) => {
      try {
        const floors = parseInt(req.params.floors);

        if (isNaN(floors) || floors < 1 || floors > 30) {
          return res.status(400).json({
            error:
              "Invalid floor count. Please provide a number between 1 and 30.",
            example: "/start/5 (to start 5 office floors)",
          });
        }

        if (this.isRunning) {
          return res.status(409).json({
            error: "Security system is already running",
            activeZones: this.processes.length,
            officeFloors: this.officeFloors,
          });
        }

        this.officeFloors = floors;

        // Start the system
        const result = await this.startSystemViaAPI();

        res.json({
          message: `Security system started successfully with ${floors} office floor(s)`,
          totalZones: FIXED_ZONES.length + floors,
          fixedZones: FIXED_ZONES.length,
          officeFloors: floors,
          processes: this.processes.map((p) => ({
            name: p.name,
            port: p.port,
            pid: p.pid,
          })),
          healthUrls: this.getHealthUrls(),
          commandEndpoints: this.getCommandEndpoints(),
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to start security system",
          details: error.message,
        });
      }
    });

    // GET endpoint to check system status
    this.app.get("/status", (req, res) => {
      res.json({
        isRunning: this.isRunning,
        totalZones: this.isRunning ? FIXED_ZONES.length + this.officeFloors : 0,
        officeFloors: this.officeFloors,
        activeProcesses: this.processes.length,
        processes: this.processes.map((p) => ({
          name: p.name,
          port: p.port,
          pid: p.pid,
        })),
        healthUrls: this.isRunning ? this.getHealthUrls() : [],
        commandEndpoints: this.isRunning ? this.getCommandEndpoints() : [],
      });
    });

    // GET endpoint to stop all zones
    this.app.get("/stop", async (req, res) => {
      if (!this.isRunning) {
        return res.status(400).json({
          error: "Security system is not running",
        });
      }

      try {
        const result = await this.stopAllZones();
        res.json({
          message: "Security system shutdown completed",
          ...result,
          note: "All processes have been terminated. Check the results for details.",
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to stop security system",
          details: error.message,
        });
      }
    });

    // GET endpoint to check if processes are actually running
    this.app.get("/check-processes", async (req, res) => {
      if (!this.isRunning) {
        return res.status(400).json({
          error: "Security system is not running",
        });
      }

      const processChecks = await Promise.all(
        this.processes.map(async (proc) => {
          const isRunning = await this.isProcessRunning(proc.pid);
          const portStatus = await this.checkPortStatus(proc.port);

          return {
            name: proc.name,
            pid: proc.pid,
            port: proc.port,
            processRunning: isRunning,
            portActive: portStatus.active,
            portResponse: portStatus.response,
            healthCheck: portStatus.healthCheck,
          };
        })
      );

      const allRunning = processChecks.every(
        (p) => p.processRunning && p.portActive
      );

      res.json({
        message: "Process status check complete",
        allProcessesRunning: allRunning,
        totalProcesses: this.processes.length,
        runningProcesses: processChecks.filter((p) => p.processRunning).length,
        activeports: processChecks.filter((p) => p.portActive).length,
        processes: processChecks,
        timestamp: new Date().toISOString(),
      });
    });

    // GET endpoint to force kill all processes (emergency stop)
    this.app.get("/force-stop", async (req, res) => {
      if (!this.isRunning) {
        return res.status(400).json({
          error: "Security system is not running",
        });
      }

      try {
        const forceResults = [];

        for (const processInfo of this.processes) {
          try {
            const { name, pid } = processInfo;
            console.log(`Force killing ${name} (PID: ${pid})...`);

            // Force kill the process
            process.kill(pid, "SIGKILL");

            // Also try to kill the entire process tree
            await this.killProcessTree(pid);

            // Check if it's really dead
            await this.sleep(1000);
            const stillRunning = await this.isProcessRunning(pid);

            forceResults.push({
              name,
              pid,
              success: !stillRunning,
              method: "SIGKILL",
            });
          } catch (error) {
            forceResults.push({
              name: processInfo.name,
              pid: processInfo.pid,
              success: false,
              error: error.message,
            });
          }
        }

        this.isRunning = false;
        this.processes = [];
        this.officeFloors = 0;

        res.json({
          message: "Force termination completed",
          results: forceResults,
          totalKilled: forceResults.filter((r) => r.success).length,
          totalFailed: forceResults.filter((r) => !r.success).length,
          warning:
            "This was a forceful termination. Some processes may have been left in an inconsistent state.",
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to force stop security system",
          details: error.message,
        });
      }
    });

    // Root endpoint with instructions
    this.app.get("/", (req, res) => {
      res.json({
        message: "Security System Dynamic Orchestrator API",
        quickStart: {
          startSystem: "GET /start/5 (starts system with 5 office floors)",
          checkStatus: "GET /status",
          checkProcesses:
            "GET /check-processes (verify if terminals are running)",
          stopSystem: "GET /stop (graceful shutdown)",
          forceStop: "GET /force-stop (emergency kill all processes)",
          getInfo: "GET /info",
        },
        currentStatus: {
          isRunning: this.isRunning,
          activeZones: this.processes.length,
          officeFloors: this.officeFloors,
        },
      });
    });
  }

  async initialize() {
    console.log("===============================================");
    console.log("    SECURITY SYSTEM DYNAMIC ORCHESTRATOR");
    console.log("===============================================");
    console.log("    Enhanced Command-Driven Architecture");
    console.log("    Date: October 1, 2025");
    console.log("    Dynamic Office Floor Management");
    console.log("    API-Enabled Zone Configuration");
    console.log("===============================================\n");

    // Start web server
    const port = 5000;
    this.app.listen(port, () => {
      console.log(` API Server started on http://localhost:${port}`);
      console.log(" Available endpoints:");
      console.log(
        `   - GET /start/{floors} - Start system with office floors (1-30)`
      );
      console.log(`   - GET /status - Check system status`);
      console.log(`   - GET /stop - Stop all zones`);
      console.log(`   - GET /info - System information`);
      console.log(`\n Quick start: http://localhost:${port}/start/5`);
      console.log(` Check status: http://localhost:${port}/status`);
      console.log(`\n  You can also use interactive mode below:`);
    });

    // Also provide interactive command line option
    await this.getOfficeFloorsInput();
    await this.validateBatchFiles();
    await this.showSystemOverview();
    await this.confirmAndStart();
  }

  async startSystemViaAPI() {
    console.log(
      `\n API Request: Starting system with ${this.officeFloors} office floors`
    );

    await this.validateBatchFiles();
    await this.startAllZones();
    this.isRunning = true;

    return {
      success: true,
      totalZones: FIXED_ZONES.length + this.officeFloors,
      message: "System started successfully via API",
    };
  }

  getHealthUrls() {
    const urls = [];

    // Fixed zones
    FIXED_ZONES.forEach((zone) => {
      urls.push(`http://localhost:${zone.port}/health`);
    });

    // Office floors
    for (let i = 1; i <= this.officeFloors; i++) {
      const port = BASE_OFFICE_PORT + i - 1;
      urls.push(`http://localhost:${port}/health`);
    }

    return urls;
  }

  getCommandEndpoints() {
    const endpoints = [];

    // Fixed zones
    FIXED_ZONES.forEach((zone) => {
      const zoneName = zone.name.toLowerCase().replace(/\s+/g, "_");
      endpoints.push({
        zone: zone.name,
        siren: `/siren-commands/${zoneName}`,
        beacon: `/beacon-commands/${zoneName}`,
      });
    });

    // Office floors
    for (let i = 1; i <= this.officeFloors; i++) {
      endpoints.push({
        zone: `Office Floor ${i}`,
        siren: `/siren-commands/office_floor_${i}`,
        beacon: `/beacon-commands/office_floor_${i}`,
      });
    }

    return endpoints;
  }

  async stopAllZones() {
    console.log("\n System shutdown initiated via API");
    console.log("Terminating all zone processes...");

    const terminationResults = [];

    for (const processInfo of this.processes) {
      try {
        const result = await this.terminateProcess(processInfo);
        terminationResults.push(result);
      } catch (error) {
        terminationResults.push({
          name: processInfo.name,
          pid: processInfo.pid,
          success: false,
          error: error.message,
        });
      }
    }

    this.isRunning = false;
    this.processes = [];
    this.officeFloors = 0;

    return {
      message: "All zones shutdown completed",
      results: terminationResults,
      totalTerminated: terminationResults.filter((r) => r.success).length,
      totalFailed: terminationResults.filter((r) => !r.success).length,
    };
  }

  // Helper method to terminate a specific process and its children
  async terminateProcess(processInfo) {
    const { name, pid, process } = processInfo;

    console.log(`Terminating ${name} (PID: ${pid})...`);

    try {
      // First, try to gracefully terminate the process
      if (process && !process.killed) {
        process.kill("SIGTERM");

        // Wait a bit for graceful shutdown
        await this.sleep(2000);

        // Check if still running
        const stillRunning = await this.isProcessRunning(pid);
        if (stillRunning) {
          console.log(`${name} didn't respond to SIGTERM, using SIGKILL...`);
          process.kill("SIGKILL");
        }
      } else {
        // Process object not available, try to kill by PID
        try {
          process.kill(pid, "SIGTERM");
          await this.sleep(2000);

          const stillRunning = await this.isProcessRunning(pid);
          if (stillRunning) {
            console.log(`${name} didn't respond to SIGTERM, using SIGKILL...`);
            process.kill(pid, "SIGKILL");
          }
        } catch (killError) {
          // Process might already be dead
          console.log(
            `Process ${name} (PID: ${pid}) might already be terminated`
          );
        }
      }

      // Also try to kill any child processes (Node.js servers spawned by the shell script)
      try {
        await this.killProcessTree(pid);
      } catch (treeError) {
        console.log(
          `Warning: Could not kill process tree for ${name}: ${treeError.message}`
        );
      }

      // Final check
      const finalCheck = await this.isProcessRunning(pid);

      console.log(`${name} termination: ${finalCheck ? "FAILED" : "SUCCESS"}`);

      return {
        name,
        pid,
        success: !finalCheck,
        method: finalCheck ? "failed" : "terminated",
      };
    } catch (error) {
      console.log(`Error terminating ${name}: ${error.message}`);
      return {
        name,
        pid,
        success: false,
        error: error.message,
      };
    }
  }

  // Helper method to kill process tree (parent and children)
  async killProcessTree(pid) {
    try {
      const { spawn } = await import("child_process");

      // On Linux/Ubuntu, use pkill to kill process group
      return new Promise((resolve, reject) => {
        const killProcess = spawn("pkill", ["-P", pid.toString()], {
          stdio: "ignore",
        });

        killProcess.on("close", (code) => {
          // pkill returns 1 if no processes matched, which is okay
          resolve(code);
        });

        killProcess.on("error", (error) => {
          reject(error);
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          killProcess.kill();
          resolve(1);
        }, 5000);
      });
    } catch (error) {
      console.log(`Could not kill process tree: ${error.message}`);
    }
  }

  async getOfficeFloorsInput() {
    return new Promise((resolve) => {
      const askForFloors = () => {
        this.rl.question(
          "Enter the number of office floors to activate (1-30): ",
          (answer) => {
            const floors = parseInt(answer);
            if (isNaN(floors) || floors < 1 || floors > 30) {
              console.log(
                "Invalid input. Please enter a number between 1 and 30."
              );
              askForFloors();
            } else {
              this.officeFloors = floors;
              console.log(
                `\n Selected ${floors} office floor(s) for activation.\n`
              );
              resolve();
            }
          }
        );
      };
      askForFloors();
    });
  }

  async validateBatchFiles() {
    console.log("Validating zone starter files...");
    const zoneStarterPath = join(__dirname, "zone_starter");
    let missingFiles = [];

    // Check fixed zones
    for (const zone of FIXED_ZONES) {
      const filePath = join(zoneStarterPath, zone.scriptFile);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(zone.scriptFile);
      }
    }

    // Check office floors
    for (let i = 1; i <= this.officeFloors; i++) {
      const scriptFile = `start_office_floor_${i}_system.sh`;
      const filePath = join(zoneStarterPath, scriptFile);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(scriptFile);
      }
    }

    if (missingFiles.length > 0) {
      console.error("\n CRITICAL ERROR: Missing script files:");
      missingFiles.forEach((file) => console.error(`   - ${file}`));
      console.error(
        "\nPlease ensure all required shell script files exist in the zone_starter directory.\n"
      );
      process.exit(1);
    }

    console.log(" All zone starter files validated successfully!\n");
  }

  async showSystemOverview() {
    console.log("===============================================");
    console.log("           SYSTEM DEPLOYMENT OVERVIEW");
    console.log("===============================================");

    console.log("\nFixed Security Zones:");
    FIXED_ZONES.forEach((zone, index) => {
      console.log(`  ${index + 1}. ${zone.name} (Port ${zone.port})`);
    });

    console.log(`\nOffice Floors (${this.officeFloors} floors):`);
    for (let i = 1; i <= this.officeFloors; i++) {
      const port = BASE_OFFICE_PORT + i - 1;
      console.log(
        `  ${FIXED_ZONES.length + i}. Office Floor ${i} (Port ${port})`
      );
    }

    const totalZones = FIXED_ZONES.length + this.officeFloors;
    console.log(`\nTotal Zones: ${totalZones}`);
    console.log(
      `Port Range: 3000-${BASE_OFFICE_PORT + this.officeFloors - 1}, 3100`
    );
    console.log("Architecture: Command-Driven Multi-Zone Security System");
  }

  async confirmAndStart() {
    return new Promise((resolve) => {
      this.rl.question(
        "\nProceed with system startup? (y/n): ",
        async (answer) => {
          if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            await this.startAllZones();
            resolve();
          } else {
            console.log("System startup cancelled.");
            process.exit(0);
          }
        }
      );
    });
  }

  async startAllZones() {
    console.log("\n===============================================");
    console.log("      STARTING ALL ZONES: COMPLETE BUILDING");
    console.log("===============================================");
    console.log("Full Building Coverage with Enhanced Command Architecture\n");

    // Start fixed zones
    for (const zone of FIXED_ZONES) {
      await this.startZone(zone.name, zone.port, zone.scriptFile);
    }

    // Start office floors
    for (let i = 1; i <= this.officeFloors; i++) {
      const port = BASE_OFFICE_PORT + i - 1;
      const scriptFile = `start_office_floor_${i}_system.sh`;
      await this.startZone(`Office Floor ${i}`, port, scriptFile);
    }

    this.isRunning = true;
    await this.showSystemStatus();

    // Only setup graceful shutdown for interactive mode
    if (!this.isRunning) {
      await this.setupGracefulShutdown();
    }
  }

  async startZone(zoneName, port, scriptFile) {
    console.log(`Starting ${zoneName} (Port ${port})...`);
    console.log(`- Enhanced Security with Command-Based Control`);
    console.log(`Executing: ${scriptFile}`);

    const zoneStarterPath = join(__dirname, "zone_starter");
    const scriptFilePath = join(zoneStarterPath, scriptFile);

    try {
      // Make sure the script file is executable
      if (fs.existsSync(scriptFilePath)) {
        await new Promise((resolve, reject) => {
          spawn("chmod", ["+x", scriptFilePath], { stdio: "ignore" })
            .on("close", (code) => {
              if (code === 0) resolve();
              else reject(new Error(`chmod failed with code ${code}`));
            })
            .on("error", reject);
        });
      }

      const process = spawn(
        "bash",
        [
          "-c",
          `cd "${zoneStarterPath}" && echo "Terminal Command Test Successful" && echo "Zone Starter Path: ${zoneStarterPath}" && echo "Starting ${zoneName}..." && ./${scriptFile}`,
        ],
        {
          detached: true,
          stdio: ["ignore", "pipe", "pipe"],
          cwd: zoneStarterPath,
        }
      );

      this.processes.push({
        name: zoneName,
        port: port,
        process: process,
        pid: process.pid,
      });

      // Wait a bit between starts to prevent resource conflicts
      await this.sleep(3000);
      console.log(` ${zoneName} started successfully!\n`);
    } catch (error) {
      console.error(` ERROR starting ${zoneName}: ${error.message}\n`);
    }
  }

  async showSystemStatus() {
    console.log("===============================================");
    console.log("           SYSTEM STARTUP COMPLETE");
    console.log("===============================================\n");

    console.log("Active Zones Summary:");
    console.log(
      `- Total Active Zones: ${FIXED_ZONES.length + this.officeFloors}/${
        FIXED_ZONES.length + this.officeFloors
      }`
    );
    console.log(
      "- Architecture: Complete Building Security with Enhanced Command-Driven Control"
    );
    console.log(
      "- Coverage: Full Building with Multi-Layer Security Defense\n"
    );

    console.log("Zone Details:");

    // Fixed zones
    FIXED_ZONES.forEach((zone) => {
      console.log(` ${zone.name} (Port ${zone.port}) [ACTIVE]`);
    });

    // Office floors
    for (let i = 1; i <= this.officeFloors; i++) {
      const port = BASE_OFFICE_PORT + i - 1;
      console.log(
        ` Office Floor ${i} (Port ${port}) [ACTIVE - ENHANCED OFFICE SECURITY]`
      );
    }

    console.log("\nSystem Configuration:");
    console.log("- MQTT Broker: localhost:1883 (Aedes)");
    console.log(
      `- Web Servers: Ports 3000-${
        BASE_OFFICE_PORT + this.officeFloors - 1
      }, 3100`
    );
    console.log("- Communication: HTTP + MQTT");
    console.log("- Architecture: Command-Driven Actuator Control\n");

    console.log("Quick Health Check URLs:");
    FIXED_ZONES.forEach((zone) => {
      console.log(`- ${zone.name}: http://localhost:${zone.port}/health`);
    });

    for (let i = 1; i <= this.officeFloors; i++) {
      const port = BASE_OFFICE_PORT + i - 1;
      console.log(`- Office Floor ${i}: http://localhost:${port}/health`);
    }

    console.log("\nCommand Endpoints:");
    FIXED_ZONES.forEach((zone) => {
      const zoneName = zone.name.toLowerCase().replace(/\s+/g, "_");
      console.log(
        `- ${zone.name}: /siren-commands/${zoneName}, /beacon-commands/${zoneName}`
      );
    });

    for (let i = 1; i <= this.officeFloors; i++) {
      console.log(
        `- Office Floor ${i}: /siren-commands/office_floor_${i}, /beacon-commands/office_floor_${i}`
      );
    }

    console.log("\n COMPLETE BUILDING SECURITY ACTIVE.");
    console.log("\nPress Ctrl+C to shutdown all zones gracefully...");
  }

  async setupGracefulShutdown() {
    process.on("SIGINT", () => {
      console.log("\n\n===============================================");
      console.log("           GRACEFUL SHUTDOWN INITIATED");
      console.log("===============================================");
      console.log("Shutting down all zones...\n");

      console.log("Note: Individual zone windows will remain open.");
      console.log("Close individual zone windows manually if needed.");
      console.log("Master orchestrator shutting down...\n");

      this.rl.close();
      process.exit(0);
    });

    // Keep the process alive
    await this.keepAlive();
  }

  async keepAlive() {
    return new Promise((resolve) => {
      // Keep the process running
      const keepRunning = () => {
        setTimeout(keepRunning, 1000);
      };
      keepRunning();
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper method to check if a process is running
  async isProcessRunning(pid) {
    try {
      // Use kill with signal 0 to check if process exists
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper method to check if a port is active and responding
  async checkPortStatus(port) {
    try {
      const axios = await import("axios");

      // Try to make a health check request
      const response = await axios.default.get(
        `http://localhost:${port}/health`,
        {
          timeout: 3000,
        }
      );

      return {
        active: true,
        response: response.status,
        healthCheck: response.data || "OK",
      };
    } catch (error) {
      // Try a basic connection test
      try {
        const net = await import("net");
        return new Promise((resolve) => {
          const socket = new net.default.Socket();
          const timeout = setTimeout(() => {
            socket.destroy();
            resolve({
              active: false,
              response: "timeout",
              healthCheck: "Port not responding",
            });
          }, 2000);

          socket.connect(port, "localhost", () => {
            clearTimeout(timeout);
            socket.destroy();
            resolve({
              active: true,
              response: "connected",
              healthCheck: "Port active but no HTTP response",
            });
          });

          socket.on("error", () => {
            clearTimeout(timeout);
            resolve({
              active: false,
              response: "connection_refused",
              healthCheck: "Port not active",
            });
          });
        });
      } catch (netError) {
        return {
          active: false,
          response: "error",
          healthCheck: `Connection error: ${error.message}`,
        };
      }
    }
  }
}

// Main execution
async function main() {
  try {
    const orchestrator = new SecuritySystemOrchestrator();
    await orchestrator.initialize();
  } catch (error) {
    console.error(" Fatal Error:", error.message);
    process.exit(1);
  }
}

// Run the application
const isMainModule = () => {
  try {
    const mainModulePath = fileURLToPath(import.meta.url);
    return (
      process.argv[1] === mainModulePath ||
      process.argv[1] === mainModulePath.replace(/\\/g, "/")
    );
  } catch {
    return false;
  }
};

if (isMainModule()) {
  main().catch((error) => {
    console.error(" Fatal Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

export { SecuritySystemOrchestrator };
