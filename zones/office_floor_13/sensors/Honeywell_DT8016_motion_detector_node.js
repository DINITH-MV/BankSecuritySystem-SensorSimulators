import axios from "axios";

const HONEYWELL_CONFIGS = [
  {
    sensorId: "HONEY_OF13_001",
    location: "Office Floor 13 Reception Area",
  },
  {
    sensorId: "HONEY_OF13_002",
    location: "Office Floor 13 Executive Office Entrance",
  },
];

const serverUrl = "http://localhost:3014";

function generateHoneywellData(config) {
  const motionDetected = Math.random() < 0.1; // 10% chance of motion
  const temperature = Math.floor(Math.random() * 8) + 20; // 20-28°C

  const sensorData = {
    sensorId: config.sensorId,
    sensorType: "Honeywell DT8016 DualTech",
    location: config.location,
    timestamp: new Date().toISOString(),
    active: true,
    status: "operational",
    type: "dual_technology_motion",
    data: {
      motionDetected: motionDetected,
      motionLevel: motionDetected ? Math.floor(Math.random() * 60) + 40 : 0, // 40-100% if motion
      temperature: temperature,
      pirSensor: motionDetected ? "triggered" : "idle",
      microwaveSensor:
        motionDetected && Math.random() < 0.75 ? "triggered" : "idle", // 75% correlation
      dualTechConfirmed: motionDetected,
      sensitivity: Math.floor(Math.random() * 20) + 75, // 75-95%
      coveragePattern: "360° ceiling mount",
      detectionRange: "8m radius",
      batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
      signalQuality: Math.floor(Math.random() * 25) + 75, // 75-100%
      tamperStatus: Math.random() < 0.001 ? "tampered" : "secure", // 0.1% chance
      lastCalibration: new Date(
        Date.now() - Math.floor(Math.random() * 21) * 24 * 60 * 60 * 1000
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
      `Honeywell sensor ${sensorData.sensorId} data sent successfully - Motion: ${sensorData.data.motionDetected}, Temp: ${sensorData.data.temperature}°C`
    );
  } catch (error) {
    console.error(
      `Error sending Honeywell sensor data for ${sensorData.sensorId}:`,
      error.code || error.message
    );
  }
}

function startHoneywellSensors() {
  console.log("Starting Office Floor 13 Honeywell DT8016 Motion Detectors...");
  console.log(`Server URL: ${serverUrl}`);
  console.log(`Total Honeywell sensors: ${HONEYWELL_CONFIGS.length}`);

  HONEYWELL_CONFIGS.forEach((config, index) => {
    setTimeout(() => {
      setInterval(() => {
        const sensorData = generateHoneywellData(config);
        sendSensorData(sensorData);
      }, 4500); // Send data every 4.5 seconds
    }, index * 650); // Stagger start times by 650ms
  });

  console.log("All Office Floor 13 Honeywell sensors started");
}

startHoneywellSensors();

process.on("SIGINT", () => {
  console.log("Shutting down Office Floor 13 Honeywell sensors...");
  process.exit(0);
});
