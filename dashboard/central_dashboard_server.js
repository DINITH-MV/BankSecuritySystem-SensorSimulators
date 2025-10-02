import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 7000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Zone configuration with their web server ports
const ZONES = {
  external_perimeter: { port: 3000, name: "External Perimeter" },
  ground_floor: { port: 3001, name: "Ground Floor" },
  high_security_floor: { port: 3100, name: "High Security Floor" },
  office_floor_1: { port: 3002, name: "Office Floor 1" },
  office_floor_2: { port: 3003, name: "Office Floor 2" },
  office_floor_3: { port: 3004, name: "Office Floor 3" },
  office_floor_4: { port: 3005, name: "Office Floor 4" },
  office_floor_5: { port: 3006, name: "Office Floor 5" },
  office_floor_6: { port: 3007, name: "Office Floor 6" },
  office_floor_7: { port: 3008, name: "Office Floor 7" },
  office_floor_8: { port: 3009, name: "Office Floor 8" },
  office_floor_9: { port: 3010, name: "Office Floor 9" },
  office_floor_10: { port: 3011, name: "Office Floor 10" },
  office_floor_11: { port: 3012, name: "Office Floor 11" },
  office_floor_12: { port: 3013, name: "Office Floor 12" },
  office_floor_13: { port: 3014, name: "Office Floor 13" },
  office_floor_14: { port: 3015, name: "Office Floor 14" },
  office_floor_15: { port: 3016, name: "Office Floor 15" },
  office_floor_16: { port: 3017, name: "Office Floor 16" },
  office_floor_17: { port: 3018, name: "Office Floor 17" },
  office_floor_18: { port: 3019, name: "Office Floor 18" },
  office_floor_19: { port: 3020, name: "Office Floor 19" },
  office_floor_20: { port: 3021, name: "Office Floor 20" },
  office_floor_21: { port: 3022, name: "Office Floor 21" },
  office_floor_22: { port: 3023, name: "Office Floor 22" },
  office_floor_23: { port: 3024, name: "Office Floor 23" },
  office_floor_24: { port: 3025, name: "Office Floor 24" },
  office_floor_25: { port: 3026, name: "Office Floor 25" },
  office_floor_26: { port: 3027, name: "Office Floor 26" },
  office_floor_27: { port: 3028, name: "Office Floor 27" },
  office_floor_28: { port: 3029, name: "Office Floor 28" },
  office_floor_29: { port: 3030, name: "Office Floor 29" },
  office_floor_30: { port: 3031, name: "Office Floor 30" },
};

// Sensor types and their data structures
const SENSOR_TYPES = {
  "AirGradient ONE Environmental Monitor": {
    dataFields: [
      "pm25",
      "pm10",
      "co2",
      "tvoc",
      "nox",
      "temperature",
      "humidity",
      "aqiLevel",
    ],
    randomRange: {
      pm25: { min: 5, max: 155 },
      pm10: { min: 10, max: 200 },
      co2: { min: 400, max: 2400 },
      tvoc: { min: 50, max: 1050 },
      nox: { min: 10, max: 210 },
      temperature: { min: 15, max: 45 },
      humidity: { min: 20, max: 100 },
    },
  },
  "AXIS XFQ1656 Camera": {
    dataFields: [
      "motionDetected",
      "faceDetected",
      "suspiciousBehavior",
      "isRecording",
      "videoQuality",
      "nightVision",
      "explosionProtectionActive",
      "storageUsed",
      "securityRelevant",
    ],
    randomRange: {
      storageUsed: { min: 1, max: 100 },
    },
  },
  "Bosch PIR Motion Detector": {
    dataFields: [
      "motionDetected",
      "motionLevel",
      "heatSignature",
      "batteryLevel",
      "lastMotionTime",
      "sensitivity",
    ],
    randomRange: {
      motionLevel: { min: 1, max: 10 },
      heatSignature: { min: 20, max: 40 },
      batteryLevel: { min: 10, max: 100 },
      sensitivity: { min: 1, max: 10 },
    },
  },
  "HID MiniProx ProxPoint Reader": {
    dataFields: [
      "cardPresented",
      "cardId",
      "accessGranted",
      "accessLevel",
      "doorStatus",
      "batteryLevel",
    ],
    randomRange: {
      batteryLevel: { min: 10, max: 100 },
    },
  },
  "Honeywell DT8016 Motion Detector": {
    dataFields: [
      "motionDetected",
      "motionLevel",
      "heatSignature",
      "batteryLevel",
      "tamperStatus",
    ],
    randomRange: {
      motionLevel: { min: 1, max: 10 },
      heatSignature: { min: 20, max: 40 },
      batteryLevel: { min: 10, max: 100 },
    },
  },
  "i3 Smoke Detector": {
    dataFields: [
      "smokeDetected",
      "smokeLevel",
      "temperature",
      "batteryLevel",
      "testStatus",
    ],
    randomRange: {
      smokeLevel: { min: 0, max: 100 },
      temperature: { min: 15, max: 50 },
      batteryLevel: { min: 10, max: 100 },
    },
  },
  "Schlage CO-100 Keypad Lock": {
    dataFields: [
      "locked",
      "batteryLevel",
      "keypadEntry",
      "accessCode",
      "tamperStatus",
      "lockStatus",
    ],
    randomRange: {
      batteryLevel: { min: 10, max: 100 },
    },
  },
  "Optex SL-200QN Laser Scanner": {
    dataFields: [
      "beamBroken",
      "detectionZone",
      "distanceReading",
      "weatherResistance",
      "alignment",
    ],
    randomRange: {
      detectionZone: { min: 1, max: 5 },
      distanceReading: { min: 0, max: 200 },
    },
  },
  "Optex VX-402R PIR Beam": {
    dataFields: [
      "beamBroken",
      "signalStrength",
      "batteryLevel",
      "tamperStatus",
    ],
    randomRange: {
      signalStrength: { min: 0, max: 100 },
      batteryLevel: { min: 10, max: 100 },
    },
  },
};

