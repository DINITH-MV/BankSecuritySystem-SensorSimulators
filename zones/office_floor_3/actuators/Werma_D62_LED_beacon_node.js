import axios from "axios";

/**
 * Werma D62 LED Beacon - Office Floor 3
 * Web server controlled LED beacon system
 */

const BEACON_CONFIGS = [
  { beaconId: "BEACON_OF3_001", location: "Office Floor 3 Corridor North" },
  { beaconId: "BEACON_OF3_002", location: "Office Floor 3 Corridor South" },
  { beaconId: "BEACON_OF3_003", location: "Office Floor 3 Corridor East" },
  { beaconId: "BEACON_OF3_004", location: "Office Floor 3 Corridor West" },
];

const serverUrl = "http://localhost:3004";

class OfficeFloor3BeaconSystem {
  constructor() {
    this.beacons = {};
    this.zone = "office_floor_3";
    this.lastCommandTimestamp = null;

    // Initialize beacon states
    BEACON_CONFIGS.forEach((config) => {
      this.beacons[config.beaconId] = {
        ...config,
        active: false,
        color: "GREEN",
        lightPattern: "STEADY",
        brightness: 0,
        powerConsumption: 1,
        visibility: 0,
        lastUpdate: new Date().toISOString(),
      };
    });

    console.log(
      "Office Floor 3 Beacon System initialized with web server control"
    );
    this.startPollingForCommands();
  }

  startPollingForCommands() {
    // Poll web server for beacon commands every 2 seconds
    setInterval(() => {
      this.checkForBeaconCommands();
    }, 2000);
  }

  async checkForBeaconCommands() {
    try {
      // Request beacon commands from web server
      const response = await axios.get(
        `${serverUrl}/beacon-commands/${this.zone}`
      );
      const commands = response.data;

      if (commands && commands.length > 0) {
        commands.forEach((command) => {
          this.processBeaconCommand(command);
        });
      }
    } catch (error) {
      // Only log if it's not a 404 (no commands available)
      if (error.response && error.response.status !== 404) {
        console.error("Error checking for beacon commands:", error.message);
      }
    }
  }

  processBeaconCommand(commandData) {
    // Check if this is a new command (avoid processing same command multiple times)
    if (
      commandData.timestamp &&
      commandData.timestamp === this.lastCommandTimestamp
    ) {
      return;
    }

    this.lastCommandTimestamp = commandData.timestamp;
    const { beaconId, data } = commandData;

    if (beaconId && this.beacons[beaconId]) {
      // Update specific beacon
      this.updateBeacon(beaconId, commandData);
    } else {
      // Update all beacons if no specific ID or it's a general beacon command
      Object.keys(this.beacons).forEach((id) => {
        this.updateBeacon(id, commandData);
      });
    }
  }

  updateBeacon(beaconId, commandData) {
    const beacon = this.beacons[beaconId];
    if (!beacon) return;

    // Update beacon state based on command
    if (commandData.data) {
      beacon.active = commandData.data.beaconStatus === "ON";
      beacon.color = commandData.data.color || beacon.color;
      beacon.lightPattern =
        commandData.data.lightPattern || beacon.lightPattern;
      beacon.brightness = commandData.data.brightness || beacon.brightness;
      beacon.powerConsumption =
        commandData.data.powerConsumption || beacon.powerConsumption;
      beacon.visibility = commandData.data.visibility || beacon.visibility;
    } else {
      // Handle direct command format
      beacon.active =
        commandData.active !== undefined ? commandData.active : beacon.active;
      beacon.color = commandData.color || beacon.color;
      beacon.lightPattern = commandData.lightPattern || beacon.lightPattern;
      beacon.brightness = commandData.brightness || beacon.brightness;
    }

    beacon.lastUpdate = new Date().toISOString();

    // Generate beacon data for web server
    const beaconData = this.generateBeaconData(beacon);
    this.sendBeaconDataToServer(beaconData);
  }

  generateBeaconData(beacon) {
    return {
      beaconId: beacon.beaconId,
      deviceType: "beacon",
      model: "Werma D62 LED Beacon",
      location: beacon.location,
      timestamp: new Date().toISOString(),
      data: {
        beaconStatus: beacon.active ? "ON" : "OFF",
        color: beacon.color,
        lightPattern: beacon.lightPattern,
        brightness: beacon.brightness,
        powerConsumption: beacon.powerConsumption,
        visibility: beacon.visibility,
      },
    };
  }

  async sendBeaconDataToServer(beaconData) {
    try {
      await axios.post(`${serverUrl}/actuator-data`, beaconData, {
        headers: { "Content-Type": "application/json" },
      });

      if (beaconData.data.beaconStatus === "ON") {
        console.log(
          `BEACON ACTIVATED: ${beaconData.beaconId} at ${beaconData.location} | Color: ${beaconData.data.color}, Pattern: ${beaconData.data.lightPattern}, Brightness: ${beaconData.data.brightness}%`
        );
      } else {
        console.log(
          `BEACON DEACTIVATED: ${beaconData.beaconId} at ${beaconData.location}`
        );
      }
    } catch (error) {
      console.error(
        `Error sending beacon data for ${beaconData.beaconId}:`,
        error.message
      );
    }
  }

  getBeaconStatus() {
    return {
      zone: this.zone,
      timestamp: new Date().toISOString(),
      beacons: this.beacons,
      activeCount: Object.values(this.beacons).filter((b) => b.active).length,
      totalCount: Object.keys(this.beacons).length,
    };
  }
}

// Start the Office Floor 3 Beacon System
const beaconSystem = new OfficeFloor3BeaconSystem();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down Office Floor 3 Beacon System...");

  // Turn off all beacons before shutdown
  Object.keys(beaconSystem.beacons).forEach((beaconId) => {
    const beacon = beaconSystem.beacons[beaconId];
    beacon.active = false;
    beacon.brightness = 0;
    beacon.powerConsumption = 1;
    const beaconData = beaconSystem.generateBeaconData(beacon);
    beaconSystem.sendBeaconDataToServer(beaconData);
  });

  process.exit(0);
});
