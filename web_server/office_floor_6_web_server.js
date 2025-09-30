import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3007;

// Storage for sensor data and actuator commands
let sensorDataStore = [];
let actuatorCommandStore = {};

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    zone: "office_floor_6",
    server: "Office Floor 6 Web Server",
    port: PORT,
  });
});

// Sensor data endpoints
app.post("/sensor-data", (req, res) => {
  const sensorData = req.body;
  sensorData.receivedAt = new Date().toISOString();

  // Store the sensor data
  sensorDataStore.push(sensorData);

  // Keep only the last 1000 readings to prevent memory issues
  if (sensorDataStore.length > 1000) {
    sensorDataStore = sensorDataStore.slice(-1000);
  }

  console.log(
    `Received sensor data from ${sensorData.sensorType}: ${sensorData.sensorId} at ${sensorData.location}`
  );

  res.status(200).json({
    message: "Sensor data received successfully",
    timestamp: new Date().toISOString(),
  });
});

app.get("/sensor-data", (req, res) => {
  const { sensorType, limit = 50 } = req.query;

  let filteredData = sensorDataStore;

  if (sensorType) {
    filteredData = sensorDataStore.filter(
      (data) => data.sensorType === sensorType
    );
  }

  // Return the most recent data first
  const recentData = filteredData
    .slice(-parseInt(limit))
    .reverse()
    .map((data) => ({
      ...data,
      zone: "office_floor_6",
    }));

  res.json(recentData);
});

app.get("/sensor-data/:sensorId", (req, res) => {
  const { sensorId } = req.params;
  const sensorData = sensorDataStore.filter(
    (data) => data.sensorId === sensorId
  );

  if (sensorData.length === 0) {
    return res.status(404).json({
      error: "Sensor not found",
      sensorId: sensorId,
    });
  }

  res.json({
    sensorId: sensorId,
    totalReadings: sensorData.length,
    latestReading: sensorData[sensorData.length - 1],
    zone: "office_floor_6",
  });
});

// Actuator data endpoint
app.post("/actuator-data", (req, res) => {
  const actuatorData = req.body;
  actuatorData.receivedAt = new Date().toISOString();

  console.log(
    `Received actuator data from ${actuatorData.deviceType}: ${
      actuatorData.sirenId || actuatorData.beaconId
    } at ${actuatorData.location}`
  );

  res.status(200).json({
    message: "Actuator data received successfully",
    timestamp: new Date().toISOString(),
  });
});

// Siren command endpoints
app.post("/siren-commands/:zone", (req, res) => {
  const { zone } = req.params;
  const command = req.body;

  if (!actuatorCommandStore[zone]) {
    actuatorCommandStore[zone] = {};
  }

  if (!actuatorCommandStore[zone].sirens) {
    actuatorCommandStore[zone].sirens = [];
  }

  actuatorCommandStore[zone].sirens.push({
    ...command,
    receivedAt: new Date().toISOString(),
  });

  console.log(
    `Stored siren command for zone ${zone}: ${
      command.active ? "ACTIVATE" : "DEACTIVATE"
    }`
  );

  res.json({
    message: "Siren command stored successfully",
    zone: zone,
    timestamp: new Date().toISOString(),
  });
});

app.get("/siren-commands/:zone", (req, res) => {
  const { zone } = req.params;

  if (
    !actuatorCommandStore[zone] ||
    !actuatorCommandStore[zone].sirens ||
    actuatorCommandStore[zone].sirens.length === 0
  ) {
    return res.status(404).json({
      message: "No siren commands found",
      zone: zone,
    });
  }

  const commands = actuatorCommandStore[zone].sirens;

  // Clear commands after retrieving them
  actuatorCommandStore[zone].sirens = [];

  res.json(commands);
});

// Beacon command endpoints
app.post("/beacon-commands/:zone", (req, res) => {
  const { zone } = req.params;
  const command = req.body;

  if (!actuatorCommandStore[zone]) {
    actuatorCommandStore[zone] = {};
  }

  if (!actuatorCommandStore[zone].beacons) {
    actuatorCommandStore[zone].beacons = [];
  }

  actuatorCommandStore[zone].beacons.push({
    ...command,
    receivedAt: new Date().toISOString(),
  });

  console.log(
    `Stored beacon command for zone ${zone}: ${
      command.active ? "ACTIVATE" : "DEACTIVATE"
    }`
  );

  res.json({
    message: "Beacon command stored successfully",
    zone: zone,
    timestamp: new Date().toISOString(),
  });
});

app.get("/beacon-commands/:zone", (req, res) => {
  const { zone } = req.params;

  if (
    !actuatorCommandStore[zone] ||
    !actuatorCommandStore[zone].beacons ||
    actuatorCommandStore[zone].beacons.length === 0
  ) {
    return res.status(404).json({
      message: "No beacon commands found",
      zone: zone,
    });
  }

  const commands = actuatorCommandStore[zone].beacons;

  // Clear commands after retrieving them
  actuatorCommandStore[zone].beacons = [];

  res.json(commands);
});

// Statistics endpoint
app.get("/stats", (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const recentData = sensorDataStore.filter(
    (data) => new Date(data.timestamp) > oneHourAgo
  );

  const sensorTypes = [
    ...new Set(sensorDataStore.map((data) => data.sensorType)),
  ];
  const sensorCounts = {};

  sensorTypes.forEach((type) => {
    sensorCounts[type] = sensorDataStore.filter(
      (data) => data.sensorType === type
    ).length;
  });

  res.json({
    zone: "office_floor_6",
    timestamp: new Date().toISOString(),
    totalSensorReadings: sensorDataStore.length,
    recentReadings: recentData.length,
    sensorTypes: sensorTypes,
    sensorCounts: sensorCounts,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Zone status endpoint
app.get("/zone-status", (req, res) => {
  const latestSensorData = {};

  // Get latest reading for each sensor
  sensorDataStore.forEach((data) => {
    if (
      !latestSensorData[data.sensorId] ||
      new Date(data.timestamp) >
        new Date(latestSensorData[data.sensorId].timestamp)
    ) {
      latestSensorData[data.sensorId] = data;
    }
  });

  const activeSensors = Object.values(latestSensorData).filter(
    (data) => new Date() - new Date(data.timestamp) < 60000 // Active in last minute
  );

  res.json({
    zone: "office_floor_6",
    timestamp: new Date().toISOString(),
    status: "operational",
    totalSensors: Object.keys(latestSensorData).length,
    activeSensors: activeSensors.length,
    sensorData: latestSensorData,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.url,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Office Floor 6 Web Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Statistics: http://localhost:${PORT}/stats`);
  console.log(`Zone status: http://localhost:${PORT}/zone-status`);
  console.log(`Sensor data: http://localhost:${PORT}/sensor-data`);
  console.log(`Server started at ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Office Floor 6 Web Server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down Office Floor 6 Web Server...");
  process.exit(0);
});
