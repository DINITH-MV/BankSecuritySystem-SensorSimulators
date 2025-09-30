import axios from "axios";

const CAMERA_CONFIGS = [
  { sensorId: "CAM_H5_001", location: "Executive Office A Entrance" },
  { sensorId: "CAM_H5_002", location: "Executive Office B Entrance" },
  { sensorId: "CAM_H5_003", location: "Conference Room Alpha Main View" },
  { sensorId: "CAM_H5_004", location: "Conference Room Beta Main View" },
  { sensorId: "CAM_H5_005", location: "High Security Corridor East" },
  { sensorId: "CAM_H5_006", location: "High Security Corridor West" },
  { sensorId: "CAM_H5_007", location: "Server Room A Entry Point" },
  { sensorId: "CAM_H5_008", location: "Server Room B Entry Point" },
  { sensorId: "CAM_H5_009", location: "Data Center Main Floor" },
  { sensorId: "CAM_H5_010", location: "Executive Floor Elevator Bay" },
];

const serverUrl = "http://localhost:3100";

function generateSensorData(config, isRecording) {
  const motionDetected = Math.random() < 0.1;
  const faceDetected = motionDetected && Math.random() < 0.3;
  const explosionProtectionActive = Math.random() < 0.99;
  const videoQuality = ["1080p", "4K", "720p"][Math.floor(Math.random() * 3)];
  const nightVision = Math.random() < 0.5 ? "active" : "inactive";
  const storageUsed = Math.floor(Math.random() * 100) + 1;

  // Simulate suspicious behavior (e.g., loitering, tampering)
  const suspiciousBehavior = Math.random() < 0.05;

  let nextIsRecording = isRecording;
  if (motionDetected && !isRecording) {
    nextIsRecording = true;
  } else if (!motionDetected && isRecording) {
    nextIsRecording = Math.random() < 0.3;
  }

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
  "Starting AXIS XFQ1656 Camera monitoring for high security floor 5 cameras..."
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
  console.log("\nShutting down High Security Floor 5 Camera Nodes...");
  clearInterval(interval);
  process.exit(0);
});