// Store all sensor data from zones
let allZoneData = {};
let sensorConfigurations = {};
let randomSensorData = {};

// Dashboard configuration
let dashboardConfig = {
  randomDataEnabled: true,
  updateInterval: 7000,
  alertsEnabled: true,
};

// Helper function to generate random sensor data
function generateRandomSensorData(sensorType, sensorId, location) {
  const sensorConfig = SENSOR_TYPES[sensorType];
  if (!sensorConfig) return {};

  const data = {};

  sensorConfig.dataFields.forEach((field) => {
    if (sensorConfig.randomRange && sensorConfig.randomRange[field]) {
      const range = sensorConfig.randomRange[field];
      data[field] =
        Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    } else {
      // Generate boolean or string values based on field type
      switch (field) {
        case "motionDetected":
        case "faceDetected":
        case "suspiciousBehavior":
        case "isRecording":
        case "cardPresented":
        case "accessGranted":
        case "smokeDetected":
        case "beamBroken":
        case "locked":
        case "securityRelevant":
          data[field] = Math.random() < 0.4; // 10% chance for most boolean events
          break;
        case "videoQuality":
          data[field] = ["720p", "1080p", "4K"][Math.floor(Math.random() * 3)];
          break;
        case "nightVision":
          data[field] = Math.random() < 0.5 ? "active" : "inactive";
          break;
        case "explosionProtectionActive":
          data[field] = Math.random() < 0.99; // Usually active
          break;
        case "aqiLevel":
          const pm25 = data.pm25 || Math.floor(Math.random() * 150) + 5;
          if (pm25 <= 12) data[field] = "GOOD";
          else if (pm25 <= 35) data[field] = "MODERATE";
          else if (pm25 <= 55) data[field] = "UNHEALTHY_FOR_SENSITIVE";
          else if (pm25 <= 150) data[field] = "UNHEALTHY";
          else data[field] = "HAZARDOUS";
          break;
        case "doorStatus":
        case "lockStatus":
          data[field] = Math.random() < 0.8 ? "closed" : "open";
          break;
        case "tamperStatus":
        case "testStatus":
          data[field] = Math.random() < 0.95 ? "normal" : "tampered";
          break;
        case "accessLevel":
          data[field] = ["employee", "visitor", "admin", "security"][
            Math.floor(Math.random() * 4)
          ];
          break;
        case "cardId":
          data[field] = `CARD_${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`;
          break;
        case "accessCode":
          data[field] = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
          break;
        case "keypadEntry":
          data[field] =
            Math.random() < 0.1
              ? Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0")
              : null;
          break;
        case "lastMotionTime":
          data[field] = Math.random() < 0.1 ? new Date().toISOString() : null;
          break;
        case "weatherResistance":
          data[field] = Math.random() < 0.99 ? "operational" : "degraded";
          break;
        case "alignment":
          data[field] = Math.random() < 0.95 ? "aligned" : "misaligned";
          break;
        default:
          data[field] = null;
      }
    }
  });

  return data;
}

