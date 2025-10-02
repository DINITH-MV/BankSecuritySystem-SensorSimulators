import axios from "axios";

const MOTION_CONFIGS = [
  { sensorId: "MOTION_H5_001", location: "Executive Office A Motion Sensor 1" },
  { sensorId: "MOTION_H5_002", location: "Executive Office A Motion Sensor 2" },
  { sensorId: "MOTION_H5_003", location: "Executive Office B Motion Sensor 1" },
  { sensorId: "MOTION_H5_004", location: "Executive Office B Motion Sensor 2" },
  {
    sensorId: "MOTION_H5_005",
    location: "Conference Room Alpha Motion Sensor 1",
  },
  {
    sensorId: "MOTION_H5_006",
    location: "Conference Room Alpha Motion Sensor 2",
  },
  {
    sensorId: "MOTION_H5_007",
    location: "Conference Room Beta Motion Sensor 1",
  },
  {
    sensorId: "MOTION_H5_008",
    location: "Conference Room Beta Motion Sensor 2",
  },
  { sensorId: "MOTION_H5_009", location: "High Security Corridor Central" },
  { sensorId: "MOTION_H5_010", location: "Executive Floor Elevator Bay" },
  { sensorId: "MOTION_H5_011", location: "High Security Reception Area" },
  { sensorId: "MOTION_H5_012", location: "Executive Floor Stairwell Access" },
  { sensorId: "MOTION_H5_013", location: "Data Center Perimeter" },
  { sensorId: "MOTION_H5_014", location: "Server Room Access Corridor" },
];

const serverUrl = "http://localhost:3100";

function generateMotionData(config) {
  const motionDetected = Math.random() < 0.4; // 8% chance of motion
  const heatSignature = motionDetected
    ? Math.floor(Math.random() * 15) + 25 // 25-40°C if motion
    : Math.floor(Math.random() * 10) + 15; // 15-25°C ambient

  const petImmunity = Math.random() < 0.95; // 95% pet immunity accuracy
  const tamperStatus = Math.random() < 0.99 ? "secure" : "tampered";

  return {
    sensorId: config.sensorId,
    sensorType: "Bosch Blue Line PIR",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      motionDetected: motionDetected,
      petImmunity: petImmunity,
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
        `MOTION DETECTED - ${sensorData.sensorType}: Heat signature ${sensorData.data.heatSignature}°C at ${sensorData.location}`
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
  "Starting Bosch PIR Motion Detector monitoring for high security floor 5 sensors..."
);

const interval = setInterval(() => {
  MOTION_CONFIGS.forEach((config) => {
    const sensorData = generateMotionData(config);
    sendDataToServer(sensorData);
  });
}, 4000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down High Security Floor 5 Motion Detector Nodes...");
  clearInterval(interval);
  process.exit(0);
});
