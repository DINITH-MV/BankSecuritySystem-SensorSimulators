import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import sensor nodes
import "../zones/office_floor_9/sensors/AXIS_XFQ1656_camera_node.js";
import "../zones/office_floor_9/sensors/Bosch_PIR_motion_detector_node.js";
import "../zones/office_floor_9/sensors/HID_MiniProx_proxpoint_reader.js";
import "../zones/office_floor_9/sensors/Honeywell_DT8016_motion_detector_node.js";

// Import actuator nodes
import "../zones/office_floor_9/actuators/E2S_HMA121_Hootronic_siren.js";
import "../zones/office_floor_9/actuators/Werma_D62_LED_beacon_node.js";

const app = express();
const PORT = 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dashboard")));

// Global data storage for Office Floor 9
global.officeFloor9SensorData = {};
global.officeFloor9ActuatorData = {};

// Command storage for actuator control
let sirenCommands = [];
let beaconCommands = [];

// Office Floor 9 Sensor data endpoint
app.get("/sensor-data", (req, res) => {
  try {
    const sensorDataArray = [];

    // Convert global sensor data to array format
    Object.keys(global.officeFloor9SensorData).forEach((sensorId) => {
      const sensorData = global.officeFloor9SensorData[sensorId];
      if (sensorData) {
        sensorDataArray.push(sensorData);
      }
    });

    console.log(
      `Office Floor 9: Serving ${sensorDataArray.length} sensor readings`
    );
    res.json(sensorDataArray);
  } catch (error) {
    console.error("Error serving sensor data:", error.message);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      zone: "office_floor_9",
    });
  }
});

// POST endpoint for sensors to send data
app.post("/sensor-data", (req, res) => {
  try {
    const sensorData = req.body;

    if (!sensorData || !sensorData.sensorId) {
      return res.status(400).json({
        error: "Invalid sensor data",
        message: "sensorId is required",
        zone: "office_floor_9",
      });
    }

    // Store sensor data in global storage
    global.officeFloor9SensorData[sensorData.sensorId] = {
      ...sensorData,
      receivedAt: new Date().toISOString(),
      zone: "office_floor_9",
    };

    console.log(
      `Office Floor 9: Received data from ${sensorData.sensorType} (${sensorData.sensorId})`
    );

    res.status(200).json({
      success: true,
      message: "Sensor data received",
      sensorId: sensorData.sensorId,
      zone: "office_floor_9",
    });
  } catch (error) {
    console.error("Error processing sensor data:", error.message);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      zone: "office_floor_9",
    });
  }
});

// Office Floor 9 Actuator data endpoint
app.get("/actuator-data", (req, res) => {
  try {
    const actuatorDataArray = [];

    // Convert global actuator data to array format
    Object.keys(global.officeFloor9ActuatorData).forEach((actuatorId) => {
      const actuatorData = global.officeFloor9ActuatorData[actuatorId];
      if (actuatorData) {
        actuatorDataArray.push(actuatorData);
      }
    });

    console.log(
      `Office Floor 9: Serving ${actuatorDataArray.length} actuator states`
    );
    res.json(actuatorDataArray);
  } catch (error) {
    console.error("Error serving actuator data:", error.message);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      zone: "office_floor_9",
    });
  }
});

// POST endpoint for actuators to send data
app.post("/actuator-data", (req, res) => {
  try {
    const actuatorData = req.body;

    if (!actuatorData || (!actuatorData.beaconId && !actuatorData.sirenId)) {
      return res.status(400).json({
        error: "Invalid actuator data",
        message: "beaconId or sirenId is required",
        zone: "office_floor_9",
      });
    }

    // Store actuator data in global storage using the appropriate ID
    const actuatorId = actuatorData.beaconId || actuatorData.sirenId;
    global.officeFloor9ActuatorData[actuatorId] = {
      ...actuatorData,
      receivedAt: new Date().toISOString(),
      zone: "office_floor_9",
    };

    console.log(
      `Office Floor 9: Received data from ${
        actuatorData.deviceType || "actuator"
      } (${actuatorId})`
    );

    res.status(200).json({
      success: true,
      message: "Actuator data received",
      actuatorId: actuatorId,
      zone: "office_floor_9",
    });
  } catch (error) {
    console.error("Error processing actuator data:", error.message);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      zone: "office_floor_9",
    });
  }
});

