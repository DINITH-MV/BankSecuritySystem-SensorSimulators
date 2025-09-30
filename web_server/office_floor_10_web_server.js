import express from "express";
import cors from "cors";

const app = express();
const port = 3011;

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
  console.log(`[Office Floor 10] ${timestamp}: ${event} - ${details}`);
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
  if (sensorData.data && sensorData.data.securityRelevant) {
    let alertDetails = [];
    if (sensorData.data.motionDetected) alertDetails.push("Motion");
    if (sensorData.data.faceDetected) alertDetails.push("Face Detection");
    if (sensorData.data.suspiciousBehavior)
      alertDetails.push("Suspicious Behavior");

    const alert = {
      alertId: `ALERT_OF10_${Date.now()}`,
      sensorId: sensorData.sensorId,
      alertType: "SECURITY_EVENT",
      details: alertDetails.join(", "),
      location: sensorData.location,
      timestamp: sensorData.timestamp,
      severity: sensorData.data.suspiciousBehavior ? "HIGH" : "MEDIUM",
    };

    officeAlerts.push(alert);
    if (officeAlerts.length > 50) {
      officeAlerts = officeAlerts.slice(-50);
    }

    logOfficeEvent("SECURITY ALERT", `${alert.details} at ${alert.location}`);
  }

  // Motion detection logging
  if (sensorData.data && sensorData.data.motionDetected) {
    logOfficeEvent(
      "MOTION",
      `${sensorData.sensorType} detected motion at ${sensorData.location}`
    );
  }

  // Access control logging
  if (sensorData.data && sensorData.data.cardPresented) {
    const accessStatus = sensorData.data.accessGranted ? "GRANTED" : "DENIED";
    logOfficeEvent(
      "ACCESS",
      `${accessStatus} for card ${sensorData.data.cardId} at ${sensorData.location}`
    );
  }

  res.status(200).json({ message: "Sensor data received successfully" });
});

// Endpoint to receive actuator data from actuators
app.post("/actuator-data", (req, res) => {
  const actuatorData = req.body;

  // Add timestamp if not present
  if (!actuatorData.timestamp) {
    actuatorData.timestamp = new Date().toISOString();
  }

  // Store the data
  const existingIndex = actuatorDataStore.findIndex(
    (data) => data.actuatorId === actuatorData.actuatorId
  );

  if (existingIndex !== -1) {
    actuatorDataStore[existingIndex] = actuatorData;
  } else {
    actuatorDataStore.push(actuatorData);
  }

  // Keep only recent data
  if (actuatorDataStore.length > 50) {
    actuatorDataStore = actuatorDataStore.slice(-50);
  }

  logOfficeEvent(
    "ACTUATOR",
    `${actuatorData.actuatorType} status: ${actuatorData.data.status} at ${actuatorData.location}`
  );

  res.status(200).json({ message: "Actuator data received successfully" });
});

// Endpoint to get all sensor data
app.get("/sensor-data", (req, res) => {
  res.json(sensorDataStore);
});

// Endpoint to get all actuator data
app.get("/actuator-data", (req, res) => {
  res.json(actuatorDataStore);
});

// Endpoint to get office alerts
app.get("/alerts", (req, res) => {
  res.json(officeAlerts);
});

// Endpoint to get sensor data by type
app.get("/sensor-data/:type", (req, res) => {
  const { type } = req.params;
  const filteredData = sensorDataStore.filter((data) =>
    data.sensorType.toLowerCase().includes(type.toLowerCase())
  );
  res.json(filteredData);
});

// Endpoint to get statistics
app.get("/stats", (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const recentData = sensorDataStore.filter(
    (data) => new Date(data.timestamp) > oneHourAgo
  );

  const motionEvents = recentData.filter(
    (data) => data.data && data.data.motionDetected
  ).length;

  const accessEvents = recentData.filter(
    (data) => data.data && data.data.cardPresented
  ).length;

  const securityEvents = recentData.filter(
    (data) => data.data && data.data.securityRelevant
  ).length;

  res.json({
    totalSensors: sensorDataStore.length,
    totalActuators: actuatorDataStore.length,
    totalAlerts: officeAlerts.length,
    lastHour: {
      motionEvents,
      accessEvents,
      securityEvents,
    },
    systemStatus: "OPERATIONAL",
  });
});

// Office Floor 10 Siren Command Endpoints
app.post("/siren-commands/office_floor_10", (req, res) => {
  const command = req.body;
  command.timestamp = new Date().toISOString();
  command.commandId = `CMD_SIREN_OF10_${Date.now()}`;

  sirenCommands.push(command);
  if (sirenCommands.length > 20) {
    sirenCommands = sirenCommands.slice(-20);
  }

  logOfficeEvent(
    "SIREN COMMAND",
    `${command.action} sirens - Duration: ${command.duration}ms`
  );
  res.json({
    message: "Siren command processed",
    commandId: command.commandId,
  });
});

app.get("/siren-commands/office_floor_10", (req, res) => {
  res.json(sirenCommands);
});

// Office Floor 10 Beacon Command Endpoints
app.post("/beacon-commands/office_floor_10", (req, res) => {
  const command = req.body;
  command.timestamp = new Date().toISOString();
  command.commandId = `CMD_BEACON_OF10_${Date.now()}`;

  beaconCommands.push(command);
  if (beaconCommands.length > 20) {
    beaconCommands = beaconCommands.slice(-20);
  }

  logOfficeEvent(
    "BEACON COMMAND",
    `${command.action} beacons - Pattern: ${command.pattern}, Duration: ${command.duration}ms`
  );
  res.json({
    message: "Beacon command processed",
    commandId: command.commandId,
  });
});

app.get("/beacon-commands/office_floor_10", (req, res) => {
  res.json(beaconCommands);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    floor: "Office Floor 10",
    port: port,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(port, () => {
  console.log("=".repeat(60));
  console.log(`      OFFICE FLOOR 10 WEB SERVER STARTED`);
  console.log("=".repeat(60));
  console.log(`Server running on: http://localhost:${port}`);
  console.log(`Zone: Office Floor 10`);
  console.log(
    `Dashboard: http://localhost:5000 (if central dashboard is running)`
  );
  console.log("");
  console.log("Available Endpoints:");
  console.log(`POST /sensor-data           - Receive sensor data`);
  console.log(`POST /actuator-data         - Receive actuator data`);
  console.log(`GET  /sensor-data           - Get all sensor data`);
  console.log(`GET  /actuator-data         - Get all actuator data`);
  console.log(`GET  /alerts                - Get office alerts`);
  console.log(`GET  /stats                 - Get system statistics`);
  console.log(`POST/GET /siren-commands/office_floor_10    - Siren control`);
  console.log(`POST/GET /beacon-commands/office_floor_10   - Beacon control`);
  console.log(`GET  /health               - Health check`);
  console.log("");
  console.log("System Features:");
  console.log("Office security monitoring with alert detection");
  console.log("Motion and access control event logging");
  console.log("Command-controlled sirens and beacons");
  console.log("Real-time statistics and health monitoring");
  console.log("CORS enabled for dashboard integration");
  console.log("=".repeat(60));
});
