import axios from "axios";

const CARD_READER_CONFIGS = [
  {
    readerId: "CARD_OF13_001",
    location: "Office Floor 13 Main Entrance",
  },
  {
    readerId: "CARD_OF13_002",
    location: "Office Floor 13 Conference Room Entrance",
  },
];

const serverUrl = "http://localhost:3014";

const VALID_CARDS = [
  "CARD001",
  "CARD002",
  "CARD003",
  "CARD004",
  "CARD005",
  "CARD006",
  "CARD007",
  "CARD008",
  "CARD009",
  "CARD010",
];

const INVALID_CARDS = [
  "EXPIRED001",
  "INVALID001",
  "UNKNOWN001",
  "BLOCKED001",
  "TEST001",
];

function generateCardReaderData(config) {
  const cardPresented = Math.random() < 0.06; // 6% chance of card presentation
  let cardId = null;
  let accessGranted = false;

  if (cardPresented) {
    // 85% chance of valid card, 15% chance of invalid
    if (Math.random() < 0.85) {
      cardId = VALID_CARDS[Math.floor(Math.random() * VALID_CARDS.length)];
      accessGranted = true;
    } else {
      cardId = INVALID_CARDS[Math.floor(Math.random() * INVALID_CARDS.length)];
      accessGranted = false;
    }
  }

  const sensorData = {
    sensorId: config.readerId,
    sensorType: "HID ProxPoint Plus Card Reader",
    location: config.location,
    timestamp: new Date().toISOString(),
    active: true,
    status: "operational",
    type: "access_control",
    data: {
      cardPresented: cardPresented,
      cardId: cardId,
      accessGranted: accessGranted,
      accessLevel: accessGranted ? "OFFICE_FLOOR_13" : null,
      readerHealth: Math.floor(Math.random() * 20) + 80, // 80-100%
      signalStrength: Math.floor(Math.random() * 25) + 75, // 75-100%
      lastSuccessfulRead:
        cardPresented && accessGranted
          ? new Date().toISOString()
          : new Date(
              Date.now() - Math.floor(Math.random() * 3600000)
            ).toISOString(),
      errorCount: Math.floor(Math.random() * 3), // 0-2 errors
      tamperStatus: Math.random() < 0.001 ? "tampered" : "secure", // 0.1% chance
      powerStatus: "normal",
      connectionStatus: "connected",
    },
  };

  return sensorData;
}

async function sendSensorData(sensorData) {
  try {
    await axios.post(`${serverUrl}/sensor-data`, sensorData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(
      `Card Reader ${sensorData.sensorId} data sent successfully - Card: ${
        sensorData.data.cardPresented ? "YES" : "NO"
      }, Access: ${sensorData.data.accessGranted ? "GRANTED" : "DENIED"}`
    );
  } catch (error) {
    console.error(
      `Error sending card reader data for ${sensorData.sensorId}:`,
      error.code || error.message
    );
  }
}

function startCardReaders() {
  console.log("Starting Office Floor 13 HID ProxPoint Plus Card Readers...");
  console.log(`Server URL: ${serverUrl}`);
  console.log(`Total card readers: ${CARD_READER_CONFIGS.length}`);

  CARD_READER_CONFIGS.forEach((config, index) => {
    setTimeout(() => {
      setInterval(() => {
        const sensorData = generateCardReaderData(config);
        sendSensorData(sensorData);
      }, 5000); // Send data every 5 seconds
    }, index * 600); // Stagger start times by 600ms
  });

  console.log("All Office Floor 13 card readers started");
}

startCardReaders();

process.on("SIGINT", () => {
  console.log("Shutting down Office Floor 13 card readers...");
  process.exit(0);
});
