import axios from "axios";
import mqtt from "mqtt";

class HighSecurityFloor5ActuatorController {
  constructor() {
    this.zone = "high_security_floor";
    this.serverUrl = "http://localhost:3100";

    // Actuator configurations
    this.actuators = {
      sirens: {
        SIREN_H5_001: {
          id: "SIREN_H5_001",
          location: "Executive Office A",
          active: false,
        },
        SIREN_H5_002: {
          id: "SIREN_H5_002",
          location: "Executive Office B",
          active: false,
        },
        SIREN_H5_003: {
          id: "SIREN_H5_003",
          location: "Conference Room Alpha",
          active: false,
        },
        SIREN_H5_004: {
          id: "SIREN_H5_004",
          location: "Conference Room Beta",
          active: false,
        },
        SIREN_H5_005: {
          id: "SIREN_H5_005",
          location: "High Security Corridor",
          active: false,
        },
        SIREN_H5_006: {
          id: "SIREN_H5_006",
          location: "Server Room A",
          active: false,
        },
        SIREN_H5_007: {
          id: "SIREN_H5_007",
          location: "Data Center",
          active: false,
        },
        SIREN_H5_008: {
          id: "SIREN_H5_008",
          location: "Executive Floor Elevator Bay",
          active: false,
        },
      },
      beacons: {
        BEACON_H5_001: {
          id: "BEACON_H5_001",
          location: "Executive Office A Entrance",
          active: false,
        },
        BEACON_H5_002: {
          id: "BEACON_H5_002",
          location: "Executive Office B Entrance",
          active: false,
        },
        BEACON_H5_003: {
          id: "BEACON_H5_003",
          location: "Conference Room Alpha",
          active: false,
        },
        BEACON_H5_004: {
          id: "BEACON_H5_004",
          location: "Conference Room Beta",
          active: false,
        },
        BEACON_H5_005: {
          id: "BEACON_H5_005",
          location: "High Security Corridor",
          active: false,
        },
        BEACON_H5_006: {
          id: "BEACON_H5_006",
          location: "Server Room A Access",
          active: false,
        },
        BEACON_H5_007: {
          id: "BEACON_H5_007",
          location: "Server Room B Access",
          active: false,
        },
        BEACON_H5_008: {
          id: "BEACON_H5_008",
          location: "Data Center Emergency Alert",
          active: false,
        },
        BEACON_H5_009: {
          id: "BEACON_H5_009",
          location: "Executive Floor Elevator Bay",
          active: false,
        },
        BEACON_H5_010: {
          id: "BEACON_H5_010",
          location: "High Security Reception Area",
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
      console.log(
        "High Security Floor 5 Actuator Controller connected to MQTT"
      );
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
      "bank_security/zone/high_security_floor/actuators/status";

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
        duration: statusData.siren_duration || 45,
      };
      this.sendActuatorCommand("siren", sirenConfig, true);
    } else {
      this.sendDeactivationCommand("siren");
    }

    // Check if beacons should be activated
    if (statusData.beacon_active) {
      const beaconConfig = {
        color: statusData.beacon_color || "RED",
        lightPattern: statusData.beacon_pattern || "STROBE",
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
        `High Security ${
          type.charAt(0).toUpperCase() + type.slice(1)
        } deactivation command sent`
      );
    } catch (error) {
      console.error(
        `Error sending high security ${type} deactivation command:`,
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
        `High Security ${type.charAt(0).toUpperCase() + type.slice(1)} ${
          active ? "activation" : "deactivation"
        } command sent`
      );
    } catch (error) {
      console.error(
        `Error sending high security ${type} command:`,
        error.message
      );
    }
  }

  async deactivateAllActuators() {
    console.log("Deactivating all actuators in high security floor 5");
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

// Start the High Security Floor 5 Actuator Controller
const controller = new HighSecurityFloor5ActuatorController();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down High Security Floor 5 Actuator Controller...");
  controller.deactivateAllActuators();
  process.exit(0);
});

export default HighSecurityFloor5ActuatorController;
