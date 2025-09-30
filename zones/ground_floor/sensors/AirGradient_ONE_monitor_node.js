import axios from "axios";

const ENVIRONMENTAL_CONFIGS = [
  { sensorId: "ENV_001", location: "Ground Floor Lobby Environmental Monitor" },
  { sensorId: "ENV_002", location: "Ground Floor Reception Area" },
  { sensorId: "ENV_003", location: "Ground Floor Main Corridor" },
  { sensorId: "ENV_004", location: "Ground Floor Emergency Exit Area" },
];

const serverUrl = "http://localhost:3001";

function generateEnvironmentalData(config) {
  const pm25 = Math.floor(Math.random() * 150) + 5; // 5-155 μg/m³
  const pm10 = pm25 + Math.floor(Math.random() * 50); // PM10 > PM2.5
  const co2 = Math.floor(Math.random() * 2000) + 400; // 400-2400 ppm
  const tvoc = Math.floor(Math.random() * 1000) + 50; // 50-1050 ppb
  const nox = Math.floor(Math.random() * 200) + 10; // 10-210 ppb
  const temperature = Math.floor(Math.random() * 30) + 15; // 15-45°C
  const humidity = Math.floor(Math.random() * 80) + 20; // 20-100%

  // Calculate Air Quality Index based on PM2.5
  let aqiLevel;
  if (pm25 <= 12) {
    aqiLevel = "GOOD";
  } else if (pm25 <= 35) {
    aqiLevel = "MODERATE";
  } else if (pm25 <= 55) {
    aqiLevel = "UNHEALTHY_FOR_SENSITIVE";
  } else if (pm25 <= 150) {
    aqiLevel = "UNHEALTHY";
  } else {
    aqiLevel = "HAZARDOUS";
  }

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
      aqiLevel: aqiLevel,
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

    const aqi = sensorData.data.aqiLevel;
    if (aqi === "UNHEALTHY" || aqi === "HAZARDOUS") {
      console.log(
        `AIR QUALITY ALERT - ${sensorData.sensorType}: ${aqi} (PM2.5: ${sensorData.data.pm25}μg/m³) at ${sensorData.location}`
      );
    } else {
      console.log(
        `${sensorData.sensorType}: ${aqi} (CO2: ${sensorData.data.co2}ppm, ${sensorData.data.temperature}°C) at ${sensorData.location}`
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
  "Starting AirGradient Environmental Monitor for ground floor areas..."
);

const interval = setInterval(() => {
  ENVIRONMENTAL_CONFIGS.forEach((config) => {
    const sensorData = generateEnvironmentalData(config);
    sendDataToServer(sensorData);
  });
}, 6000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Ground Floor Environmental Monitor Nodes...");
  clearInterval(interval);
  process.exit(0);
});
