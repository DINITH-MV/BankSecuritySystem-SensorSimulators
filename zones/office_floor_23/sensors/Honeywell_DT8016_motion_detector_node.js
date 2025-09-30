import axios from "axios";

const MOTION_CONFIGS = [
  {
    sensorId: "MOTION_OF23_016",
    location: "Office Floor 23 Main Entrance Foyer",
  },
  {
    sensorId: "MOTION_OF23_017",
    location: "Office Floor 23 Reception Checkpoint",
  },
];

const serverUrl = "http://localhost:3024";

function generateMotionData(config) {
  const motionDetected = Math.random() < 0.12; // 12% chance of motion
  const motionLevel = motionDetected
    ? Math.floor(Math.random() * 100) + 1 // 1-100% if motion
    : 0;

  const temperature = Math.floor(Math.random() * 30) + 18; // 18-48°C
  const sensitivity = ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)];
  const tamperStatus = Math.random() < 0.99 ? "secure" : "tampered";

  return {
    sensorId: config.sensorId,
    sensorType: "Honeywell DT8016 DualTech",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      motionDetected: motionDetected,
      motionLevel: motionLevel,
      temperature: temperature,
      sensitivity: sensitivity,
      tamperStatus: tamperStatus,
    },
  };
}

async function sendDataToServer(sensorData) {
  try {
    await axios.post(`${serverUrl}/sensor-data`, sensorData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (sensorData.data.motionDetected) {
      console.log(
        `MOTION DETECTED - ${sensorData.sensorType}: Level ${sensorData.data.motionLevel}% at ${sensorData.location}`
      );
    } else {
      console.log(
        `${sensorData.sensorType}: Area secure at ${sensorData.location}`
      );
    }
  } catch (error) {
    console.error(
      `Error sending data from ${sensorData.sensorType}:`,
      error.message
    );
  }
}

console.log(
  "Starting Honeywell DT8016 DualTech Motion Detector for Office Floor 23..."
);

const interval = setInterval(() => {
  MOTION_CONFIGS.forEach((config) => {
    const sensorData = generateMotionData(config);
    sendDataToServer(sensorData);
  });
}, 5000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log(
    "\nShutting down Office Floor 23 Honeywell Motion Detector Nodes..."
  );
  clearInterval(interval);
  process.exit(0);
});
