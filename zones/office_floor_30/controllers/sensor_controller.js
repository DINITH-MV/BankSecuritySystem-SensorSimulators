import axios from "axios";
import mqtt from "mqtt";

class OfficeFloor30SensorController {
  constructor() {
    this.zone = "office_floor_30";
    this.sensors = {};
    this.serverUrl = "http://localhost:3031";

    // MQTT setup for HiveMQ Cloud
    const mqttOptions = {
      host: "6dbb5584fc034837b3d101db50a3cfb7.s1.eu.hivemq.cloud",
      port: 8883, // TLS port for HiveMQ Cloud
      protocol: "mqtts", // Secure MQTT over TLS
      username: "hivemq.webclient.1756342321561", // Replace with your HiveMQ Cloud username
      password: "O7l&$%k;vDa1No0BZ9fG", // Replace with your HiveMQ Cloud password
      clientId: `office_floor_30_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      rejectUnauthorized: true, // Verify SSL certificate
    };

    this.mqttClient = mqtt.connect(mqttOptions);
    this.setupMQTT();

    this.startMonitoring();
  }

  setupMQTT() {
    this.mqttClient.on("connect", () => {
      console.log("Office Floor 30 Sensor Controller connected to MQTT");

      // Publish initial status
      this.publishControllerStatus("online");

      // Set up periodic heartbeat
      this.heartbeatInterval = setInterval(() => {
        this.publishHeartbeat();
      }, 30000); // Every 30 seconds
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
    const statusTopic = `bank_security/zone/${this.zone}/controller/status`;
    const statusData = {
      zone: this.zone,
      status: status,
      timestamp: new Date().toISOString(),
      totalSensors: this.getTotalSensorCount(),
      activeSensors: this.getActiveSensorCount(),
    };

    this.mqttClient.publish(
      statusTopic,
      JSON.stringify(statusData),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(`Error publishing controller status:`, err.message);
        } else {
          console.log(`Published controller status: ${status}`);
        }
      }
    );
  }

  publishHeartbeat() {
    const heartbeatTopic = `bank_security/zone/${this.zone}/controller/heartbeat`;
    const heartbeatData = {
      zone: this.zone,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      totalSensors: this.getTotalSensorCount(),
      activeSensors: this.getActiveSensorCount(),
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
          console.log(`Published heartbeat for ${this.zone}`);
        }
      }
    );
  }

  publishErrorStatus(error) {
    const errorTopic = `bank_security/zone/${this.zone}/controller/error`;
    const errorData = {
      zone: this.zone,
      timestamp: new Date().toISOString(),
      error: error.message || "Unknown error",
      errorCode: error.code,
      serverUrl: this.serverUrl,
    };

    this.mqttClient.publish(
      errorTopic,
      JSON.stringify(errorData),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(`Error publishing error status:`, err.message);
        } else {
          console.log(`Published error status to MQTT`);
        }
      }
    );
  }

  async fetchSensorData() {
    try {
      const response = await axios.get(`${this.serverUrl}/sensor-data`);
      const sensorDataArray = response.data;

      this.lastDataFetch = new Date().toISOString();
      console.log(
        `Fetched ${sensorDataArray.length} sensor readings from web server`
      );

      sensorDataArray.forEach((sensorData) => {
        this.processSensorData(sensorData);
      });
    } catch (error) {
      console.error(
        "Error fetching sensor data from web server:",
        error.code || error.message || "Unknown error"
      );
      if (error.response) {
        console.error(`Server responded with status: ${error.response.status}`);
      } else if (error.request) {
        console.error(`No response received from server at ${this.serverUrl}`);
        console.error("Make sure the web server is running on port 3031");
      } else {
        console.error("Request setup error:", error.message);
      }

      // Publish error status
      this.publishErrorStatus(error);
    }
  }

  processSensorData(data) {
    const {
      sensorId,
      sensorType,
      location,
      timestamp,
      active,
      status,
      type,
      ...sensorSpecificData
    } = data;

    // Initialize sensor type if it doesn't exist
    if (!this.sensors[sensorType]) {
      this.sensors[sensorType] = {};
    }

    // Initialize or update sensor
    if (!this.sensors[sensorType][sensorId]) {
      this.sensors[sensorType][sensorId] = {
        active: active,
        location: location,
        status: status,
        type: type,
        lastUpdate: timestamp,
        lastReading: sensorSpecificData,
      };
      console.log(
        `New ${sensorType} sensor registered: ${sensorId} at ${location}`
      );
    } else {
      // Update existing sensor
      this.sensors[sensorType][sensorId].lastReading = sensorSpecificData;
      this.sensors[sensorType][sensorId].lastUpdate = timestamp;
      this.sensors[sensorType][sensorId].active = active;
      this.sensors[sensorType][sensorId].status = status;
    }

    // Publish sensor data to MQTT
    this.publishSensorDataToMQTT(data);

    // Check for alerts based on sensor data
    this.checkForAlerts(sensorId, sensorType, data);
  }

  publishSensorDataToMQTT(data) {
    const { sensorId, sensorType } = data;

    // Construct MQTT topic based on sensor type
    const topic = `bank_security/zone/${this.zone}/sensors/${sensorType}/${sensorId}`;

    // Prepare payload with complete sensor data
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
            `Error publishing sensor data to ${topic}:`,
            err.message
          );
        } else {
          console.log(`Published sensor data to: ${topic}`);
        }
      }
    );
  }

  checkForAlerts(sensorId, sensorType, data) {
    let alert = null;

    // Motion detector alerts - Office specific logic
    if (
      sensorType === "Bosch Blue Line PIR" &&
      data.data &&
      data.data.motionDetected
    ) {
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay(); // 0=Sunday, 6=Saturday
      const isBusinessHours =
        currentHour >= 8 &&
        currentHour <= 18 &&
        currentDay >= 1 &&
        currentDay <= 5;

      alert = {
        type: isBusinessHours
          ? "OFFICE_MOTION_DETECTED"
          : "AFTER_HOURS_MOTION_DETECTED",
        severity: isBusinessHours ? "low" : "medium",
        data: {
          location: data.location,
          timestamp: data.timestamp,
          sensorId: sensorId,
          heatSignature: data.data.heatSignature,
          businessHours: isBusinessHours,
        },
      };
    }

    // Access reader alerts - Office specific
    if (
      sensorType === "HID ProxPoint Plus Card Reader" &&
      data.data &&
      data.data.cardPresented
    ) {
      if (!data.data.accessGranted) {
        alert = {
          type: "UNAUTHORIZED_OFFICE_ACCESS_ATTEMPT",
          severity: "high",
          data: {
            location: data.location,
            timestamp: data.timestamp,
            sensorId: sensorId,
            cardId: data.data.cardId,
            accessLevel: data.data.accessLevel,
          },
        };
      }
    }

    // Camera alerts - Office specific
    if (
      sensorType === "AXIS XFQ1656 Camera" &&
      data.data &&
      data.data.securityRelevant
    ) {
      alert = {
        type: "OFFICE_SECURITY_CAMERA_EVENT",
        severity: data.data.suspiciousBehavior ? "high" : "medium",
        data: {
          location: data.location,
          timestamp: data.timestamp,
          sensorId: sensorId,
          motionDetected: data.data.motionDetected,
          faceDetected: data.data.faceDetected,
          suspiciousBehavior: data.data.suspiciousBehavior,
        },
      };
    }

    // Honeywell motion detector alerts
    if (
      sensorType === "Honeywell DT8016 DualTech" &&
      data.data &&
      data.data.motionDetected
    ) {
      alert = {
        type: "OFFICE_ENTRANCE_MOTION_DETECTED",
        severity: "medium",
        data: {
          location: data.location,
          timestamp: data.timestamp,
          sensorId: sensorId,
          motionLevel: data.data.motionLevel,
          temperature: data.data.temperature,
        },
      };
    }

    if (alert) {
      this.triggerAlert(sensorId, alert);
    }
  }

  triggerAlert(sensorId, alert) {
    const alertData = {
      zone: this.zone,
      sensorId: sensorId,
      alertType: alert.type,
      severity: alert.severity,
      timestamp: new Date().toISOString(),
      data: alert.data,
    };
    console.log(
      `Office Floor 30 ALERT TRIGGERED: ${alert.type} - ${alert.severity}`
    );

    // Publish alert to MQTT
    const alertTopic = `bank_security/zone/${this.zone}/alerts/${sensorId}`;
    this.mqttClient.publish(
      alertTopic,
      JSON.stringify(alertData),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(
            `Error publishing alert to ${alertTopic}:`,
            err.message
          );
        } else {
          console.log(`Published alert to: ${alertTopic}`);
        }
      }
    );
  }

  updateSensorStatus(sensorId, data) {
    // Update sensor status in local storage
    for (const sensorType in this.sensors) {
      if (this.sensors[sensorType][sensorId]) {
        this.sensors[sensorType][sensorId].lastReading = data;
        this.sensors[sensorType][sensorId].lastUpdate =
          new Date().toISOString();
        break;
      }
    }
  }

  getTotalSensorCount() {
    let count = 0;
    Object.keys(this.sensors).forEach((type) => {
      count += Object.keys(this.sensors[type]).length;
    });
    return count;
  }

  getActiveSensorCount() {
    let count = 0;
    Object.keys(this.sensors).forEach((type) => {
      Object.keys(this.sensors[type]).forEach((sensorId) => {
        if (this.sensors[type][sensorId].active) {
          count++;
        }
      });
    });
    return count;
  }

  startMonitoring() {
    console.log(`Starting ${this.zone} sensor monitoring...`);
    console.log(`Server URL: ${this.serverUrl}`);
    console.log(`MQTT Broker: mqtt://localhost:1883`);

    // Initial data fetch
    this.fetchSensorData();

    setInterval(() => {
      this.fetchSensorData();
    }, 3000);
  }

  // Cleanup method
  shutdown() {
    console.log(`Shutting down ${this.zone} sensor controller...`);

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

// Start the Office Floor 30 Sensor Controller
const controller = new OfficeFloor30SensorController();

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

export default OfficeFloor30SensorController;
