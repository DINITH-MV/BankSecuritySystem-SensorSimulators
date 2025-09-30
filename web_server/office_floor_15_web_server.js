import express from "express";
import cors from "cors";

const app = express();
const port = 3016;

// Middleware
app.use(cors());
app.use(express.json());

// Store sensor and actuator data in memory
let sensorDataStore = [];
let actuatorDataStore = [];
let officeAlerts = [];

// Store actuator commands from controller
let sirenCommands = [];
let beaconCommands = [];

// Enhanced logging for office environment
const logOfficeEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[Office Floor 15] ${timestamp}: ${event} - ${details}`);
};

// Endpoint to receive sensor data from sensors
app.post("/sensor-data", (req, res) => {
  const sensorData = req.body;

  // Add timestamp if not present
  if (!sensorData.timestamp) {
    sensorData.timestamp = new Date().toISOString();
  }

  // Store the data (keep only last 100 entries per sensor)
  const existingIndex = sensorDataStore.findIndex(
    (data) => data.sensorId === sensorData.sensorId
  );

  if (existingIndex !== -1) {
    sensorDataStore[existingIndex] = sensorData;
  } else {
    sensorDataStore.push(sensorData);
  }

  // Keep only recent data (last 75 entries for office monitoring)
  if (sensorDataStore.length > 75) {
    sensorDataStore = sensorDataStore.slice(-75);
  }

  // Office security monitoring
  checkForOfficeSecurityEvents(sensorData);

  logOfficeEvent(
    "SENSOR_DATA_RECEIVED",
    `${sensorData.sensorId} (${sensorData.sensorType}) at ${sensorData.location}`
  );
  res
    .status(200)
    .json({ message: "Office Floor 15 sensor data received successfully" });
});

// Endpoint to provide sensor data to the sensor controller
app.get("/sensor-data", (req, res) => {
  res.json(sensorDataStore);
});

// Endpoint to get specific sensor data
app.get("/sensor-data/:sensorId", (req, res) => {
  const { sensorId } = req.params;
  const sensorData = sensorDataStore.find((data) => data.sensorId === sensorId);

  if (sensorData) {
    res.json(sensorData);
  } else {
    res.status(404).json({ error: "Office sensor not found" });
  }
});

// Endpoint to receive actuator data from actuators
app.post("/actuator-data", (req, res) => {
  const actuatorData = req.body;

  // Add timestamp if not present
  if (!actuatorData.timestamp) {
    actuatorData.timestamp = new Date().toISOString();
  }

  // Store the data (keep only last 50 entries per actuator)
  const actuatorId = actuatorData.sirenId || actuatorData.beaconId;
  const existingIndex = actuatorDataStore.findIndex(
    (data) => (data.sirenId || data.beaconId) === actuatorId
  );

  if (existingIndex !== -1) {
    actuatorDataStore[existingIndex] = actuatorData;
  } else {
    actuatorDataStore.push(actuatorData);
  }

  // Keep only recent data (last 50 entries)
  if (actuatorDataStore.length > 50) {
    actuatorDataStore = actuatorDataStore.slice(-50);
  }

  logOfficeEvent(
    "ACTUATOR_DATA_RECEIVED",
    `${actuatorId} (${actuatorData.sensorType || actuatorData.deviceType}) at ${
      actuatorData.location
    }`
  );
  res
    .status(200)
    .json({ message: "Office Floor 15 actuator data received successfully" });
});

// Endpoint to provide actuator data to the actuator controller
app.get("/actuator-data", (req, res) => {
  res.json(actuatorDataStore);
});

// Endpoint to receive siren commands from actuator controller
app.post("/siren-commands/:zone", (req, res) => {
  const { zone } = req.params;
  const commandData = req.body;

  if (zone === "office_floor_15") {
    commandData.timestamp = new Date().toISOString();
    sirenCommands.push(commandData);

    // Keep only last 10 commands
    if (sirenCommands.length > 10) {
      sirenCommands = sirenCommands.slice(-10);
    }

    logOfficeEvent(
      "SIREN_COMMAND_RECEIVED",
      `${commandData.active ? "ACTIVATE" : "DEACTIVATE"} - Volume: ${
        commandData.volume || 0
      }%`
    );

    res.status(200).json({ message: "Siren command received successfully" });
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Endpoint to provide siren commands to siren actuators
app.get("/siren-commands/:zone", (req, res) => {
  const { zone } = req.params;

  if (zone === "office_floor_15") {
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

  if (zone === "office_floor_15") {
    commandData.timestamp = new Date().toISOString();
    beaconCommands.push(commandData);

    // Keep only last 10 commands
    if (beaconCommands.length > 10) {
      beaconCommands = beaconCommands.slice(-10);
    }

    logOfficeEvent(
      "BEACON_COMMAND_RECEIVED",
      `${commandData.active ? "ACTIVATE" : "DEACTIVATE"} - Color: ${
        commandData.color || "GREEN"
      }, Brightness: ${commandData.brightness || 0}%`
    );

    res.status(200).json({ message: "Beacon command received successfully" });
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Endpoint to provide beacon commands to beacon actuators
app.get("/beacon-commands/:zone", (req, res) => {
  const { zone } = req.params;

  if (zone === "office_floor_15") {
    res.json(beaconCommands);
    // Clear commands after sending (so they're processed only once)
    beaconCommands = [];
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Endpoint to get specific actuator data
app.get("/actuator-data/:actuatorId", (req, res) => {
  const { actuatorId } = req.params;
  const actuatorData = actuatorDataStore.find(
    (data) => (data.sirenId || data.beaconId) === actuatorId
  );

  if (actuatorData) {
    res.json(actuatorData);
  } else {
    res.status(404).json({ error: "Office actuator not found" });
  }
});

// Office security monitoring function
const checkForOfficeSecurityEvents = (sensorData) => {
  const { sensorId, sensorType, location, data } = sensorData;

  // Motion detection alerts in office areas
  if (data && data.motionDetected) {
    const severity = location.includes("Meeting Room") ? "MEDIUM" : "LOW";
    createOfficeAlert("MOTION_DETECTED", severity, sensorId, location, {
      motionLevel: data.motionLevel,
      heatSignature: data.heatSignature,
    });
  }

  // Access control alerts
  if (data && data.cardPresented && !data.accessGranted) {
    createOfficeAlert(
      "UNAUTHORIZED_ACCESS_ATTEMPT",
      "HIGH",
      sensorId,
      location,
      {
        cardId: data.cardId,
        accessLevel: data.accessLevel,
      }
    );
  }

  // Camera security events
  if (data && data.securityRelevant) {
    const severity = data.suspiciousBehavior ? "HIGH" : "MEDIUM";
    createOfficeAlert("SECURITY_CAMERA_EVENT", severity, sensorId, location, {
      motionDetected: data.motionDetected,
      faceDetected: data.faceDetected,
      suspiciousBehavior: data.suspiciousBehavior,
    });
  }

  // Tamper detection
  if (data && data.tamperStatus === "tampered") {
    createOfficeAlert("SENSOR_TAMPER_DETECTED", "HIGH", sensorId, location, {
      sensorType: sensorType,
    });
  }
};

// Create office alert
const createOfficeAlert = (
  alertType,
  severity,
  sensorId,
  location,
  details
) => {
  const alert = {
    alertId: `ALERT_OF15_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    alertType,
    severity,
    sensorId,
    location,
    timestamp: new Date().toISOString(),
    zone: "office_floor_15",
    details,
  };

  officeAlerts.push(alert);

  // Keep only last 150 alerts
  if (officeAlerts.length > 150) {
    officeAlerts = officeAlerts.slice(-150);
  }

  logOfficeEvent(
    `OFFICE_ALERT_${severity}`,
    `${alertType} at ${location} (${sensorId})`
  );
};