// Fetch data from all zones
async function fetchAllZoneData() {
  const promises = Object.entries(ZONES).map(async ([zoneName, zoneConfig]) => {
    try {
      // Fetch both sensor and actuator data
      const [sensorResponse, actuatorResponse] = await Promise.all([
        axios.get(`http://localhost:${zoneConfig.port}/sensor-data`, {
          timeout: 2000,
        }),
        axios.get(`http://localhost:${zoneConfig.port}/actuator-data`, {
          timeout: 2000,
        }),
      ]);

      return {
        zone: zoneName,
        data: sensorResponse.data,
        actuators: actuatorResponse.data,
        status: "online",
      };
    } catch (error) {
      return {
        zone: zoneName,
        data: [],
        actuators: [],
        status: "offline",
        error: error.message,
      };
    }
  });

  const results = await Promise.all(promises);

  results.forEach((result) => {
    allZoneData[result.zone] = {
      ...result,
      lastUpdate: new Date().toISOString(),
    };
  });
}

// API Endpoints

// Main dashboard page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Get all zone data
app.get("/api/zones", async (req, res) => {
  await fetchAllZoneData();
  res.json(allZoneData);
});

// Get specific zone data
app.get("/api/zones/:zoneName", async (req, res) => {
  const { zoneName } = req.params;
  if (!ZONES[zoneName]) {
    return res.status(404).json({ error: "Zone not found" });
  }

  try {
    // Fetch both sensor and actuator data
    const [sensorResponse, actuatorResponse] = await Promise.all([
      axios.get(`http://localhost:${ZONES[zoneName].port}/sensor-data`, {
        timeout: 2000,
      }),
      axios.get(`http://localhost:${ZONES[zoneName].port}/actuator-data`, {
        timeout: 2000,
      }),
    ]);

    res.json({
      zone: zoneName,
      name: ZONES[zoneName].name,
      data: sensorResponse.data,
      actuators: actuatorResponse.data,
      status: "online",
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      zone: zoneName,
      name: ZONES[zoneName].name,
      data: [],
      actuators: [],
      status: "offline",
      error: error.message,
      lastUpdate: new Date().toISOString(),
    });
  }
});

// Update sensor data (random mode)
app.post("/api/sensors/:sensorId/update", (req, res) => {
  const { sensorId } = req.params;
  const { data } = req.body;

  randomSensorData[sensorId] = {
    ...data,
    timestamp: new Date().toISOString(),
    random: true,
  };

  res.json({ message: "Sensor data updated successfully", sensorId, data });
});

// Generate random data for specific sensor
app.post("/api/sensors/:sensorId/random", (req, res) => {
  const { sensorId } = req.params;
  const { sensorType, location } = req.body;

  if (!SENSOR_TYPES[sensorType]) {
    return res.status(400).json({ error: "Unknown sensor type" });
  }

  const randomData = generateRandomSensorData(sensorType, sensorId, location);

  randomSensorData[sensorId] = {
    sensorId,
    sensorType,
    location,
    timestamp: new Date().toISOString(),
    data: randomData,
    manual: false,
    random: true,
  };

  res.json({
    message: "Random data generated successfully",
    sensorId,
    data: randomData,
  });
});

// Get sensor types and their configurations
app.get("/api/sensor-types", (req, res) => {
  res.json(SENSOR_TYPES);
});

// Update dashboard configuration
app.post("/api/config", (req, res) => {
  dashboardConfig = { ...dashboardConfig, ...req.body };
  res.json({ message: "Configuration updated", config: dashboardConfig });
});

// Get dashboard configuration
app.get("/api/config", (req, res) => {
  res.json(dashboardConfig);
});

// Send command to actuator in specific zone
app.post(
  "/api/zones/:zoneName/actuators/:actuatorType/command",
  async (req, res) => {
    const { zoneName, actuatorType } = req.params;
    const command = req.body;

    if (!ZONES[zoneName]) {
      return res.status(404).json({ error: "Zone not found" });
    }

    try {
      const endpoint =
        actuatorType === "siren" ? "siren-commands" : "beacon-commands";
      const response = await axios.post(
        `http://localhost:${ZONES[zoneName].port}/${endpoint}/${zoneName}`,
        command,
        { timeout: 2000 }
      );

      res.json({
        message: `${actuatorType} command sent successfully`,
        zone: zoneName,
        command,
        response: response.data,
      });
    } catch (error) {
      res.status(500).json({
        error: `Failed to send ${actuatorType} command`,
        zone: zoneName,
        message: error.message,
      });
    }
  }
);

