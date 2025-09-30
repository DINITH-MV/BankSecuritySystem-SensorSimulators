import axios from "axios";
import mqtt from "mqtt";

class OfficeFloor8ActuatorController {
  constructor() {
    this.zone = "office_floor_8";
    this.actuators = {};
    this.serverUrl = "http://localhost:3009";

    // MQTT setup for HiveMQ Cloud
    const mqttOptions = {
      host: "6dbb5584fc034837b3d101db50a3cfb7.s1.eu.hivemq.cloud",
      port: 8883, // TLS port for HiveMQ Cloud
      protocol: "mqtts", // Secure MQTT over TLS
      username: "hivemq.webclient.1756342321561", // Replace with your HiveMQ Cloud username
      password: "O7l&$%k;vDa1No0BZ9fG", // Replace with your HiveMQ Cloud password
      clientId: `office_floor_8_actuator_${Math.random()
        .toString(16)
        .substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      rejectUnauthorized: true, // Verify SSL certificate
    };

    this.mqttClient = mqtt.connect(mqttOptions);
    this.setupMQTT();

    this.alertQueue = [];
    this.processingAlert = false;

    this.startMonitoring();
  }

  setupMQTT() {
    this.mqttClient.on("connect", () => {
      console.log("Office Floor 8 Actuator Controller connected to MQTT");

      // Subscribe to alert topics for this zone
      const alertTopic = `bank_security/zone/${this.zone}/alerts/+`;
      this.mqttClient.subscribe(alertTopic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Error subscribing to alerts: ${err.message}`);
        } else {
          console.log(`Subscribed to alerts: ${alertTopic}`);
        }
      });

      // Subscribe to actuator commands
      const commandTopic = `bank_security/zone/${this.zone}/actuators/+/command`;
      this.mqttClient.subscribe(commandTopic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Error subscribing to commands: ${err.message}`);
        } else {
          console.log(`Subscribed to commands: ${commandTopic}`);
        }
      });

      // Publish initial status
      this.publishControllerStatus("online");

      // Set up periodic heartbeat
      this.heartbeatInterval = setInterval(() => {
        this.publishHeartbeat();
      }, 30000); // Every 30 seconds
    });

    this.mqttClient.on("message", (topic, message) => {
      try {
        const messageData = JSON.parse(message.toString());

        if (topic.includes("/alerts/")) {
          this.handleAlert(messageData);
        } else if (topic.includes("/command")) {
          this.handleCommand(topic, messageData);
        }
      } catch (error) {
        console.error(`Error parsing MQTT message: ${error.message}`);
      }
    });

    this.mqttClient.on("error", (error) => {
      console.error("MQTT connection error:", error.message);
    });

    this.mqttClient.on("close", () => {
      console.log("MQTT connection closed");
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    });
  }

  publishControllerStatus(status) {
    const statusTopic = `bank_security/zone/${this.zone}/actuator_controller/status`;
    const statusData = {
      zone: this.zone,
      status: status,
      timestamp: new Date().toISOString(),
      totalActuators: this.getTotalActuatorCount(),
      activeActuators: this.getActiveActuatorCount(),
    };

    this.mqttClient.publish(
      statusTopic,
      JSON.stringify(statusData),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(
            `Error publishing actuator controller status:`,
            err.message
          );
        } else {
          console.log(`Published actuator controller status: ${status}`);
        }
      }
    );
  }

  publishHeartbeat() {
    const heartbeatTopic = `bank_security/zone/${this.zone}/actuator_controller/heartbeat`;
    const heartbeatData = {
      zone: this.zone,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      totalActuators: this.getTotalActuatorCount(),
      activeActuators: this.getActiveActuatorCount(),
      alertQueueSize: this.alertQueue.length,
      lastDataFetch: this.lastDataFetch || null,
    };

    this.mqttClient.publish(
      heartbeatTopic,
      JSON.stringify(heartbeatData),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(`Error publishing heartbeat:`, err.message);
        } else {
          console.log(
            `Published heartbeat for ${this.zone} actuator controller`
          );
        }
      }
    );
  }

  async fetchActuatorData() {
    try {
      const response = await axios.get(`${this.serverUrl}/actuator-data`);
      const actuatorDataArray = response.data;

      this.lastDataFetch = new Date().toISOString();
      console.log(
        `Fetched ${actuatorDataArray.length} actuator states from web server`
      );

      actuatorDataArray.forEach((actuatorData) => {
        this.processActuatorData(actuatorData);
      });
    } catch (error) {
      console.error(
        "Error fetching actuator data from web server:",
        error.code || error.message || "Unknown error"
      );
      if (error.response) {
        console.error(`Server responded with status: ${error.response.status}`);
      } else if (error.request) {
        console.error(`No response received from server at ${this.serverUrl}`);
        console.error("Make sure the web server is running on port 3009");
      } else {
        console.error("Request setup error:", error.message);
      }
    }
  }

  processActuatorData(data) {
    const { actuatorId, actuatorType, location, timestamp, active, status } =
      data;

    // Initialize actuator type if it doesn't exist
    if (!this.actuators[actuatorType]) {
      this.actuators[actuatorType] = {};
    }

    // Initialize or update actuator
    if (!this.actuators[actuatorType][actuatorId]) {
      this.actuators[actuatorType][actuatorId] = {
        active: active,
        location: location,
        status: status,
        lastUpdate: timestamp,
        lastState: data,
      };
      console.log(
        `New ${actuatorType} actuator registered: ${actuatorId} at ${location}`
      );
    } else {
      // Update existing actuator
      this.actuators[actuatorType][actuatorId].lastState = data;
      this.actuators[actuatorType][actuatorId].lastUpdate = timestamp;
      this.actuators[actuatorType][actuatorId].active = active;
      this.actuators[actuatorType][actuatorId].status = status;
    }

    // Publish actuator data to MQTT
    this.publishActuatorDataToMQTT(data);
  }

  publishActuatorDataToMQTT(data) {
    const { actuatorId, actuatorType } = data;

    // Construct MQTT topic based on actuator type
    const topic = `bank_security/zone/${this.zone}/actuators/${actuatorType}/${actuatorId}`;

    // Prepare payload with complete actuator data
    const payload = {
      ...data,
      zone: this.zone,
      publishedAt: new Date().toISOString(),
    };

    // Publish to MQTT
    this.mqttClient.publish(
      topic,
      JSON.stringify(payload),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(
            `Error publishing actuator data to ${topic}:`,
            err.message
          );
        } else {
          console.log(`Published actuator data to: ${topic}`);
        }
      }
    );
  }

  handleAlert(alertData) {
    console.log(
      `Received alert: ${alertData.alertType} - Severity: ${alertData.severity}`
    );

    // Add to alert queue
    this.alertQueue.push(alertData);

    // Process the queue if not already processing
    if (!this.processingAlert) {
      this.processAlertQueue();
    }
  }

  async processAlertQueue() {
    if (this.alertQueue.length === 0) {
      this.processingAlert = false;
      return;
    }

    this.processingAlert = true;
    const alert = this.alertQueue.shift();

    try {
      const activationPlan = this.generateActivationPlan(alert);
      await this.executeActivationPlan(activationPlan, alert);
    } catch (error) {
      console.error(`Error processing alert: ${error.message}`);
    }

    // Process next alert after a short delay
    setTimeout(() => {
      this.processAlertQueue();
    }, 1000);
  }

  generateActivationPlan(alert) {
    const plan = {
      zone: this.zone,
      alertType: alert.alertType,
      severity: alert.severity,
      timestamp: new Date().toISOString(),
      activations: [],
    };

    // Generate different responses based on alert type and severity
    switch (alert.alertType) {
      case "OFFICE_MOTION_DETECTED":
        if (alert.severity === "medium" || alert.severity === "high") {
          plan.activations.push({
            type: "E2S_HMA121_Hootronic_siren",
            action: "activate",
            duration: 15000, // 15 seconds
            volume: alert.severity === "high" ? 100 : 70,
          });

          plan.activations.push({
            type: "Werma_D62_LED_beacon",
            action: "flash",
            duration: 30000, // 30 seconds
            pattern: "fast",
            color: alert.severity === "high" ? "red" : "orange",
          });
        }
        break;

      case "AFTER_HOURS_MOTION_DETECTED":
        plan.activations.push({
          type: "E2S_HMA121_Hootronic_siren",
          action: "activate",
          duration: 30000, // 30 seconds
          volume: 85,
        });

        plan.activations.push({
          type: "Werma_D62_LED_beacon",
          action: "flash",
          duration: 60000, // 1 minute
          pattern: "fast",
          color: "red",
        });
        break;

      case "UNAUTHORIZED_OFFICE_ACCESS_ATTEMPT":
        plan.activations.push({
          type: "E2S_HMA121_Hootronic_siren",
          action: "activate",
          duration: 20000, // 20 seconds
          volume: 90,
        });

        plan.activations.push({
          type: "Werma_D62_LED_beacon",
          action: "flash",
          duration: 45000, // 45 seconds
          pattern: "fast",
          color: "red",
        });
        break;

      case "OFFICE_SECURITY_CAMERA_EVENT":
        if (alert.data && alert.data.suspiciousBehavior) {
          plan.activations.push({
            type: "Werma_D62_LED_beacon",
            action: "flash",
            duration: 20000, // 20 seconds
            pattern: "slow",
            color: "orange",
          });
        }
        break;

      case "OFFICE_ENTRANCE_MOTION_DETECTED":
        plan.activations.push({
          type: "Werma_D62_LED_beacon",
          action: "flash",
          duration: 10000, // 10 seconds
          pattern: "slow",
          color: "blue",
        });
        break;

      default:
        // Default response for unknown alert types
        plan.activations.push({
          type: "Werma_D62_LED_beacon",
          action: "flash",
          duration: 15000,
          pattern: "slow",
          color: "yellow",
        });
        break;
    }

    return plan;
  }

  async executeActivationPlan(plan, originalAlert) {
    console.log(
      `Executing activation plan for ${plan.alertType} with ${plan.activations.length} activations`
    );

    // Publish the activation plan
    const planTopic = `bank_security/zone/${this.zone}/activation_plan`;
    this.mqttClient.publish(
      planTopic,
      JSON.stringify(plan),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(`Error publishing activation plan: ${err.message}`);
        } else {
          console.log(`Published activation plan to MQTT`);
        }
      }
    );

    // Execute each activation
    for (const activation of plan.activations) {
      await this.executeActivation(activation, originalAlert);
    }
  }

  async executeActivation(activation, originalAlert) {
    try {
      // Send activation command via HTTP to web server
      const activationPayload = {
        actuatorType: activation.type,
        action: activation.action,
        parameters: {
          duration: activation.duration,
          volume: activation.volume,
          pattern: activation.pattern,
          color: activation.color,
        },
        alert: originalAlert,
        timestamp: new Date().toISOString(),
      };

      console.log(
        `Sending activation command: ${activation.type} -> ${activation.action}`
      );

      const response = await axios.post(
        `${this.serverUrl}/activate-actuator`,
        activationPayload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        }
      );

      console.log(
        `Activation successful: ${activation.type} -> Status: ${response.status}`
      );

      // Publish activation confirmation to MQTT
      const confirmationTopic = `bank_security/zone/${this.zone}/actuators/${activation.type}/activated`;
      this.mqttClient.publish(
        confirmationTopic,
        JSON.stringify({
          ...activationPayload,
          success: true,
          statusCode: response.status,
        }),
        { qos: 1 }
      );
    } catch (error) {
      console.error(
        `Error executing activation for ${activation.type}: ${error.message}`
      );

      // Publish activation error to MQTT
      const errorTopic = `bank_security/zone/${this.zone}/actuators/${activation.type}/error`;
      this.mqttClient.publish(
        errorTopic,
        JSON.stringify({
          activation: activation,
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
        { qos: 1 }
      );
    }
  }

  handleCommand(topic, commandData) {
    // Extract actuator ID from topic
    const topicParts = topic.split("/");
    const actuatorId = topicParts[topicParts.length - 2];

    console.log(
      `Received manual command for actuator ${actuatorId}: ${commandData.action}`
    );

    // Execute the manual command
    this.executeManualCommand(actuatorId, commandData);
  }

  async executeManualCommand(actuatorId, commandData) {
    try {
      const commandPayload = {
        actuatorId: actuatorId,
        action: commandData.action,
        parameters: commandData.parameters || {},
        manual: true,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(
        `${this.serverUrl}/manual-command`,
        commandPayload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        }
      );

      console.log(`Manual command executed successfully for ${actuatorId}`);

      // Publish confirmation
      const confirmationTopic = `bank_security/zone/${this.zone}/actuators/${actuatorId}/command_result`;
      this.mqttClient.publish(
        confirmationTopic,
        JSON.stringify({
          ...commandPayload,
          success: true,
          statusCode: response.status,
        }),
        { qos: 1 }
      );
    } catch (error) {
      console.error(
        `Error executing manual command for ${actuatorId}: ${error.message}`
      );

      // Publish error
      const errorTopic = `bank_security/zone/${this.zone}/actuators/${actuatorId}/command_error`;
      this.mqttClient.publish(
        errorTopic,
        JSON.stringify({
          actuatorId: actuatorId,
          command: commandData,
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
        { qos: 1 }
      );
    }
  }

  getTotalActuatorCount() {
    let count = 0;
    Object.keys(this.actuators).forEach((type) => {
      count += Object.keys(this.actuators[type]).length;
    });
    return count;
  }

  getActiveActuatorCount() {
    let count = 0;
    Object.keys(this.actuators).forEach((type) => {
      Object.keys(this.actuators[type]).forEach((actuatorId) => {
        if (this.actuators[type][actuatorId].active) {
          count++;
        }
      });
    });
    return count;
  }

  startMonitoring() {
    console.log(`Starting ${this.zone} actuator monitoring...`);
    console.log(`Server URL: ${this.serverUrl}`);
    console.log(`MQTT Broker: HiveMQ Cloud`);

    // Initial data fetch
    this.fetchActuatorData();

    setInterval(() => {
      this.fetchActuatorData();
    }, 5000); // Check actuator status every 5 seconds
  }

  // Cleanup method
  shutdown() {
    console.log(`Shutting down ${this.zone} actuator controller...`);

    // Publish offline status
    this.publishControllerStatus("offline");

    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close MQTT connection
    if (this.mqttClient) {
      this.mqttClient.end();
    }
  }
}

// Start the Office Floor 8 Actuator Controller
const controller = new OfficeFloor8ActuatorController();

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Graceful shutdown...");
  controller.shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Graceful shutdown...");
  controller.shutdown();
  process.exit(0);
});

export default OfficeFloor8ActuatorController;
