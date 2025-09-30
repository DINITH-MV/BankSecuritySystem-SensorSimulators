import axios from "axios";

const MOTION_CONFIGS = [
  {
    sensorId: "MOTION_OF12_001",
    location: "Office Floor 12 Open Office Area A - North",
  },
  {
    sensorId: "MOTION_OF12_002",
    location: "Office Floor 12 Open Office Area A - South",
  },
  {
    sensorId: "MOTION_OF12_003",
    location: "Office Floor 12 Open Office Area A - East",
  },
  {
    sensorId: "MOTION_OF12_004",
    location: "Office Floor 12 Open Office Area A - West",
  },
  {
    sensorId: "MOTION_OF12_005",
    location: "Office Floor 12 Open Office Area B - North",
  },
  {
    sensorId: "MOTION_OF12_006",
    location: "Office Floor 12 Open Office Area B - South",
  },
  {
    sensorId: "MOTION_OF12_007",
    location: "Office Floor 12 Open Office Area B - East",
  },
  {
    sensorId: "MOTION_OF12_008",
    location: "Office Floor 12 Open Office Area B - West",
  },
  { sensorId: "MOTION_OF12_009", location: "Office Floor 12 Meeting Room A" },
  { sensorId: "MOTION_OF12_010", location: "Office Floor 12 Meeting Room B" },
  { sensorId: "MOTION_OF12_011", location: "Office Floor 12 Meeting Room C" },
  { sensorId: "MOTION_OF12_012", location: "Office Floor 12 Corridor North" },
  { sensorId: "MOTION_OF12_013", location: "Office Floor 12 Corridor South" },
  { sensorId: "MOTION_OF12_014", location: "Office Floor 12 Corridor East" },
  { sensorId: "MOTION_OF12_015", location: "Office Floor 12 Corridor West" },
];

const serverUrl = "http://localhost:3013";

function generateMotionData(config) {
  const motionDetected = Math.random() < 0.08; // 8% chance of motion
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
      heatSignature: heatSignature,
      petImmunity: petImmunity,
      tamperStatus: tamperStatus,
      sensitivity: "MEDIUM",
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
  "Starting Bosch PIR Motion Detector monitoring for Office Floor 12 sensors..."
);

const interval = setInterval(() => {
  MOTION_CONFIGS.forEach((config) => {
    const sensorData = generateMotionData(config);
    sendDataToServer(sensorData);
  });
}, 4000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Office Floor 12 Motion Detector Nodes...");
  clearInterval(interval);
  process.exit(0);
});
