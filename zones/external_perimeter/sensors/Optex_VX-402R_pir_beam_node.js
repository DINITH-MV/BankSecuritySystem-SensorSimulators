import axios from "axios";

const BARRIER_CONFIGS = [
  { sensorId: "LB_001", location: "North Perimeter Gate" },
  { sensorId: "LB_002", location: "East Fence Line" },
  { sensorId: "LB_003", location: "South Perimeter" },
  { sensorId: "LB_004", location: "West Perimeter" },
];

const serverUrl = "http://localhost:3000";

function generateBarrierData(config) {
  const motionDetected = Math.random() < 0.12;
  const beamBroken = motionDetected && Math.random() < 0.8;
  const temperature = Math.floor(Math.random() * 30) + 10;
  const batteryLevel = Math.floor(Math.random() * 100) + 1;

  return {
    sensorId: config.sensorId,
    sensorType: "Optex VX-402R Laser Barrier",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      motionDetected,
      beamBroken,
      temperature,
      batteryLevel,
      sensitivity: "HIGH",
    },
  };
}

async function sendBarrierDataToServer(barrierData) {
  try {
    await axios.post(`${serverUrl}/sensor-data`, barrierData, {
      headers: { "Content-Type": "application/json" },
    });

    if (barrierData.data.motionDetected) {
      const beamInfo = barrierData.data.beamBroken ? " (Beam broken)" : "";
      console.log(
        `MOTION ALERT - ${barrierData.sensorType}: Motion detected${beamInfo} at ${barrierData.location}`
      );
    } else {
      console.log(
        `${barrierData.sensorType}: No motion detected at ${barrierData.location}`
      );
    }
  } catch (error) {
    console.error(
      `Error sending data from ${barrierData.sensorType}:`,
      error.code || error.message || "Unknown error"
    );
    if (error.response) {
      console.error(`Server responded with status: ${error.response.status}`);
    } else if (error.request) {
      console.error(`No response received from server at ${serverUrl}`);
      console.error("Make sure the web server is running on port 3000");
    }
  }
}

console.log(
  "Starting Optex VX-402R Laser Barrier monitoring for 4 barriers..."
);

const interval = setInterval(() => {
  BARRIER_CONFIGS.forEach((config) => {
    const barrierData = generateBarrierData(config);
    sendBarrierDataToServer(barrierData);
  });
}, 2000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Laser Barrier Nodes...");
  clearInterval(interval);
  process.exit(0);
});
