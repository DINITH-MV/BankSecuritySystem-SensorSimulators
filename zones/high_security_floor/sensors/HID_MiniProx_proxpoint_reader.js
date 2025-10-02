import axios from "axios";

const CARD_READER_CONFIGS = [
  {
    readerId: "ACCESS_H5_001",
    location: "High Security Floor 5 Main Entrance",
  },
  {
    readerId: "ACCESS_H5_002",
    location: "Executive Floor Secure Access Point",
  },
];

const serverUrl = "http://localhost:3100";

function generateCardReaderData(config) {
  const cardPresented = Math.random() < 0.3; // 5% chance of card
  const pinEntered = cardPresented && Math.random() < 0.9; // 90% enter PIN when card presented
  const accessGranted = cardPresented && pinEntered && Math.random() < 0.82; // 82% success rate with card+PIN

  const cardId = cardPresented
    ? `CARD_H5_${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
    : null;

  const enteredPin = pinEntered
    ? Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
    : null;

  const employeeId = accessGranted
    ? `EXE_${Math.floor(Math.random() * 100)
        .toString()
        .padStart(3, "0")}`
    : null;

  const accessLevel = accessGranted
    ? ["executive", "senior_management", "security_clearance", "contractor"][
        Math.floor(Math.random() * 4)
      ]
    : null;

  const ledStatus = accessGranted ? "green" : cardPresented ? "red" : "blue";
  const doorStatus = accessGranted ? "unlocked" : "locked";
  const securityLevel = "HIGH_SECURITY";

  // Generate user data when card is presented (to mirror keypad lock user_name)
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

  const userName = cardPresented
    ? employeeNames[Math.floor(Math.random() * employeeNames.length)]
    : null;

  return {
    sensorId: config.readerId,
    sensorType: "HID ProxPoint Plus Card Reader with PIN",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      cardPresented,
      pinEntered,
      accessGranted,
      cardId,
      enteredPin,
      user_name: userName,
      employeeId,
      accessLevel,
      ledStatus,
      doorStatus,
      securityLevel,
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

    if (sensorData.data.cardPresented) {
      if (sensorData.data.accessGranted) {
        console.log(
          `HIGH SECURITY ACCESS GRANTED - ${sensorData.sensorType}: ${sensorData.data.cardId} + PIN (${sensorData.data.accessLevel}) at ${sensorData.location}`
        );
      } else {
        const reason = !sensorData.data.pinEntered
          ? "No PIN entered"
          : "Invalid credentials";
        console.log(
          `HIGH SECURITY ACCESS DENIED - ${sensorData.sensorType}: ${sensorData.data.cardId} - ${reason} at ${sensorData.location}`
        );
      }
    } else {
      console.log(
        `${sensorData.sensorType}: High security mode ready at ${sensorData.location}`
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
  "Starting HID ProxPoint Card Reader with PIN monitoring for high security floor 5..."
);

const interval = setInterval(() => {
  CARD_READER_CONFIGS.forEach((config) => {
    const sensorData = generateCardReaderData(config);
    sendDataToServer(sensorData);
  });
}, 3000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down High Security Floor 5 Card Reader Nodes...");
  clearInterval(interval);
  process.exit(0);
});
