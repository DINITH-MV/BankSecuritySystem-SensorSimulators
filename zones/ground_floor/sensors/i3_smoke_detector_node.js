import axios from "axios";

const SMOKE_CONFIGS = [
  { sensorId: "SMOKE_001", location: "Main Lobby Ceiling" },
  { sensorId: "SMOKE_002", location: "Reception Area Ceiling" },
];

const serverUrl = "http://localhost:3001";

function generateSmokeData(config) {
  const smokeDetected = Math.random() < 0.005; // 0.5% chance of smoke
  const smokeDensity = smokeDetected
    ? Math.floor(Math.random() * 100) + 50 // 50-150 if smoke
    : Math.floor(Math.random() * 30); // 0-30 normal

  const temperature = Math.floor(Math.random() * 50) + 15; // 15-65°C
  const heatRiseRate = smokeDetected
    ? Math.floor(Math.random() * 10) + 5 // 5-15°C/min if fire
    : Math.floor(Math.random() * 3); // 0-3°C/min normal

  const batteryLevel = Math.floor(Math.random() * 100) + 1;
  const testMode = Math.random() < 0.02 ? "testing" : "normal";

  return {
    sensorId: config.sensorId,
    sensorType: "i3 Series Smoke Detector",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      smokeDetected: smokeDetected,
      smokeDensity: smokeDensity,
      temperature: temperature,
      heatRiseRate: heatRiseRate,
      batteryLevel: batteryLevel,
      testMode: testMode,
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

    if (sensorData.data.smokeDetected) {
      console.log(
        `FIRE ALERT - ${sensorData.sensorType}: Smoke density ${sensorData.data.smokeDensity}, Temp ${sensorData.data.temperature}°C at ${sensorData.location}`
      );
    } else if (sensorData.data.testMode === "testing") {
      console.log(
        `${sensorData.sensorType}: Self-test mode at ${sensorData.location}`
      );
    } else {
      console.log(
        `${sensorData.sensorType}: Normal operation (${sensorData.data.temperature}°C) at ${sensorData.location}`
      );
    }
  } catch (error) {
    console.error(
      `Error sending data from ${sensorData.sensorType}:`,
      error.message
    );
  }
}

console.log("Starting i3 Series Smoke Detector monitoring for ground floor...");

const interval = setInterval(() => {
  SMOKE_CONFIGS.forEach((config) => {
    const sensorData = generateSmokeData(config);
    sendDataToServer(sensorData);
  });
}, 3000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Ground Floor Smoke Detector Nodes...");
  clearInterval(interval);
  process.exit(0);
});