// Endpoint to get office alerts
app.get("/office-alerts", (req, res) => {
  const { severity, limit } = req.query;
  let filteredAlerts = officeAlerts;

  if (severity) {
    filteredAlerts = officeAlerts.filter(
      (alert) => alert.severity === severity.toUpperCase()
    );
  }

  if (limit) {
    const limitNum = parseInt(limit);
    filteredAlerts = filteredAlerts.slice(-limitNum);
  }

  res.json(filteredAlerts.reverse()); // Most recent first
});

// Endpoint to get office alerts by sensor
app.get("/office-alerts/:sensorId", (req, res) => {
  const { sensorId } = req.params;
  const sensorAlerts = officeAlerts.filter(
    (alert) => alert.sensorId === sensorId
  );
  res.json(sensorAlerts.reverse());
});

// Office statistics endpoint
app.get("/office-stats", (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recentAlerts = officeAlerts.filter(
    (alert) => new Date(alert.timestamp) > oneHourAgo
  );

  const todayAlerts = officeAlerts.filter(
    (alert) => new Date(alert.timestamp) > today
  );

  const activeSensors = sensorDataStore.filter(
    (sensor) => new Date(sensor.timestamp) > oneHourAgo
  );

  // Count motion detections by area
  const motionByArea = {};
  sensorDataStore.forEach((sensor) => {
    if (sensor.data && sensor.data.motionDetected) {
      const area = sensor.location.includes("Open Office")
        ? "Open Office"
        : sensor.location.includes("Meeting Room")
        ? "Meeting Room"
        : sensor.location.includes("Corridor")
        ? "Corridor"
        : "Other";
      motionByArea[area] = (motionByArea[area] || 0) + 1;
    }
  });

  // Count access attempts
  const accessAttempts = sensorDataStore.filter(
    (sensor) => sensor.data && sensor.data.cardPresented
  ).length;

  const successfulAccess = sensorDataStore.filter(
    (sensor) =>
      sensor.data && sensor.data.cardPresented && sensor.data.accessGranted
  ).length;

  res.json({
    zone: "office_floor_15",
    timestamp: new Date().toISOString(),
    summary: {
      totalSensors: sensorDataStore.length,
      activeSensors: activeSensors.length,
      totalActuators: actuatorDataStore.length,
      recentAlerts: recentAlerts.length,
      todayAlerts: todayAlerts.length,
      highPriorityAlerts: recentAlerts.filter((a) => a.severity === "HIGH")
        .length,
    },
    officeActivity: {
      motionByArea,
      accessAttempts,
      successfulAccess,
      accessSuccessRate:
        accessAttempts > 0
          ? Math.round((successfulAccess / accessAttempts) * 100)
          : 0,
    },
    recentActivity: recentAlerts.slice(-10).reverse(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const highAlerts = officeAlerts.filter(
    (alert) => alert.severity === "HIGH"
  ).length;

  res.json({
    status: "OK",
    zone: "office_floor_15",
    timestamp: new Date().toISOString(),
    activeSensors: sensorDataStore.length,
    activeActuators: actuatorDataStore.length,
    totalAlerts: officeAlerts.length,
    highPriorityAlerts: highAlerts,
    officeLevel: "STANDARD_OFFICE",
  });
});

// Office dashboard endpoint
app.get("/office-dashboard", (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const recentAlerts = officeAlerts.filter(
    (alert) => new Date(alert.timestamp) > oneHourAgo
  );

  const activeSensors = sensorDataStore.filter(
    (sensor) => new Date(sensor.timestamp) > oneHourAgo
  );

  const sensorsByType = {};
  sensorDataStore.forEach((sensor) => {
    if (!sensorsByType[sensor.sensorType]) {
      sensorsByType[sensor.sensorType] = 0;
    }
    sensorsByType[sensor.sensorType]++;
  });

  const locationStats = {};
  sensorDataStore.forEach((sensor) => {
    const area = sensor.location.includes("Open Office")
      ? "Open Office Areas"
      : sensor.location.includes("Meeting Room")
      ? "Meeting Rooms"
      : sensor.location.includes("Corridor")
      ? "Corridors"
      : "Other Areas";
    if (!locationStats[area]) {
      locationStats[area] = { total: 0, active: 0 };
    }
    locationStats[area].total++;
    if (new Date(sensor.timestamp) > oneHourAgo) {
      locationStats[area].active++;
    }
  });

  res.json({
    zone: "office_floor_15",
    timestamp: new Date().toISOString(),
    summary: {
      totalSensors: sensorDataStore.length,
      activeSensors: activeSensors.length,
      totalActuators: actuatorDataStore.length,
      recentAlerts: recentAlerts.length,
      highPriorityAlerts: recentAlerts.filter((a) => a.severity === "HIGH")
        .length,
    },
    sensorsByType,
    locationStats,
    recentActivity: recentAlerts.slice(-10).reverse(),
  });
});

// Start server
app.listen(port, () => {
  console.log(`Office Floor 15 Web Server running on http://localhost:${port}`);
  console.log("=== Office Floor 15 MONITORING SYSTEM ===");
  console.log("Endpoints:");
  console.log("  POST /sensor-data - Receive sensor data");
  console.log("  GET  /sensor-data - Get all sensor data");
  console.log("  GET  /sensor-data/:sensorId - Get specific sensor data");
  console.log("  POST /actuator-data - Receive actuator data");
  console.log("  GET  /actuator-data - Get all actuator data");
  console.log("  GET  /actuator-data/:actuatorId - Get specific actuator data");
  console.log(
    "  POST /siren-commands/:zone - Receive siren commands from controller"
  );
  console.log(
    "  GET  /siren-commands/:zone - Get siren commands for actuators"
  );
  console.log(
    "  POST /beacon-commands/:zone - Receive beacon commands from controller"
  );
  console.log(
    "  GET  /beacon-commands/:zone - Get beacon commands for actuators"
  );
  console.log("  GET  /office-alerts - Get office alerts");
  console.log(
    "  GET  /office-alerts/:sensorId - Get alerts for specific sensor"
  );
  console.log("  GET  /office-stats - Office activity statistics");
  console.log("  GET  /office-dashboard - Office overview dashboard");
  console.log("  GET  /health - Health check");
  console.log("=========================================");

  logOfficeEvent("SYSTEM_STARTUP", "Office Floor 15 Web Server initialized");
});

// Graceful shutdown
process.on("SIGINT", () => {
  logOfficeEvent("SYSTEM_SHUTDOWN", "Office Floor 15 Web Server shutting down");
  console.log("\nShutting down Office Floor 15 web server...");
  process.exit(0);
});
