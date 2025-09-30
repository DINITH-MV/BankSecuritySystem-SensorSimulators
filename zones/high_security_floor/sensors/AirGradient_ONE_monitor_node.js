import axios from "axios";

const ENVIRONMENTAL_CONFIGS = [
  { sensorId: "ENV_001", location: "Server Room A Environmental Control" },
  { sensorId: "ENV_002", location: "Server Room B Environmental Control" },
  { sensorId: "ENV_003", location: "Data Center Climate Control" },
  { sensorId: "ENV_004", location: "Critical Systems Environmental Monitor" },
];

const serverUrl = "http://localhost:3100";

function generateEnvironmentalData(config) {
  const pm25 = Math.floor(Math.random() * 150) + 5; // 5-155 μg/m³
  const pm10 = pm25 + Math.floor(Math.random() * 50); // PM10 > PM2.5
  const co2 = Math.floor(Math.random() * 2000) + 400; // 400-2400 ppm
  const tvoc = Math.floor(Math.random() * 1000) + 50; // 50-1050 ppb
  const nox = Math.floor(Math.random() * 200) + 10; // 10-210 ppb
  const temperature = Math.floor(Math.random() * 30) + 15; // 15-45°C
  const humidity = Math.floor(Math.random() * 80) + 20; // 20-100%

  return {
    sensorId: config.sensorId,
    sensorType: "AirGradient ONE Environmental Monitor",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      pm25: pm25,
      pm10: pm10,
      co2: co2,
      tvoc: tvoc,
      nox: nox,
      temperature: temperature,
      humidity: humidity,
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

    console.log(
      `${sensorData.sensorType}: (CO2: ${sensorData.data.co2}ppm, ${sensorData.data.temperature}°C) at ${sensorData.location}`
    );
  } catch (error) {
    console.error(
      `Error sending data from ${sensorData.sensorType}:`,
      error.message
    );
  }
}

console.log(
  "Starting AirGradient Environmental Monitor for high security floor 5 server rooms..."
);

const interval = setInterval(() => {
  ENVIRONMENTAL_CONFIGS.forEach((config) => {
    const sensorData = generateEnvironmentalData(config);
    sendDataToServer(sensorData);
  });
}, 6000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log(
    "\nShutting down High Security Floor 5 Environmental Monitor Nodes..."
  );
  clearInterval(interval);
  process.exit(0);
});
