import axios from "axios";
import mqtt from "mqtt";

class ExternalPerimeterActuatorController {
  constructor() {
    this.zone = "external_perimeter";
    this.serverUrl = "http://localhost:3000";

    // Actuator configurations
    this.actuators = {
      sirens: {
        SIREN_001: {
          id: "SIREN_001",
          location: "North Perimeter Gate",
          active: false,
        },
        SIREN_002: {
          id: "SIREN_002",
          location: "East Fence Line",
          active: false,
        },
        SIREN_003: {
          id: "SIREN_003",
          location: "South Perimeter",
          active: false,
        },
        SIREN_004: {
          id: "SIREN_004",
          location: "West Perimeter",
          active: false,
        },
      },
      beacons: {
        BEACON_001: {
          id: "BEACON_001",
          location: "North Perimeter Gate",
          active: false,
        },
        BEACON_002: {
          id: "BEACON_002",
          location: "East Fence Line",
          active: false,
        },
        BEACON_003: {
          id: "BEACON_003",
          location: "South Perimeter",
          active: false,
        },
        BEACON_004: {
          id: "BEACON_004",
          location: "West Perimeter",
          active: false,
        },
      },
    };

    // MQTT setup for HiveMQ Cloud
    const mqttOptions = {
      host: "6dbb5584fc034837b3d101db50a3cfb7.s1.eu.hivemq.cloud",
      port: 8883, // TLS port for HiveMQ Cloud
      protocol: "mqtts", // Secure MQTT over TLS
      username: "hivemq.webclient.1756342321561", // Replace with your HiveMQ Cloud username
      password: "O7l&$%k;vDa1No0BZ9fG", // Replace with your HiveMQ Cloud password
      clientId: `external_perimeter_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      rejectUnauthorized: true, // Verify SSL certificate
    };

    this.mqttClient = mqtt.connect(mqttOptions);
    this.setupMQTT();
  }

  setupMQTT() {
    this.mqttClient.on("connect", () => {
      console.log("External Perimeter Actuator Controller connected to MQTT");
      this.subscribeToStatusTopic();
    });

    this.mqttClient.on("message", (topic, message) => {
      this.handleIncomingMessage(topic, message);
    });

    this.mqttClient.on("error", (error) => {
      console.error("MQTT connection error:", error.message);
    });
  }

  subscribeToStatusTopic() {
    const statusTopic =
      "bank_security/zone/external_perimeter/actuators/status";

    this.mqttClient.subscribe(statusTopic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Error subscribing to ${statusTopic}:`, err.message);
      } else {
        console.log(`Subscribed to: ${statusTopic}`);
      }
    });
  }

  handleIncomingMessage(topic, message) {
    try {
      const statusData = JSON.parse(message.toString());
      console.log(
        `Received actuator status message from ${topic}:`,
        statusData
      );

      this.handleActuatorStatusMessage(statusData);
    } catch (error) {
      console.error("Error parsing message:", error.message);
    }
  }

  handleActuatorStatusMessage(statusData) {
    console.log("Processing actuator status message:", statusData);

    // Check if sirens should be activated
    if (statusData.siren_active) {
      const sirenConfig = {
        pattern: statusData.siren_pattern || "continuous",
        volume: statusData.siren_volume || 85,
        duration: statusData.siren_duration || 60,
      };
      this.sendActuatorCommand("siren", sirenConfig, true);
    } else {
      this.sendDeactivationCommand("siren");
    }

    // Check if beacons should be activated
    if (statusData.beacon_active) {
      const beaconConfig = {
        color: statusData.beacon_color || "RED",
        lightPattern: statusData.beacon_pattern || "strobe",
        brightness: statusData.beacon_brightness || 85,
      };
      this.sendActuatorCommand("beacon", beaconConfig, true);
    } else {
      this.sendDeactivationCommand("beacon");
    }
  }

  async sendDeactivationCommand(type) {
    const isSiren = type === "siren";
    const command = isSiren
      ? {
          active: false,
          pattern: "off",
          volume: 0,
          duration: 0,
          timestamp: new Date().toISOString(),
        }
      : {
          active: false,
          color: "GREEN",
          lightPattern: "STEADY",
          brightness: 0,
          timestamp: new Date().toISOString(),
        };

    try {
      await axios.post(
        `${this.serverUrl}/${type}-commands/${this.zone}`,
        command,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update local state
      const actuatorType = isSiren ? "sirens" : "beacons";
      Object.keys(this.actuators[actuatorType]).forEach((id) => {
        this.actuators[actuatorType][id].active = false;
      });

      console.log(
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } deactivation command sent`
      );
    } catch (error) {
      console.error(
        `Error sending ${type} deactivation command:`,
        error.message
      );
    }
  }

  async sendActuatorCommand(type, config, active = true) {
    const command = {
      active: active,
      timestamp: new Date().toISOString(),
      ...(type === "siren"
        ? {
            pattern: active ? config.pattern : "off",
            volume: active ? config.volume : 0,
            duration: active ? config.duration : 0,
          }
        : {
            color: active ? config.color : "GREEN",
            lightPattern: active ? config.lightPattern : "STEADY",
            brightness: active ? config.brightness : 0,
          }),
    };

    try {
      await axios.post(
        `${this.serverUrl}/${type}-commands/${this.zone}`,
        command,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update local state
      const actuatorType = type === "siren" ? "sirens" : "beacons";
      Object.keys(this.actuators[actuatorType]).forEach((id) => {
        this.actuators[actuatorType][id].active = active;
      });

      console.log(
        `${type.charAt(0).toUpperCase() + type.slice(1)} ${
          active ? "activation" : "deactivation"
        } command sent`
      );
    } catch (error) {
      console.error(`Error sending ${type} command:`, error.message);
    }
  }

  async deactivateAllActuators() {
    console.log("Deactivating all actuators in external perimeter");
    await this.sendDeactivationCommand("siren");
    await this.sendDeactivationCommand("beacon");
  }

  getActuatorStatus() {
    const status = {
      zone: this.zone,
      timestamp: new Date().toISOString(),
      sirens: {
        total: Object.keys(this.actuators.sirens).length,
        active: Object.values(this.actuators.sirens).filter((s) => s.active)
          .length,
        devices: this.actuators.sirens,
      },
      beacons: {
        total: Object.keys(this.actuators.beacons).length,
        active: Object.values(this.actuators.beacons).filter((b) => b.active)
          .length,
        devices: this.actuators.beacons,
      },
    };

    return status;
  }
}

// Start the External Perimeter Actuator Controller
const controller = new ExternalPerimeterActuatorController();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down External Perimeter Actuator Controller...");
  controller.deactivateAllActuators();
  process.exit(0);
});

export default ExternalPerimeterActuatorController;
