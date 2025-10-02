import axios from "axios";

const KEYPAD_CONFIGS = [
  { sensorId: "LOCK_001", location: "Main Security Door" },
  { sensorId: "LOCK_002", location: "Staff Entry Door" },
];

const serverUrl = "http://localhost:3001";

const validCodes = ["1234", "5678", "9999", "0000"];
const lockStates = {};

function generateKeypadData(config) {
  // Initialize lock state if not exists
  if (!lockStates[config.sensorId]) {
    lockStates[config.sensorId] = "locked";
  }

  const codeEntered = Math.random() < 0.4; // 3% chance of code entry
  let enteredCode = null;
  let accessGranted = false;
  let lockAction = null;

  if (codeEntered) {
    // Generate random code or use valid one
    if (Math.random() < 0.6) {
      // 60% chance of valid code
      enteredCode = validCodes[Math.floor(Math.random() * validCodes.length)];
      accessGranted = true;
      lockAction = lockStates[config.sensorId] === "locked" ? "unlock" : "lock";
      lockStates[config.sensorId] =
        lockStates[config.sensorId] === "locked" ? "unlocked" : "locked";
    } else {
      enteredCode = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      accessGranted = false;
      lockAction = "denied";
    }
  }

  const batteryLevel = Math.floor(Math.random() * 100) + 1;
  const tamperStatus = Math.random() < 0.99 ? "secure" : "tampered";

  return {
    sensorId: config.sensorId,
    sensorType: "Schlage Advanced Lock Node",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      codeEntered: codeEntered,
      enteredCode: enteredCode,
      accessGranted: accessGranted,
      lockStatus: lockStates[config.sensorId],
      lockAction: lockAction,
      batteryLevel: batteryLevel,
      tamperStatus: tamperStatus,
      wrongAttempts:
        codeEntered && !accessGranted ? Math.floor(Math.random() * 3) + 1 : 0,
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
          `LOCK ${sensorData.data.lockAction.toUpperCase()} - ${
            sensorData.sensorType
          }: Valid code entered at ${sensorData.location}`
        );
      } else {
        console.log(
          `ACCESS DENIED - ${sensorData.sensorType}: Invalid code ${sensorData.data.enteredCode} at ${sensorData.location}`
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

console.log("Starting Schlage Keypad Lock Node monitoring for ground floor...");

const interval = setInterval(() => {
  KEYPAD_CONFIGS.forEach((config) => {
    const sensorData = generateKeypadData(config);
    sendDataToServer(sensorData);
  });
}, 5000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Ground Floor Keypad Lock Nodes...");
  clearInterval(interval);
  process.exit(0);
});
