import axios from "axios";

const CAMERA_CONFIGS = [
  { sensorId: "CAM_001", location: "Main Lobby Entrance" },
  { sensorId: "CAM_002", location: "Reception Area" },
  { sensorId: "CAM_003", location: "Ground Floor Elevator Bay" },
  { sensorId: "CAM_004", location: "Emergency Exit Corridor" },
];

const serverUrl = "http://localhost:3001";

function generateSensorData(config, isRecording) {
  const motionDetected = Math.random() < 0.4;
  const faceDetected = motionDetected && Math.random() < 0.4;
  const explosionProtectionActive = Math.random() < 0.99;
  const videoQuality = ["1080p", "4K", "720p"][Math.floor(Math.random() * 3)];
  const nightVision = Math.random() < 0.5 ? "active" : "inactive";
  const storageUsed = Math.floor(Math.random() * 100) + 1;

  // Simulate suspicious behavior (e.g., loitering, tampering)
  const suspiciousBehavior = Math.random() < 0.3;

  let nextIsRecording = isRecording;
  if (motionDetected && !isRecording) {
    nextIsRecording = true;
  } else if (!motionDetected && isRecording) {
    nextIsRecording = Math.random() < 0.4;
  }

  // Security relevant if motion, face, or suspicious behavior detected
  const securityRelevant = motionDetected || faceDetected || suspiciousBehavior;

  return {
    sensorId: config.sensorId,
    sensorType: "AXIS XFQ1656 Camera",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      motionDetected,
      faceDetected,
      suspiciousBehavior,
      isRecording: nextIsRecording,
      videoQuality,
      nightVision,
      explosionProtectionActive,
      storageUsed,
      securityRelevant,
    },
    _isRecording: nextIsRecording, // for internal state
  };
}

async function sendDataToServer(sensorData) {
  try {
    await axios.post(`${serverUrl}/sensor-data`, sensorData, {
      headers: { "Content-Type": "application/json" },
    });

    if (sensorData.data.securityRelevant) {
      let details = [];
      if (sensorData.data.motionDetected) details.push("motion");
      if (sensorData.data.faceDetected) details.push("face");
      if (sensorData.data.suspiciousBehavior)
        details.push("suspicious behavior");
      console.log(
        `SECURITY EVENT - ${sensorData.sensorType}: ${details.join(
          ", "
        )} detected (${sensorData.location})`
      );
    } else if (sensorData.data.isRecording) {
      console.log(
        `${sensorData.sensorType}: Still recording... (${sensorData.location})`
      );
    } else {
      console.log(
        `${sensorData.sensorType}: Monitoring (${sensorData.data.videoQuality}) (${sensorData.location})`
      );
    }
  } catch (error) {
    console.error(
      `Error sending data from ${sensorData.sensorType}:`,
      error.message
    );
  }
}

// State for each camera
const cameraStates = CAMERA_CONFIGS.map(() => false); // isRecording for each camera

console.log(
  "Starting AXIS XFQ1656 Camera monitoring for ground floor cameras..."
);

const interval = setInterval(() => {
  CAMERA_CONFIGS.forEach((config, idx) => {
    const sensorData = generateSensorData(config, cameraStates[idx]);
    cameraStates[idx] = sensorData._isRecording;
    sendDataToServer(sensorData);
  });
}, 2500);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Ground Floor Camera Nodes...");
  clearInterval(interval);
  process.exit(0);
});
