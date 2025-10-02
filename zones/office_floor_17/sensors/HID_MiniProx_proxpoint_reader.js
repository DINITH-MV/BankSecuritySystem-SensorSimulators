import axios from "axios";

const CARD_READER_CONFIGS = [
  { readerId: "ACCESS_OF17_001", location: "Office Floor 17 Main Entrance" },
  {
    readerId: "ACCESS_OF17_002",
    location: "Office Floor 17 Secure Access Point",
  },
];

const serverUrl = "http://localhost:3018";

function generateCardReaderData(config) {
  const cardPresented = Math.random() < 0.3; // 5% chance of card
  const accessGranted = cardPresented && Math.random() < 0.85; // 85% success rate
  const cardId = cardPresented
    ? `CARD_OF17_${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
    : null;
  const employeeId = accessGranted
    ? `EMP_${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
    : null;

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

  const accessLevel = accessGranted
    ? ["employee", "visitor", "contractor", "management"][
        Math.floor(Math.random() * 4)
      ]
    : null;

  const ledStatus = accessGranted ? "green" : cardPresented ? "red" : "blue";
  const doorStatus = accessGranted ? "unlocked" : "locked";

  return {
    sensorId: config.readerId,
    sensorType: "HID ProxPoint Plus Card Reader",
    location: config.location,
    timestamp: new Date().toISOString(),
    data: {
      cardPresented,
      accessGranted,
      cardId,
      user_name: userName,
      employeeId,
      accessLevel,
      ledStatus,
      doorStatus,
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
          `ACCESS GRANTED - ${sensorData.sensorType}: ${sensorData.data.cardId} (${sensorData.data.accessLevel}) at ${sensorData.location}`
        );
      } else {
        console.log(
          `ACCESS DENIED - ${sensorData.sensorType}: ${sensorData.data.cardId} at ${sensorData.location}`
        );
      }
    } else {
      console.log(`${sensorData.sensorType}: Ready at ${sensorData.location}`);
    }
  } catch (error) {
    console.error(
      `Error sending data from ${sensorData.sensorType}:`,
      error.message
    );
  }
}

console.log(
  "Starting HID ProxPoint Card Reader monitoring for Office Floor 17..."
);

const interval = setInterval(() => {
  CARD_READER_CONFIGS.forEach((config) => {
    const sensorData = generateCardReaderData(config);
    sendDataToServer(sensorData);
  });
}, 3000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Office Floor 17 Card Reader Nodes...");
  clearInterval(interval);
  process.exit(0);
});
