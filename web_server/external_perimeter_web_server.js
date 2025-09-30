import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store sensor and actuator data in memory
let sensorDataStore = [];
let actuatorDataStore = [];
let securityAlerts = [];

// Store actuator commands from controller
let sirenCommands = [];
let beaconCommands = [];

// Enhanced logging for perimeter security
const logPerimeterEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[EXTERNAL PERIMETER] ${timestamp}: ${event} - ${details}`);
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

  // Keep only recent data (last 100 entries for perimeter monitoring)
  if (sensorDataStore.length > 100) {
    sensorDataStore = sensorDataStore.slice(-100);
  }

  // Enhanced perimeter security monitoring
  checkForPerimeterEvents(sensorData);

  logPerimeterEvent(
    "SENSOR_DATA_RECEIVED",
    `${sensorData.sensorId} (${sensorData.sensorType}) at ${sensorData.location}`
  );
  res
    .status(200)
    .json({ message: "Perimeter sensor data received successfully" });
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
    res.status(404).json({ error: "Perimeter sensor not found" });
  }
});

// Enhanced perimeter security monitoring function
const checkForPerimeterEvents = (sensorData) => {
  const { sensorId, sensorType, location, data } = sensorData;

  // Laser scanner perimeter breach alerts
  if (data && data.obstacleDetected) {
    createSecurityAlert("PERIMETER_BREACH", "CRITICAL", sensorId, location, {
      distance: data.distance,
      signalStrength: data.signalStrength,
      beamInterrupted: data.beamInterrupted,
    });
  }

  // PIR beam motion detection alerts
  if (data && data.motionDetected) {
    createSecurityAlert("PERIMETER_MOTION", "HIGH", sensorId, location, {
      motionLevel: data.motionLevel,
      detectionZone: data.detectionZone,
      heatSignature: data.heatSignature,
    });
  }

  // Camera security events
  if (
    data &&
    (data.motionDetected || data.faceDetected || data.suspiciousBehavior)
  ) {
    const severity = data.suspiciousBehavior ? "HIGH" : "MEDIUM";
    createSecurityAlert(
      "PERIMETER_CAMERA_EVENT",
      severity,
      sensorId,
      location,
      {
        motionDetected: data.motionDetected,
        faceDetected: data.faceDetected,
        suspiciousBehavior: data.suspiciousBehavior,
        videoQuality: data.videoQuality,
        nightVision: data.nightVision,
      }
    );
  }

  // Environmental alerts for outdoor conditions
  if (data && data.weatherAlert) {
    createSecurityAlert(
      "PERIMETER_WEATHER_ALERT",
      "MEDIUM",
      sensorId,
      location,
      {
        weatherCondition: data.weatherCondition,
        visibility: data.visibility,
        temperature: data.temperature,
      }
    );
  }
};

// Create security alert
const createSecurityAlert = (
  alertType,
  severity,
  sensorId,
  location,
  details
) => {
  const alert = {
    alertId: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    alertType,
    severity,
    sensorId,
    location,
    timestamp: new Date().toISOString(),
    zone: "external_perimeter",
    details,
  };

  securityAlerts.push(alert);

  // Keep only last 200 alerts
  if (securityAlerts.length > 200) {
    securityAlerts = securityAlerts.slice(-200);
  }

  logPerimeterEvent(
    `PERIMETER_ALERT_${severity}`,
    `${alertType} at ${location} (${sensorId})`
  );
};

// Endpoint to receive actuator data from actuators
app.post("/actuator-data", (req, res) => {
  const actuatorData = req.body;

  // Add timestamp if not present
  if (!actuatorData.timestamp) {
    actuatorData.timestamp = new Date().toISOString();
  }

  // Store the data (keep only last 100 entries per actuator)
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

  logPerimeterEvent(
    "ACTUATOR_DATA_RECEIVED",
    `${actuatorId} (${actuatorData.sensorType || actuatorData.deviceType}) at ${
      actuatorData.location
    }`
  );
  res
    .status(200)
    .json({ message: "Perimeter actuator data received successfully" });
});

// Endpoint to provide actuator data to the actuator controller
app.get("/actuator-data", (req, res) => {
  res.json(actuatorDataStore);
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
    res.status(404).json({ error: "Perimeter actuator not found" });
  }
});

// Endpoint to receive siren commands from actuator controller
app.post("/siren-commands/:zone", (req, res) => {
  const { zone } = req.params;
  const commandData = req.body;

  if (zone === "external_perimeter") {
    commandData.timestamp = new Date().toISOString();
    sirenCommands.push(commandData);

    // Keep only last 10 commands
    if (sirenCommands.length > 10) {
      sirenCommands = sirenCommands.slice(-10);
    }

    logPerimeterEvent(
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

  if (zone === "external_perimeter") {
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

  if (zone === "external_perimeter") {
    commandData.timestamp = new Date().toISOString();
    beaconCommands.push(commandData);

    // Keep only last 10 commands
    if (beaconCommands.length > 10) {
      beaconCommands = beaconCommands.slice(-10);
    }

    logPerimeterEvent(
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

  if (zone === "external_perimeter") {
    res.json(beaconCommands);
    // Clear commands after sending (so they're processed only once)
    beaconCommands = [];
  } else {
    res.status(404).json({ error: "Zone not found" });
  }
});

// Endpoint to get security alerts
app.get("/security-alerts", (req, res) => {
  const { severity, limit } = req.query;
  let filteredAlerts = securityAlerts;

  if (severity) {
    filteredAlerts = securityAlerts.filter(
      (alert) => alert.severity === severity.toUpperCase()
    );
  }

  if (limit) {
    const limitNum = parseInt(limit);
    filteredAlerts = filteredAlerts.slice(-limitNum);
  }

  res.json(filteredAlerts.reverse()); // Most recent first
});

// Endpoint to get security alerts by sensor
app.get("/security-alerts/:sensorId", (req, res) => {
  const { sensorId } = req.params;
  const sensorAlerts = securityAlerts.filter(
    (alert) => alert.sensorId === sensorId
  );
  res.json(sensorAlerts.reverse());
});

// Enhanced health check endpoint
app.get("/health", (req, res) => {
  const criticalAlerts = securityAlerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;
  const highAlerts = securityAlerts.filter(
    (alert) => alert.severity === "HIGH"
  ).length;

  res.json({
    status: "OK",
    zone: "external_perimeter",
    timestamp: new Date().toISOString(),
    activeSensors: sensorDataStore.length,
    activeActuators: actuatorDataStore.length,
    totalAlerts: securityAlerts.length,
    criticalAlerts,
    highAlerts,
    securityLevel: "PERIMETER_SECURITY",
  });
});

// Perimeter security dashboard endpoint
app.get("/perimeter-dashboard", (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const recentAlerts = securityAlerts.filter(
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

  res.json({
    zone: "external_perimeter",
    timestamp: new Date().toISOString(),
    summary: {
      totalSensors: sensorDataStore.length,
      activeSensors: activeSensors.length,
      totalActuators: actuatorDataStore.length,
      recentAlerts: recentAlerts.length,
      criticalAlerts: recentAlerts.filter((a) => a.severity === "CRITICAL")
        .length,
    },
    sensorsByType,
    recentActivity: recentAlerts.slice(-10).reverse(),
  });
});

// Start server
app.listen(port, () => {
  console.log(
    `EXTERNAL PERIMETER Web Server running on http://localhost:${port}`
  );
  console.log("=== EXTERNAL PERIMETER SECURITY SYSTEM ===");
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
  console.log("  GET  /security-alerts - Get security alerts");
  console.log(
    "  GET  /security-alerts/:sensorId - Get alerts for specific sensor"
  );
  console.log("  GET  /perimeter-dashboard - Perimeter security overview");
  console.log("  GET  /health - Health check");
  console.log("==========================================");

  logPerimeterEvent(
    "SYSTEM_STARTUP",
    "External Perimeter Web Server initialized"
  );
});

// Graceful shutdown
process.on("SIGINT", () => {
  logPerimeterEvent(
    "SYSTEM_SHUTDOWN",
    "External Perimeter Web Server shutting down"
  );
  console.log("\nShutting down external perimeter web server...");
  process.exit(0);
});
