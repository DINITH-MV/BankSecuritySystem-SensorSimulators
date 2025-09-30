import axios from "axios";

const KEYPAD_CONFIGS = [
  { lockId: "KEYPAD_001", location: "Main Reception Security Door" },
  { lockId: "KEYPAD_002", location: "Service Area Entry" },
];

const serverUrl = "http://localhost:3001";

function generateKeypadData(config) {
  const codeEntered = Math.random() < 0.04; // 4% chance of code entry
  const accessGranted = codeEntered && Math.random() < 0.3; // 30% success rate
  const enteredCode = codeEntered
    ? Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
    : null;
  const batteryLevel = Math.floor(Math.random() * 100) + 1;
  const lockStatus = accessGranted ? "unlocked" : "locked";
  const ledStatus = accessGranted ? "green" : codeEntered ? "red" : "blue";
  const wrongAttempts =
    codeEntered && !accessGranted ? Math.floor(Math.random() * 3) + 1 : 0;

  return {
    sensorId: config.lockId,
    sensorType: "Schlage CO-100 Keypad Lock",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      codeEntered,
      accessGranted,
      enteredCode,
      lockStatus,
      ledStatus,
      batteryLevel,
      wrongAttempts,
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

    if (sensorData.data.codeEntered) {
      if (sensorData.data.accessGranted) {
        console.log(
          `KEYPAD UNLOCK - ${sensorData.sensorType}: Access granted at ${sensorData.location}`
        );
      } else {
        console.log(
          `KEYPAD ACCESS DENIED - ${sensorData.sensorType}: Invalid code ${sensorData.data.enteredCode} at ${sensorData.location}`
        );
      }
    } else {
      console.log(
        `${sensorData.sensorType}: Status - ${sensorData.data.lockStatus} at ${sensorData.location}`
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
  "Starting Schlage CO-100 Keypad Lock monitoring for ground floor..."
);

const interval = setInterval(() => {
  KEYPAD_CONFIGS.forEach((config) => {
    const sensorData = generateKeypadData(config);
    sendDataToServer(sensorData);
  });
}, 6000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Ground Floor Keypad Lock Nodes...");
  clearInterval(interval);
  process.exit(0);
});