// Actuator activation endpoint
app.post("/activate-actuator", (req, res) => {
  try {
    const { actuatorType, action, parameters, alert, timestamp } = req.body;

    console.log(
      `Office Floor 9: Activating ${actuatorType} with action: ${action}`
    );

    // Find matching actuators by type
    const matchingActuators = [];
    Object.keys(global.officeFloor9ActuatorData).forEach((actuatorId) => {
      const actuator = global.officeFloor9ActuatorData[actuatorId];
      if (actuator && actuator.actuatorType === actuatorType) {
        matchingActuators.push({ id: actuatorId, data: actuator });
      }
    });

    if (matchingActuators.length === 0) {
      return res.status(404).json({
        error: "No actuators found",
        actuatorType: actuatorType,
        zone: "office_floor_9",
      });
    }

    // Activate all matching actuators
    const activationResults = [];
    matchingActuators.forEach(({ id, data }) => {
      // Update actuator state based on action
      const updatedState = { ...data };

      switch (action) {
        case "activate":
          if (actuatorType.includes("siren")) {
            updatedState.data = {
              ...updatedState.data,
              isActive: true,
              volume: parameters.volume || 80,
              activatedAt: timestamp,
              duration: parameters.duration || 10000,
            };
          }
          break;

        case "flash":
          if (actuatorType.includes("beacon")) {
            updatedState.data = {
              ...updatedState.data,
              isFlashing: true,
              pattern: parameters.pattern || "fast",
              color: parameters.color || "red",
              activatedAt: timestamp,
              duration: parameters.duration || 15000,
            };
          }
          break;

        case "deactivate":
          updatedState.data = {
            ...updatedState.data,
            isActive: false,
            isFlashing: false,
            deactivatedAt: timestamp,
          };
          break;
      }

      updatedState.timestamp = timestamp;
      updatedState.lastCommand = {
        action: action,
        parameters: parameters,
        triggeredBy: alert ? alert.alertType : "manual",
        timestamp: timestamp,
      };

      // Update global state
      global.officeFloor9ActuatorData[id] = updatedState;

      activationResults.push({
        actuatorId: id,
        actuatorType: actuatorType,
        action: action,
        success: true,
        timestamp: timestamp,
      });

      console.log(
        `Office Floor 9: Successfully activated ${actuatorType} (${id})`
      );
    });

    res.json({
      success: true,
      zone: "office_floor_9",
      activatedActuators: activationResults.length,
      results: activationResults,
      timestamp: timestamp,
    });
  } catch (error) {
    console.error("Error activating actuator:", error.message);
    res.status(500).json({
      error: "Activation failed",
      message: error.message,
      zone: "office_floor_9",
    });
  }
});

// Manual command endpoint
app.post("/manual-command", (req, res) => {
  try {
    const { actuatorId, action, parameters, timestamp } = req.body;

    console.log(`Office Floor 9: Manual command for ${actuatorId}: ${action}`);

    // Check if actuator exists
    if (!global.officeFloor9ActuatorData[actuatorId]) {
      return res.status(404).json({
        error: "Actuator not found",
        actuatorId: actuatorId,
        zone: "office_floor_9",
      });
    }

    const actuator = global.officeFloor9ActuatorData[actuatorId];
    const updatedState = { ...actuator };

    // Execute manual command
    switch (action) {
      case "test":
        updatedState.data = {
          ...updatedState.data,
          testMode: true,
          testStarted: timestamp,
        };
        break;

      case "reset":
        updatedState.data = {
          ...updatedState.data,
          isActive: false,
          isFlashing: false,
          testMode: false,
          resetAt: timestamp,
        };
        break;

      case "status":
        // Just return current status, no state change
        break;

      default:
        return res.status(400).json({
          error: "Unknown action",
          action: action,
          zone: "office_floor_9",
        });
    }

    updatedState.timestamp = timestamp;
    updatedState.lastManualCommand = {
      action: action,
      parameters: parameters,
      timestamp: timestamp,
    };

    // Update global state
    global.officeFloor9ActuatorData[actuatorId] = updatedState;

    res.json({
      success: true,
      zone: "office_floor_9",
      actuatorId: actuatorId,
      action: action,
      state: updatedState.data,
      timestamp: timestamp,
    });
  } catch (error) {
    console.error("Error executing manual command:", error.message);
    res.status(500).json({
      error: "Command execution failed",
      message: error.message,
      zone: "office_floor_9",
    });
  }
});

