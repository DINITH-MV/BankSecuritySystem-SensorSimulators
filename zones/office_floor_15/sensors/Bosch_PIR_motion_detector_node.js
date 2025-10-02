import axios from "axios";

const MOTION_CONFIGS = [
  {
    sensorId: "MOTION_OF15_001",
    location: "Office Floor 15 Open Office Area A - North",
  },
  {
    sensorId: "MOTION_OF15_002",
    location: "Office Floor 15 Open Office Area A - South",
  },
  {
    sensorId: "MOTION_OF15_003",
    location: "Office Floor 15 Open Office Area A - East",
  },
  {
    sensorId: "MOTION_OF15_004",
    location: "Office Floor 15 Open Office Area A - West",
  },
  {
    sensorId: "MOTION_OF15_005",
    location: "Office Floor 15 Open Office Area B - North",
  },
  {
    sensorId: "MOTION_OF15_006",
    location: "Office Floor 15 Open Office Area B - South",
  },
  {
    sensorId: "MOTION_OF15_007",
    location: "Office Floor 15 Open Office Area B - East",
  },
  {
    sensorId: "MOTION_OF15_008",
    location: "Office Floor 15 Open Office Area B - West",
  },
  { sensorId: "MOTION_OF15_009", location: "Office Floor 15 Meeting Room A" },
  { sensorId: "MOTION_OF15_010", location: "Office Floor 15 Meeting Room B" },
  { sensorId: "MOTION_OF15_011", location: "Office Floor 15 Meeting Room C" },
  { sensorId: "MOTION_OF15_012", location: "Office Floor 15 Corridor North" },
  { sensorId: "MOTION_OF15_013", location: "Office Floor 15 Corridor South" },
  { sensorId: "MOTION_OF15_014", location: "Office Floor 15 Corridor East" },
  { sensorId: "MOTION_OF15_015", location: "Office Floor 15 Corridor West" },
];

const serverUrl = "http://localhost:3016";

function generateMotionData(config) {
  const motionDetected = Math.random() < 0.4; // 8% chance of motion
  const heatSignature = motionDetected
    ? Math.floor(Math.random() * 15) + 25 // 25-40°C if motion
    : Math.floor(Math.random() * 10) + 15; // 15-25°C ambient

  const sensorData = {
    sensorId: config.sensorId,
    sensorType: "Bosch Blue Line PIR",
    location: config.location,
    timestamp: new Date().toISOString(),
    active: true,
    status: "operational",
    type: "motion_detection",
    data: {
      motionDetected: motionDetected,
      heatSignature: heatSignature,
      sensitivity: Math.floor(Math.random() * 20) + 80, // 80-100%
      detectionRange: "6m radius",
      batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
      signalStrength: Math.floor(Math.random() * 30) + 70, // 70-100%
      tamperStatus: Math.random() < 0.001 ? "tampered" : "secure", // 0.1% chance
      lastCalibration: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
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
      `Motion sensor ${sensorData.sensorId} data sent successfully - Motion: ${sensorData.data.motionDetected}`
    );
  } catch (error) {
    console.error(
      `Error sending motion sensor data for ${sensorData.sensorId}:`,
      error.code || error.message
    );
  }
}

function startMotionSensors() {
  console.log("Starting Office Floor 15 Bosch PIR Motion Detection Sensors...");
  console.log(`Server URL: ${serverUrl}`);
  console.log(`Total sensors: ${MOTION_CONFIGS.length}`);

  MOTION_CONFIGS.forEach((config, index) => {
    setTimeout(() => {
      setInterval(() => {
        const sensorData = generateMotionData(config);
        sendSensorData(sensorData);
      }, 4000); // Send data every 4 seconds
    }, index * 500); // Stagger start times by 500ms
  });

  console.log("All Office Floor 15 motion sensors started");
}

startMotionSensors();

process.on("SIGINT", () => {
  console.log("Shutting down Office Floor 15 motion sensors...");
  process.exit(0);
});
