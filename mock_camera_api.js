import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

app.use(express.json());

// Ensure logs directory exists
const logsDir = path.join(__dirname, "camera_logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Mock camera recording endpoint
app.post("/api/camera/start-recording", (req, res) => {
  const {
    camera_id,
    zone,
    duration,
    quality,
    trigger_reason,
    threat_level,
    timestamp,
  } = req.body;

  console.log(`Recording Started:`, {
    camera: camera_id,
    zone: zone,
    duration: duration + "s",
    quality: quality,
    reason: trigger_reason,
    threat_level: threat_level,
    timestamp: timestamp || new Date().toISOString(),
  });

  // Log recording request to file
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: "recording_started",
    camera_id,
    zone,
    duration,
    quality,
    trigger_reason,
    threat_level,
    original_timestamp: timestamp,
  };

  const logFile = path.join(
    logsDir,
    `recordings_${new Date().toISOString().split("T")[0]}.json`
  );
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");

  // Simulate different response scenarios based on camera or zone
  if (camera_id && camera_id.includes("CAM_H5")) {
    // High security cameras get immediate response
    res.json({
      success: true,
      recording_id: `REC_${Date.now()}_${camera_id}`,
      camera_id: camera_id,
      zone: zone,
      status: "recording_started",
      duration: duration,
      quality: quality,
      priority: "high",
      estimated_completion: new Date(
        Date.now() + duration * 1000
      ).toISOString(),
      pre_recording_seconds: 5,
      post_recording_seconds: 10,
    });
  } else {
    // Standard cameras
    res.json({
      success: true,
      recording_id: `REC_${Date.now()}_${camera_id}`,
      camera_id: camera_id,
      zone: zone,
      status: "recording_started",
      duration: duration,
      quality: quality || "standard",
      priority: "normal",
      estimated_completion: new Date(
        Date.now() + duration * 1000
      ).toISOString(),
    });
  }
});

// Stop recording endpoint
app.post("/api/camera/stop-recording", (req, res) => {
  const { recording_id, camera_id } = req.body;

  console.log(`Recording Stopped:`, {
    recording_id,
    camera_id,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    recording_id,
    camera_id,
    status: "recording_stopped",
    file_location: `/recordings/${recording_id}.mp4`,
    file_size_mb: Math.floor(Math.random() * 500) + 100, // Random size 100-600MB
  });
});

// Get recording status
app.get("/api/camera/recording/:recordingId/status", (req, res) => {
  const { recordingId } = req.params;

  const statuses = ["recording", "processing", "completed", "failed"];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  res.json({
    recording_id: recordingId,
    status: randomStatus,
    progress:
      randomStatus === "recording" ? Math.floor(Math.random() * 100) : 100,
    timestamp: new Date().toISOString(),
  });
});

// List all cameras
app.get("/api/cameras", (req, res) => {
  const cameras = [
    {
      id: "CAM_H5_001",
      zone: "high_security_floor",
      location: "Executive Office A Entrance",
      status: "online",
    },
    {
      id: "CAM_H5_002",
      zone: "high_security_floor",
      location: "Executive Office B Entrance",
      status: "online",
    },
    {
      id: "CAM_H5_003",
      zone: "high_security_floor",
      location: "Conference Room Alpha Main View",
      status: "online",
    },
    {
      id: "CAM_H5_004",
      zone: "high_security_floor",
      location: "Conference Room Beta Main View",
      status: "online",
    },
    {
      id: "CAM_GF_001",
      zone: "ground_floor",
      location: "Main Entrance",
      status: "online",
    },
    {
      id: "CAM_GF_002",
      zone: "ground_floor",
      location: "Lobby Area",
      status: "online",
    },
    {
      id: "CAM_EXT_001",
      zone: "external_perimeter",
      location: "North Perimeter",
      status: "online",
    },
    {
      id: "CAM_EXT_002",
      zone: "external_perimeter",
      location: "South Perimeter",
      status: "online",
    },
  ];

  res.json({ cameras, total: cameras.length });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "mock_camera_api",
    version: "1.0.0",
  });
});

// Error simulation endpoint (for testing error handling)
app.post("/api/camera/simulate-error", (req, res) => {
  const { error_type } = req.body;

  switch (error_type) {
    case "timeout":
      // Don't respond (simulate timeout)
      return;
    case "server_error":
      res
        .status(500)
        .json({ error: "Internal server error", code: "SERVER_ERROR" });
      break;
    case "unauthorized":
      res
        .status(401)
        .json({ error: "Unauthorized access", code: "UNAUTHORIZED" });
      break;
    case "camera_offline":
      res.status(503).json({ error: "Camera offline", code: "CAMERA_OFFLINE" });
      break;
    default:
      res
        .status(400)
        .json({ error: "Unknown error type", code: "BAD_REQUEST" });
  }
});

// CORS middleware for testing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.listen(port, () => {
  console.log(`Mock Camera API Server Started`);
  console.log(`Server URL: http://localhost:${port}`);
  console.log(
    `Recording endpoint: http://localhost:${port}/api/camera/start-recording`
  );
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Cameras list: http://localhost:${port}/api/cameras`);
  console.log(`Logs directory: ${logsDir}`);
  console.log(`\nReady to receive recording requests from Node-RED!`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Mock Camera API Server...");
  process.exit(0);
});
