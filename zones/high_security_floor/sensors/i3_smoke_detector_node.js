import axios from "axios";

const SMOKE_CONFIGS = [
  { sensorId: "SMOKE_H5_001", location: "Executive Office A Ceiling" },
  { sensorId: "SMOKE_H5_002", location: "Executive Office B Ceiling" },
  { sensorId: "SMOKE_H5_003", location: "Conference Room Alpha Ceiling" },
  { sensorId: "SMOKE_H5_004", location: "Conference Room Beta Ceiling" },
  { sensorId: "SMOKE_H5_005", location: "High Security Corridor Ceiling" },
  { sensorId: "SMOKE_H5_006", location: "Server Room A Fire Suppression Zone" },
  { sensorId: "SMOKE_H5_007", location: "Server Room B Fire Suppression Zone" },
  { sensorId: "SMOKE_H5_008", location: "Data Center Fire Detection System" },
];

const serverUrl = "http://localhost:3100";

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
        `HIGH SECURITY FIRE ALERT - ${sensorData.sensorType}: Smoke density ${sensorData.data.smokeDensity}, Temp ${sensorData.data.temperature}°C at ${sensorData.location}`
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

console.log(
  "Starting i3 Series Smoke Detector monitoring for high security floor 5..."
);

const interval = setInterval(() => {
  SMOKE_CONFIGS.forEach((config) => {
    const sensorData = generateSmokeData(config);
    sendDataToServer(sensorData);
  });
}, 3000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down High Security Floor 5 Smoke Detector Nodes...");
  clearInterval(interval);
  process.exit(0);
});