// Endpoint to receive siren commands from actuator controller
app.post("/siren-commands/:zone", (req, res) => {
  const { zone } = req.params;
  const commandData = req.body;

  if (zone === "office_floor_9") {
    commandData.timestamp = new Date().toISOString();
    sirenCommands.push(commandData);

    // Keep only last 10 commands
    if (sirenCommands.length > 10) {
      sirenCommands = sirenCommands.slice(-10);
    }

    console.log(
      `Office Floor 9: SIREN_COMMAND_RECEIVED - ${
        commandData.active ? "ACTIVATE" : "DEACTIVATE"
      } - Volume: ${commandData.volume || 0}%`
    );

    res.status(200).json({ message: "Siren command received successfully" });
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Endpoint to provide siren commands to siren actuators
app.get("/siren-commands/:zone", (req, res) => {
  const { zone } = req.params;

  if (zone === "office_floor_9") {
    res.json(sirenCommands);
    // Clear commands after sending (so they're processed only once)
    sirenCommands = [];
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Endpoint to receive beacon commands from actuator controller
app.post("/beacon-commands/:zone", (req, res) => {
  const { zone } = req.params;
  const commandData = req.body;

  if (zone === "office_floor_9") {
    commandData.timestamp = new Date().toISOString();
    beaconCommands.push(commandData);

    // Keep only last 10 commands
    if (beaconCommands.length > 10) {
      beaconCommands = beaconCommands.slice(-10);
    }

    console.log(
      `Office Floor 9: BEACON_COMMAND_RECEIVED - ${
        commandData.active ? "ACTIVATE" : "DEACTIVATE"
      } - Color: ${commandData.color || "GREEN"}, Brightness: ${
        commandData.brightness || 0
      }%`
    );

    res.status(200).json({ message: "Beacon command received successfully" });
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Endpoint to provide beacon commands to beacon actuators
app.get("/beacon-commands/:zone", (req, res) => {
  const { zone } = req.params;

  if (zone === "office_floor_9") {
    res.json(beaconCommands);
    // Clear commands after sending (so they're processed only once)
    beaconCommands = [];
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Zone status endpoint
app.get("/zone-status", (req, res) => {
  try {
    const sensorCount = Object.keys(global.officeFloor9SensorData).length;
    const actuatorCount = Object.keys(global.officeFloor9ActuatorData).length;

    const activeSensors = Object.values(global.officeFloor9SensorData).filter(
      (sensor) => sensor && sensor.active
    ).length;

    const activeActuators = Object.values(
      global.officeFloor9ActuatorData
    ).filter((actuator) => actuator && actuator.active).length;

    res.json({
      zone: "office_floor_9",
      status: "operational",
      timestamp: new Date().toISOString(),
      sensors: {
        total: sensorCount,
        active: activeSensors,
        inactive: sensorCount - activeSensors,
      },
      actuators: {
        total: actuatorCount,
        active: activeActuators,
        inactive: actuatorCount - activeActuators,
      },
      server: {
        port: PORT,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    });
  } catch (error) {
    console.error("Error getting zone status:", error.message);
    res.status(500).json({
      error: "Status retrieval failed",
      message: error.message,
      zone: "office_floor_9",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    zone: "office_floor_9",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Dashboard endpoint
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard", "index.html"));
});

// Root endpoint with zone information
app.get("/", (req, res) => {
  res.json({
    message: "Office Floor 9 Security System Web Server",
    zone: "office_floor_9",
    port: PORT,
    timestamp: new Date().toISOString(),
    endpoints: {
      sensorData: "/sensor-data",
      actuatorData: "/actuator-data",
      activateActuator: "/activate-actuator (POST)",
      manualCommand: "/manual-command (POST)",
      zoneStatus: "/zone-status",
      health: "/health",
      dashboard: "/dashboard",
    },
    zone_info: {
      floor: 9,
      type: "office",
      description:
        "Office Floor 9 - Standard office environment security monitoring",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Office Floor 9 Server Error:", err.stack);
  res.status(500).json({
    error: "Internal server error",
    zone: "office_floor_9",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    zone: "office_floor_9",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n=== Office Floor 9 Security System Web Server ===`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Zone: office_floor_9`);
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /                  - Server information`);
  console.log(`  GET  /sensor-data       - All sensor readings`);
  console.log(`  POST /sensor-data       - Receive sensor data`);
  console.log(`  GET  /actuator-data     - All actuator states`);
  console.log(`  POST /actuator-data     - Receive actuator data`);
  console.log(`  POST /activate-actuator - Activate actuators`);
  console.log(`  POST /manual-command    - Manual actuator control`);
  console.log(
    `  POST /siren-commands/:zone  - Receive siren commands from controller`
  );
  console.log(
    `  GET  /siren-commands/:zone  - Get siren commands for actuators`
  );
  console.log(
    `  POST /beacon-commands/:zone - Receive beacon commands from controller`
  );
  console.log(
    `  GET  /beacon-commands/:zone - Get beacon commands for actuators`
  );
  console.log(`  GET  /zone-status       - Zone operational status`);
  console.log(`  GET  /health            - Health check`);
  console.log(`  GET  /dashboard         - Web dashboard`);
  console.log(`===============================================\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Graceful shutdown...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Graceful shutdown...");
  process.exit(0);
});

export default app;
