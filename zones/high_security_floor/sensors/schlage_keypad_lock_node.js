import axios from "axios";

const KEYPAD_CONFIGS = [
  { sensorId: "LOCK_H5_001", location: "Conference Room Beta Secure Entry" },
  { sensorId: "LOCK_H5_002", location: "Server Room B Secondary Access" },
];

import axios from "axios";

const serverUrl = "http://localhost:3100";

const validCodes = ["851963", "427519", "986532", "741852"]; // 6-digit high security codes
const lockStates = {};

function generateKeypadData(config) {
  // Initialize lock state if not exists
  if (!lockStates[config.sensorId]) {
    lockStates[config.sensorId] = "locked";
  }

  const codeEntered = Math.random() < 0.3; // Increased to 30% for testing (was 0.03)
  let enteredCode = null;
  let accessGranted = false;
  let lockAction = null;

  // Generate user data when code is entered
  const employeeNames = [
    "John Smith",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "Lisa Anderson",
    "James Taylor",
    "Jennifer Miller",
    "Robert Garcia",
    "Maria Rodriguez",
    "William Martinez",
    "Amanda Clark",
  ];

  const userName = codeEntered
    ? employeeNames[Math.floor(Math.random() * employeeNames.length)]
    : null;
  const employeeId = codeEntered
    ? `EMP${Math.floor(Math.random() * 9999) + 1000}`
    : null;

  if (codeEntered) {
    // Generate random code or use valid one
    if (Math.random() < 0.55) {
      // 55% chance of valid code (stricter for high security)
      enteredCode = validCodes[Math.floor(Math.random() * validCodes.length)];
      accessGranted = true;
      lockAction = lockStates[config.sensorId] === "locked" ? "unlock" : "lock";
      lockStates[config.sensorId] =
        lockStates[config.sensorId] === "locked" ? "unlocked" : "locked";
    } else {
      enteredCode = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0"); // 6-digit codes
      accessGranted = false;
      lockAction = "denied";
    }
  }

  const batteryLevel = Math.floor(Math.random() * 100) + 1;
  const tamperStatus = Math.random() < 0.99 ? "secure" : "tampered";
  const encryptionStatus = "AES_256_ENABLED";
  const biometricBackup = Math.random() < 0.95 ? "enabled" : "disabled";

  return {
    sensorId: config.sensorId,
    sensorType: "Schlage Advanced Lock Node",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      codeEntered: codeEntered,
      enteredCode: enteredCode,
      user_name: userName,
      employee_id: employeeId,
      accessGranted: accessGranted,
      lockStatus: lockStates[config.sensorId],
      lockAction: lockAction,
      batteryLevel: batteryLevel,
      tamperStatus: tamperStatus,
      encryptionStatus: encryptionStatus,
      biometricBackup: biometricBackup,
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
          `HIGH SECURITY LOCK ${sensorData.data.lockAction.toUpperCase()} - ${
            sensorData.sensorType
          }: Valid 6-digit code entered at ${sensorData.location}`
        );
      } else {
        console.log(
          `HIGH SECURITY ACCESS DENIED - ${sensorData.sensorType}: Invalid 6-digit code attempt at ${sensorData.location}`
        );
      }
    } else {
      console.log(
        `${sensorData.sensorType}: High security status - ${sensorData.data.lockStatus} at ${sensorData.location}`
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
  "Starting Schlage High Security Keypad Lock Node monitoring for high security floor 5..."
);

const interval = setInterval(() => {
  KEYPAD_CONFIGS.forEach((config) => {
    const sensorData = generateKeypadData(config);
    sendDataToServer(sensorData);
  });
}, 5000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down High Security Floor 5 Keypad Lock Nodes...");
  clearInterval(interval);
  process.exit(0);
});
