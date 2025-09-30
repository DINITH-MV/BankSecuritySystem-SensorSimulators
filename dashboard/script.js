// Global variables
let dashboardConfig = {
  randomDataEnabled: true,
  updateInterval: 5000,
  alertsEnabled: true,
  autoRefresh: true,
};

let allZonesData = {};
let currentActuatorModal = null;
let updateTimer = null;
let sensorTypes = {};

// Initialize dashboard
document.addEventListener("DOMContentLoaded", function () {
  initializeDashboard();
  setupEventListeners();
  loadConfiguration();
  startAutoUpdate();
});

// Initialize dashboard
async function initializeDashboard() {
  showNotification("Dashboard initializing...", "info");
  await loadSensorTypes();
  await updateDashboard();
}

// Setup event listeners
function setupEventListeners() {
  // Header controls
  document
    .getElementById("refreshBtn")
    .addEventListener("click", updateDashboard);
  document
    .getElementById("settingsBtn")
    .addEventListener("click", openSettingsModal);
  document
    .getElementById("actuatorDashboardBtn")
    .addEventListener("click", openActuatorDashboard);

  // Modal controls
  document
    .getElementById("closeSettingsModal")
    .addEventListener("click", closeSettingsModal);
  document
    .getElementById("closeActuatorModal")
    .addEventListener("click", closeActuatorModal);

  // Settings modal controls
  document
    .getElementById("saveSettingsBtn")
    .addEventListener("click", saveSettings);
  document
    .getElementById("cancelSettingsBtn")
    .addEventListener("click", closeSettingsModal);

  // Actuator modal controls
  document
    .getElementById("sendActuatorCommandBtn")
    .addEventListener("click", sendActuatorCommand);
  document
    .getElementById("cancelActuatorBtn")
    .addEventListener("click", closeActuatorModal);

  // Close modals when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
    }
  });
}

// Load sensor types configuration
async function loadSensorTypes() {
  try {
    const response = await fetch("/api/sensor-types");
    sensorTypes = await response.json();
  } catch (error) {
    console.error("Error loading sensor types:", error);
    showNotification("Error loading sensor configurations", "error");
  }
}

// Load dashboard configuration
async function loadConfiguration() {
  try {
    const response = await fetch("/api/config");
    dashboardConfig = await response.json();
  } catch (error) {
    console.error("Error loading configuration:", error);
  }
}

