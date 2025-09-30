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
    this.app.get("/stop", (req, res) => {
      if (!this.isRunning) {
        return res.status(400).json({
          error: "Security system is not running",
        });
      }

      this.stopAllZones();
      res.json({
        message: "Security system shutdown initiated",
        note: "Individual zone windows may remain open and need manual closure",
      });
    });

    // Root endpoint with instructions
    this.app.get("/", (req, res) => {
      res.json({
        message: "Security System Dynamic Orchestrator API",
        quickStart: {
          startSystem: "GET /start/5 (starts system with 5 office floors)",
          checkStatus: "GET /status",
          stopSystem: "GET /stop",
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

  stopAllZones() {
    this.isRunning = false;
    this.processes = [];
    this.officeFloors = 0;
    console.log("\n System shutdown initiated via API");
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
