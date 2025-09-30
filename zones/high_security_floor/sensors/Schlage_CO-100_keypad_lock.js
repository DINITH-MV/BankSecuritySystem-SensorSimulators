import axios from "axios";

const KEYPAD_CONFIGS = [
  { lockId: "KEYPAD_H5_001", location: "Executive Office A Secure Entry" },
  { lockId: "KEYPAD_H5_002", location: "Executive Office B Secure Entry" },
  { lockId: "KEYPAD_H5_003", location: "Conference Room Alpha Access" },
  { lockId: "KEYPAD_H5_004", location: "Server Room A Critical Access" },
  { lockId: "KEYPAD_H5_005", location: "Data Center Emergency Access" },
];

const serverUrl = "http://localhost:3100";

function generateKeypadData(config) {
  const codeEntered = Math.random() < 0.3; // Increased to 30% for testing (was 0.04)
  const accessGranted = codeEntered && Math.random() < 0.25; // 25% success rate (stricter for high security)
  const enteredCode = codeEntered
    ? Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0") // 6-digit codes for high security
    : null;

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

  const batteryLevel = Math.floor(Math.random() * 100) + 1;
  const lockStatus = accessGranted ? "unlocked" : "locked";
  const wrongAttempts =
    codeEntered && !accessGranted ? Math.floor(Math.random() * 3) + 1 : 0;
  const securityLevel = "HIGH_SECURITY";
  const encryptionStatus = "AES_256_ENABLED";

  return {
    sensorId: config.lockId,
    sensorType: "Schlage CO-100 Keypad Lock",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      codeEntered,
      accessGranted,
      enteredCode,
      user_name: userName,
      employee_id: employeeId,
      lockStatus,
      batteryLevel,
      wrongAttempts,
      securityLevel,
      encryptionStatus,
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
          `HIGH SECURITY KEYPAD UNLOCK - ${sensorData.sensorType}: Access granted at ${sensorData.location}`
        );
      } else {
        console.log(
          `HIGH SECURITY KEYPAD ACCESS DENIED - ${sensorData.sensorType}: Invalid code attempt (${sensorData.data.wrongAttempts} attempts) at ${sensorData.location}`
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
  "Starting Schlage CO-100 High Security Keypad Lock monitoring for high security floor 5..."
);

const interval = setInterval(() => {
  KEYPAD_CONFIGS.forEach((config) => {
    const sensorData = generateKeypadData(config);
    sendDataToServer(sensorData);
  });
}, 6000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down High Security Floor 5 Keypad Lock Nodes...");
  clearInterval(interval);
  process.exit(0);
});