// Update dashboard data
async function updateDashboard() {
  try {
    updateSystemStatus("loading");

    // Fetch system status
    const systemResponse = await fetch("/api/system/status");
    const systemData = await systemResponse.json();
    updateSystemOverview(systemData);

    // Fetch zones data
    const zonesResponse = await fetch("/api/zones");
    allZonesData = await zonesResponse.json();
    renderZones();

    updateSystemStatus("online");
    document.getElementById(
      "lastUpdate"
    ).textContent = `Last Update: ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error updating dashboard:", error);
    updateSystemStatus("error");
    showNotification("Error updating dashboard data", "error");
  }
}

// Update system status indicator
function updateSystemStatus(status) {
  const indicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");

  indicator.className = "status-indicator";

  switch (status) {
    case "online":
      indicator.classList.add("online");
      statusText.textContent = "System Online";
      break;
    case "warning":
      indicator.classList.add("warning");
      statusText.textContent = "System Warning";
      break;
    case "error":
      indicator.classList.add("danger");
      statusText.textContent = "System Error";
      break;
    case "loading":
      statusText.textContent = "Updating...";
      break;
    default:
      statusText.textContent = "Connecting...";
  }
}

// Update system overview cards
function updateSystemOverview(systemData) {
  document.getElementById("totalZones").textContent = systemData.zones.total;
  document.getElementById(
    "onlineZones"
  ).textContent = `${systemData.zones.online} Online`;
  document.getElementById(
    "offlineZones"
  ).textContent = `${systemData.zones.offline} Offline`;

  document.getElementById("totalSensors").textContent =
    systemData.sensors.total;

  // Mock alert data for now
  document.getElementById("activeAlerts").textContent = "0";
  document.getElementById("criticalAlerts").textContent = "0 Critical";
  document.getElementById("warningAlerts").textContent = "0 Warning";

  document.getElementById("systemHealth").textContent =
    systemData.systemHealth.toUpperCase();

  // Update health bar
  const healthProgress = document.getElementById("healthProgress");
  const healthPercentage =
    (systemData.zones.online / systemData.zones.total) * 100;
  healthProgress.style.width = `${healthPercentage}%`;

  if (healthPercentage === 100) {
    healthProgress.style.background =
      "linear-gradient(90deg, #28a745 0%, #20c997 100%)";
  } else if (healthPercentage >= 50) {
    healthProgress.style.background =
      "linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)";
  } else {
    healthProgress.style.background =
      "linear-gradient(90deg, #dc3545 0%, #e55353 100%)";
  }
}

// Render zones
function renderZones() {
  const container = document.getElementById("zonesContainer");
  container.innerHTML = "";

  Object.entries(allZonesData).forEach(([zoneName, zoneData]) => {
    const zoneCard = createZoneCard(zoneName, zoneData);
    container.appendChild(zoneCard);
  });
}

// Create zone card
function createZoneCard(zoneName, zoneData) {
  const card = document.createElement("div");
  card.className = "card zone-card";

  const sensors = zoneData.data || [];
  const sensorsByType = groupSensorsByType(sensors);

  card.innerHTML = `
        <div class="zone-header">
            <h3 class="zone-title">
                <i class="fas fa-building"></i>
                ${zoneData.name || zoneName.replace(/_/g, " ").toUpperCase()}
            </h3>
            <span class="zone-status ${
              zoneData.status
            }">${zoneData.status.toUpperCase()}</span>
        </div>
        <div class="zone-body">
            <div class="zone-stats">
                <div class="zone-stat">
                    <div class="zone-stat-value">${sensors.length}</div>
                    <div class="zone-stat-label">Sensors</div>
                </div>
                <div class="zone-stat">
                    <div class="zone-stat-value">${
                      Object.keys(sensorsByType).length
                    }</div>
                    <div class="zone-stat-label">Types</div>
                </div>
                <div class="zone-stat">
                    <div class="zone-stat-value">${
                      zoneData.status === "online" ? sensors.length : 0
                    }</div>
                    <div class="zone-stat-label">Active</div>
                </div>
            </div>
            
            ${
              sensors.length > 0
                ? `
                <div class="sensors-list">
                    <h4><i class="fas fa-satellite-dish"></i> Sensors</h4>
                    ${sensors
                      .map((sensor) => createSensorItem(sensor, zoneName))
                      .join("")}
                </div>
            `
                : '<div class="sensors-list"><h4><i class="fas fa-satellite-dish"></i> Sensors</h4><p class="text-center">No sensors available</p></div>'
            }
        </div>
    `;

  return card;
}

// Group sensors by type
function groupSensorsByType(sensors) {
  return sensors.reduce((groups, sensor) => {
    const type = sensor.sensorType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(sensor);
    return groups;
  }, {});
}

// Create sensor item
function createSensorItem(sensor) {
  const isRandom = sensor.random || false;
  const statusClass = isRandom ? "random" : "active";

  return `
        <div class="sensor-item">
            <div class="sensor-info">
                <div class="sensor-id">
                    <span class="sensor-status ${statusClass}"></span>
                    ${sensor.sensorId}
                </div>
                <div class="sensor-type">${sensor.sensorType}</div>
                <div class="sensor-location">${sensor.location}</div>
                ${
                  sensor.data
                    ? `
                    <div class="sensor-data">
                        ${formatSensorData(sensor.data)}
                    </div>
                `
                    : ""
                }
            </div>
        </div>
    `;
}

// Format sensor data for display
function formatSensorData(data) {
  const entries = Object.entries(data).slice(0, 3); // Show first 3 fields
  return entries
    .map(([key, value]) => {
      let displayValue = value;
      if (typeof value === "boolean") {
        displayValue = value ? "Yes" : "No";
      } else if (typeof value === "number") {
        displayValue = value.toFixed(1);
      }
      return `<strong>${key}:</strong> ${displayValue}`;
    })
    .join(" • ");
}

// Open actuator modal
window.openActuatorModal = function (zoneName, actuatorType) {
  currentActuatorModal = { zoneName, actuatorType };

  document.getElementById("modalActuatorZone").textContent = zoneName
    .replace(/_/g, " ")
    .toUpperCase();
  document.getElementById("modalActuatorType").textContent =
    actuatorType.toUpperCase();

  generateActuatorControls(actuatorType);
  document.getElementById("actuatorModal").style.display = "block";
};

// Generate actuator controls
function generateActuatorControls(actuatorType) {
  const container = document.getElementById("actuatorControls");

  if (actuatorType === "siren") {
    container.innerHTML = `
            <div class="form-group">
                <label for="sirenActive">Active:</label>
                <select id="sirenActive">
                    <option value="true">On</option>
                    <option value="false">Off</option>
                </select>
            </div>
            <div class="form-group">
                <label for="sirenVolume">Volume (%):</label>
                <input type="number" id="sirenVolume" min="0" max="100" value="50">
            </div>
            <div class="form-group">
                <label for="sirenTone">Tone:</label>
                <select id="sirenTone">
                    <option value="continuous">Continuous</option>
                    <option value="pulsed">Pulsed</option>
                    <option value="warble">Warble</option>
                </select>
            </div>
        `;
  } else if (actuatorType === "beacon") {
    container.innerHTML = `
            <div class="form-group">
                <label for="beaconActive">Active:</label>
                <select id="beaconActive">
                    <option value="true">On</option>
                    <option value="false">Off</option>
                </select>
            </div>
            <div class="form-group">
                <label for="beaconColor">Color:</label>
                <select id="beaconColor">
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                </select>
            </div>
            <div class="form-group">
                <label for="beaconBrightness">Brightness (%):</label>
                <input type="number" id="beaconBrightness" min="0" max="100" value="100">
            </div>
            <div class="form-group">
                <label for="beaconPattern">Pattern:</label>
                <select id="beaconPattern">
                    <option value="steady">Steady</option>
                    <option value="flashing">Flashing</option>
                    <option value="strobe">Strobe</option>
                </select>
            </div>
        `;
  }
}

// Send actuator command
async function sendActuatorCommand() {
  if (!currentActuatorModal) return;

  const { zoneName, actuatorType } = currentActuatorModal;
  const command = {};

  if (actuatorType === "siren") {
    command.active = document.getElementById("sirenActive").value === "true";
    command.volume = parseInt(document.getElementById("sirenVolume").value);
    command.tone = document.getElementById("sirenTone").value;
  } else if (actuatorType === "beacon") {
    command.active = document.getElementById("beaconActive").value === "true";
    command.color = document.getElementById("beaconColor").value;
    command.brightness = parseInt(
      document.getElementById("beaconBrightness").value
    );
    command.pattern = document.getElementById("beaconPattern").value;
  }

  try {
    const response = await fetch(
      `/api/zones/${zoneName}/actuators/${actuatorType}/command`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      }
    );

    if (response.ok) {
      showNotification(`${actuatorType} command sent successfully`, "success");
      closeActuatorModal();
    } else {
      throw new Error("Command failed");
    }
  } catch (error) {
    console.error("Error sending actuator command:", error);
    showNotification("Error sending actuator command", "error");
  }
}

// Close actuator modal
function closeActuatorModal() {
  document.getElementById("actuatorModal").style.display = "none";
  currentActuatorModal = null;
}

// Open settings modal
function openSettingsModal() {
  document.getElementById("updateInterval").value =
    dashboardConfig.updateInterval / 1000;
  document.getElementById("alertsEnabled").checked =
    dashboardConfig.alertsEnabled;
  document.getElementById("autoRefresh").checked = dashboardConfig.autoRefresh;

  document.getElementById("settingsModal").style.display = "block";
}

// Open actuator dashboard
function openActuatorDashboard() {
  // Create and open actuator dashboard in new window/tab
  window.open("actuator_dashboard.html", "_blank", "width=1200,height=800");
}

// Close settings modal
function closeSettingsModal() {
  document.getElementById("settingsModal").style.display = "none";
}

// Save settings
async function saveSettings() {
  const newConfig = {
    ...dashboardConfig,
    updateInterval:
      parseInt(document.getElementById("updateInterval").value) * 1000,
    alertsEnabled: document.getElementById("alertsEnabled").checked,
    autoRefresh: document.getElementById("autoRefresh").checked,
  };

  try {
    const response = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    });

    if (response.ok) {
      dashboardConfig = newConfig;
      showNotification("Settings saved successfully", "success");
      closeSettingsModal();

      // Restart auto update with new interval
      if (dashboardConfig.autoRefresh) {
        startAutoUpdate();
      } else {
        stopAutoUpdate();
      }
    } else {
      throw new Error("Save failed");
    }
  } catch (error) {
    console.error("Error saving settings:", error);
    showNotification("Error saving settings", "error");
  }
}

// Start auto update
function startAutoUpdate() {
  stopAutoUpdate();
  if (dashboardConfig.autoRefresh) {
    updateTimer = setInterval(updateDashboard, dashboardConfig.updateInterval);
  }
}

// Stop auto update
function stopAutoUpdate() {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
}

// Show notification
function showNotification(message, type = "info", duration = 3000) {
  const container = document.getElementById("notifications");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, duration);
}

// Utility function to format timestamps
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}
