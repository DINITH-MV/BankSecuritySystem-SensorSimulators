import axios from "axios";

const CAMERA_CONFIGS = [
  {
    cameraId: "CAM_OF13_001",
    location: "Office Floor 13 Open Office Area A - Northeast Corner",
  },
  {
    cameraId: "CAM_OF13_002",
    location: "Office Floor 13 Open Office Area B - Southeast Corner",
  },
  {
    cameraId: "CAM_OF13_003",
    location: "Office Floor 13 Meeting Room A - Ceiling Mount",
  },
  {
    cameraId: "CAM_OF13_004",
    location: "Office Floor 13 Corridor - Central Junction",
  },
];

const serverUrl = "http://localhost:3014";

function generateCameraData(config) {
  const motionDetected = Math.random() < 0.12; // 12% chance of motion
  const faceDetected = motionDetected && Math.random() < 0.65; // 65% chance if motion
  const suspiciousBehavior = faceDetected && Math.random() < 0.15; // 15% chance if face detected

  const sensorData = {
    sensorId: config.cameraId,
    sensorType: "AXIS XFQ1656 Camera",
    location: config.location,
    timestamp: new Date().toISOString(),
    active: true,
    status: "operational",
    type: "security_camera",
    data: {
      motionDetected: motionDetected,
      faceDetected: faceDetected,
      suspiciousBehavior: suspiciousBehavior,
      securityRelevant: motionDetected || faceDetected || suspiciousBehavior,
      resolution: "1920x1080",
      frameRate: 30,
      nightVision: new Date().getHours() < 7 || new Date().getHours() > 19,
      recordingActive: motionDetected || suspiciousBehavior,
      storageUsed: Math.floor(Math.random() * 40) + 60, // 60-100%
      networkLatency: Math.floor(Math.random() * 20) + 10, // 10-30ms
      tamperStatus: Math.random() < 0.001 ? "tampered" : "secure", // 0.1% chance
      focusQuality: Math.floor(Math.random() * 20) + 80, // 80-100%
      lastMaintenanceCheck: new Date(
        Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  };

  return sensorData;
}

async function sendSensorData(sensorData) {
  try {
    await axios.post(`${serverUrl}/sensor-data`, sensorData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(
      `Camera ${sensorData.sensorId} data sent successfully - Motion: ${sensorData.data.motionDetected}, Face: ${sensorData.data.faceDetected}, Suspicious: ${sensorData.data.suspiciousBehavior}`
    );
  } catch (error) {
    console.error(
      `Error sending camera data for ${sensorData.sensorId}:`,
      error.code || error.message
    );
  }
}

function startCameraSensors() {
  console.log("Starting Office Floor 13 AXIS XFQ1656 Security Cameras...");
  console.log(`Server URL: ${serverUrl}`);
  console.log(`Total cameras: ${CAMERA_CONFIGS.length}`);

  CAMERA_CONFIGS.forEach((config, index) => {
    setTimeout(() => {
      setInterval(() => {
        const sensorData = generateCameraData(config);
        sendSensorData(sensorData);
      }, 6000); // Send data every 6 seconds
    }, index * 750); // Stagger start times by 750ms
  });

  console.log("All Office Floor 13 security cameras started");
}

startCameraSensors();

process.on("SIGINT", () => {
  console.log("Shutting down Office Floor 13 security cameras...");
  process.exit(0);
});
