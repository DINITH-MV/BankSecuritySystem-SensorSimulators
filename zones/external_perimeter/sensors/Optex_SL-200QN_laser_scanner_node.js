import axios from "axios";

const SCANNER_CONFIGS = [
  { sensorId: "LS_001", location: "North Perimeter Gate" },
  { sensorId: "LS_002", location: "East Fence Line" },
  { sensorId: "LS_003", location: "South Perimeter" },
  { sensorId: "LS_004", location: "West Perimeter" },
];

const serverUrl = "http://localhost:3000";

function generateScannerData(config) {
  const obstacleDetected = Math.random() < 0.4;
  const distance = obstacleDetected
    ? Math.floor(Math.random() * 100) + 1
    : null;
  const beamStatus = Math.random() < 0.97 ? "operational" : "blocked";
  const signalStrength = Math.floor(Math.random() * 100) + 1;
  const ambientLight = Math.floor(Math.random() * 1000);

  return {
    sensorId: config.sensorId,
    sensorType: "Optex SL-200QN Laser Scanner",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      obstacleDetected,
      distance,
      beamStatus,
      signalStrength,
      ambientLight,
      detectionRange: 100,
      isActive: true,
    },
    status: "active",
  };
}

async function sendScannerDataToServer(scannerData) {
  try {
    await axios.post(`${serverUrl}/sensor-data`, scannerData, {
      headers: { "Content-Type": "application/json" },
    });

    if (scannerData.data.obstacleDetected && scannerData.data.distance < 50) {
      const severity = scannerData.data.distance < 20 ? "HIGH" : "MEDIUM";
      console.log(
        `LASER SCANNER ALERT: Object detected at ${scannerData.data.distance}m (${severity}) at ${scannerData.location}`
      );
    }

    console.log(
      `Laser Scanner ${scannerData.sensorId}: ${
        scannerData.data.obstacleDetected
          ? `OBSTACLE at ${scannerData.data.distance}m`
          : "Clear"
      }, Signal: ${scannerData.data.signalStrength}%`
    );
  } catch (error) {
    console.error(
      `Error sending data for ${scannerData.sensorId}:`,
      error.message
    );
  }
}

console.log(
  "Starting Optex SL-200QN Laser Scanner monitoring for 4 scanners..."
);

const interval = setInterval(() => {
  SCANNER_CONFIGS.forEach((config) => {
    const scannerData = generateScannerData(config);
    sendScannerDataToServer(scannerData);
  });
}, 3000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down laser scanners...");
  clearInterval(interval);
  process.exit(0);
});