// Get zone statistics
app.get("/api/zones/:zoneName/stats", async (req, res) => {
  const { zoneName } = req.params;
  if (!ZONES[zoneName]) {
    return res.status(404).json({ error: "Zone not found" });
  }

  try {
    const response = await axios.get(
      `http://localhost:${ZONES[zoneName].port}/health`,
      {
        timeout: 2000,
      }
    );
    res.json(response.data);
  } catch (error) {
    res.json({
      zone: zoneName,
      status: "offline",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Get random sensor data
app.get("/api/random-sensors", (req, res) => {
  res.json(randomSensorData);
});

// Clear random sensor data
app.delete("/api/random-sensors", (req, res) => {
  randomSensorData = {};
  res.json({ message: "Random sensor data cleared" });
});

// Clear specific random sensor data
app.delete("/api/random-sensors/:sensorId", (req, res) => {
  const { sensorId } = req.params;
  if (randomSensorData[sensorId]) {
    delete randomSensorData[sensorId];
    res.json({ message: `Random data for ${sensorId} cleared` });
  } else {
    res.status(404).json({ error: "Sensor not found in random data" });
  }
});

// Global system status
app.get("/api/system/status", async (req, res) => {
  await fetchAllZoneData();

  const totalZones = Object.keys(ZONES).length;
  const onlineZones = Object.values(allZoneData).filter(
    (zone) => zone.status === "online"
  ).length;
  const totalSensors = Object.values(allZoneData).reduce(
    (sum, zone) => sum + (zone.data?.length || 0),
    0
  );
  const totalActuators = Object.values(allZoneData).reduce(
    (sum, zone) => sum + (zone.actuators?.length || 0),
    0
  );
  const activeActuators = Object.values(allZoneData).reduce((sum, zone) => {
    if (!zone.actuators) return sum;
    return (
      sum +
      zone.actuators.filter((actuator) => {
        // Check if actuator is active based on its type
        if (actuator.deviceType === "siren") {
          return actuator.active === true;
        } else if (actuator.deviceType === "beacon") {
          return actuator.data?.beaconStatus === "ON";
        }
        return false;
      }).length
    );
  }, 0);
  const randomSensors = Object.keys(randomSensorData).length;

  res.json({
    timestamp: new Date().toISOString(),
    zones: {
      total: totalZones,
      online: onlineZones,
      offline: totalZones - onlineZones,
    },
    sensors: {
      total: totalSensors,
    },
    actuators: {
      total: totalActuators,
      active: activeActuators,
      inactive: totalActuators - activeActuators,
    },
    config: dashboardConfig,
    systemHealth:
      onlineZones === totalZones
        ? "healthy"
        : onlineZones > 0
        ? "degraded"
        : "critical",
  });
});

// Start periodic data fetching
setInterval(fetchAllZoneData, dashboardConfig.updateInterval);

// Initial data fetch
fetchAllZoneData();

// Start server
app.listen(port, () => {
  console.log(`========================================`);
  console.log(`CENTRAL SECURITY DASHBOARD SERVER`);
  console.log(`========================================`);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Dashboard: http://localhost:${port}`);
  console.log(`========================================`);
  console.log(`API Endpoints:`);
  console.log(`  GET  /api/zones - Get all zone data`);
  console.log(`  GET  /api/zones/:zoneName - Get specific zone data`);
  console.log(`  POST /api/sensors/:sensorId/update - Update sensor manually`);
  console.log(`  POST /api/sensors/:sensorId/random - Generate random data`);
  console.log(`  GET  /api/sensor-types - Get sensor type configurations`);
  console.log(`  POST /api/config - Update dashboard configuration`);
  console.log(`  GET  /api/config - Get dashboard configuration`);
  console.log(
    `  POST /api/zones/:zone/actuators/:type/command - Send actuator command`
  );
  console.log(`  GET  /api/zones/:zoneName/stats - Get zone statistics`);
  console.log(`  GET  /api/system/status - Get overall system status`);
  console.log(`========================================`);
  console.log(`Monitoring Zones:`);
  Object.entries(ZONES).forEach(([zone, config]) => {
    console.log(`  ${config.name} (${zone}) - Port ${config.port}`);
  });
  console.log(`========================================`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Central Dashboard Server...");
  process.exit(0);
});
