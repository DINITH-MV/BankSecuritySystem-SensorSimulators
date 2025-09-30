import axios from "axios";

/**
 * E2S HMA121 Hootronic Horn - Office Floor 18 Siren
 * Web server controlled high-power indoor siren system
 */

const SIREN_CONFIGS = [
  { sirenId: "SIREN_OF3_001", location: "Office Floor 18 Corridor North" },
  { sirenId: "SIREN_OF3_002", location: "Office Floor 18 Corridor South" },
  { sirenId: "SIREN_OF3_003", location: "Office Floor 18 Corridor East" },
  { sirenId: "SIREN_OF3_004", location: "Office Floor 18 Corridor West" },
];

const serverUrl = "http://localhost:3019";

class OfficeFloor18SirenSystem {
  constructor() {
    this.sirens = {};
    this.zone = "office_floor_3";
    this.lastCommandTimestamp = null;

    // Initialize siren states
    SIREN_CONFIGS.forEach((config) => {
      this.sirens[config.sirenId] = {
        ...config,
        active: false,
        pattern: "off",
        volume: 0,
        duration: 0,
        weatherResistant: true,
        capabilities: ["continuous", "pulsed", "warble", "yelp"],
        lastUpdate: new Date().toISOString(),
      };
    });

    console.log(
      "Office Floor 18 Siren System initialized with web server control"
    );
    this.startPollingForCommands();
  }

  startPollingForCommands() {
    // Poll web server for siren commands every 2 seconds
    setInterval(() => {
      this.checkForSirenCommands();
    }, 2000);
  }

  async checkForSirenCommands() {
    try {
      // Request siren commands from web server
      const response = await axios.get(
        `${serverUrl}/siren-commands/${this.zone}`
      );
      const commands = response.data;

      if (commands && commands.length > 0) {
        commands.forEach((command) => {
          this.processSirenCommand(command);
        });
      }
    } catch (error) {
      // Only log if it's not a 404 (no commands available)
      if (error.response && error.response.status !== 404) {
        console.error("Error checking for siren commands:", error.message);
      }
    }
  }

  processSirenCommand(commandData) {
    // Check if this is a new command (avoid processing same command multiple times)
    if (
      commandData.timestamp &&
      commandData.timestamp === this.lastCommandTimestamp
    ) {
      return;
    }

    this.lastCommandTimestamp = commandData.timestamp;
    const { sirenId } = commandData;

    if (sirenId && this.sirens[sirenId]) {
      // Update specific siren
      this.updateSiren(sirenId, commandData);
    } else {
      // Update all sirens if no specific ID or it's a general siren command
      Object.keys(this.sirens).forEach((id) => {
        this.updateSiren(id, commandData);
      });
    }
  }

  updateSiren(sirenId, commandData) {
    const siren = this.sirens[sirenId];
    if (!siren) return;

    // Update siren state based on command
    siren.active =
      commandData.active !== undefined ? commandData.active : siren.active;
    siren.pattern = commandData.pattern || siren.pattern;
    siren.volume =
      commandData.volume !== undefined ? commandData.volume : siren.volume;
    siren.duration =
      commandData.duration !== undefined
        ? commandData.duration
        : siren.duration;
    siren.lastUpdate = new Date().toISOString();

    // Generate siren data for web server
    const sirenData = this.generateSirenData(siren);
    this.sendSirenDataToServer(sirenData);

    // Auto-deactivate after duration if active
    if (siren.active && siren.duration > 0) {
      setTimeout(() => {
        this.deactivateSiren(sirenId);
      }, siren.duration * 1000);
    }
  }

  deactivateSiren(sirenId) {
    const siren = this.sirens[sirenId];
    if (!siren) return;

    siren.active = false;
    siren.pattern = "off";
    siren.volume = 0;
    siren.duration = 0;
    siren.lastUpdate = new Date().toISOString();

    const sirenData = this.generateSirenData(siren);
    this.sendSirenDataToServer(sirenData);
  }

  generateSirenData(siren) {
    return {
      sirenId: siren.sirenId,
      deviceType: "siren",
      model: "E2S HMA121 Hootronic Horn",
      location: siren.location,
      active: siren.active,
      pattern: siren.pattern,
      volume: siren.volume,
      duration: siren.duration,
      weatherResistant: true,
      capabilities: siren.capabilities,
      timestamp: new Date().toISOString(),
    };
  }

  async sendSirenDataToServer(sirenData) {
    try {
      await axios.post(`${serverUrl}/actuator-data`, sirenData, {
        headers: { "Content-Type": "application/json" },
      });

      if (sirenData.active) {
        console.log(
          `SIREN ACTIVATED: ${sirenData.sirenId} at ${sirenData.location} | Pattern: ${sirenData.pattern}, Volume: ${sirenData.volume}%, Duration: ${sirenData.duration}s`
        );
      } else {
        console.log(
          `SIREN DEACTIVATED: ${sirenData.sirenId} at ${sirenData.location}`
        );
      }
    } catch (error) {
      console.error(
        `Error sending siren data for ${sirenData.sirenId}:`,
        error.code || error.message || "Unknown error"
      );
      if (error.response) {
        console.error(`Server responded with status: ${error.response.status}`);
      } else if (error.request) {
        console.error(`No response received from server at ${serverUrl}`);
        console.error("Make sure the web server is running on port 3019");
      } else {
        console.error("Request setup error:", error.message);
      }
    }
  }

  getSirenStatus() {
    return {
      zone: this.zone,
      timestamp: new Date().toISOString(),
      sirens: this.sirens,
      activeCount: Object.values(this.sirens).filter((s) => s.active).length,
      totalCount: Object.keys(this.sirens).length,
    };
  }
}

// Start the Office Floor 18 Siren System
const sirenSystem = new OfficeFloor18SirenSystem();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down Office Floor 18 Siren System...");

  // Turn off all sirens before shutdown
  Object.keys(sirenSystem.sirens).forEach((sirenId) => {
    sirenSystem.deactivateSiren(sirenId);
  });

  process.exit(0);
});
