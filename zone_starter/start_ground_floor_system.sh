#!/bin/bash

echo "==============================================="
echo "      GROUND FLOOR - ENHANCED SECURITY SYSTEM"
echo "==============================================="
echo "Starting enhanced web server, sensors, actuators and controllers..."
echo "With command-driven control and security monitoring..."
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# First start the web server with enhanced features
echo "Starting Enhanced Ground Floor Web Server (Port 3001)..."
echo "- Command endpoints for siren/beacon control"
echo "- Security alert monitoring system"
echo "- Dashboard and statistics endpoints"
cd "$SCRIPT_DIR/../web_server" && nohup node ground_floor_web_server.js > /dev/null 2>&1 &
sleep 3

echo ""
echo "Starting Ground Floor Sensors:"
echo "=============================="

echo "Starting AXIS Camera Nodes..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node AXIS_XFQ1656_camera_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting AirGradient Environmental Monitor..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node AirGradient_ONE_monitor_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting Bosch PIR Motion Detectors..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node Bosch_PIR_motion_detector_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting HID Card Readers..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node HID_MiniProx_proxpoint_reader.js > /dev/null 2>&1 &
sleep 1

echo "Starting Honeywell Motion Detectors..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node Honeywell_DT8016_motion_detector_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting i3 Smoke Detectors..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node i3_smoke_detector_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting Schlage Keypad Locks..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node Schlage_CO-100_keypad_lock.js > /dev/null 2>&1 &
sleep 1

echo "Starting Schlage Lock Nodes..."
cd "$SCRIPT_DIR/../zones/ground_floor/sensors" && nohup node schlage_keypad_lock_node.js > /dev/null 2>&1 &
sleep 1

echo ""
echo "Starting Ground Floor Actuators (Command-Driven):"
echo "================================================="

echo "Starting E2S Sirens (Web Server Command Control)..."
echo "- 4x Sirens: SIREN_GF_001 to SIREN_GF_004"
echo "- Locations: Main Lobby, Reception, Emergency Exit, Stairwell"
cd "$SCRIPT_DIR/../zones/ground_floor/actuators" && nohup node E2S_HMA121_Hootronic_siren.js > /dev/null 2>&1 &
sleep 2

echo "Starting Werma LED Beacons (Web Server Command Control)..."
echo "- 4x Beacons: BEACON_GF_001 to BEACON_GF_004"
echo "- Locations: Lobby Entrance, Reception Desk, Elevator Bay, Assembly Point"
cd "$SCRIPT_DIR/../zones/ground_floor/actuators" && nohup node Werma_D62_LED_beacon_node.js > /dev/null 2>&1 &
sleep 2

echo ""
echo "Starting Ground Floor Controllers (Enhanced):"
echo "============================================="

echo "Starting Sensor Controller..."
echo "- MQTT integration and web server communication"
cd "$SCRIPT_DIR/../zones/ground_floor/controllers" && nohup node sensor_controller.js > /dev/null 2>&1 &
sleep 2

echo "Starting Enhanced Actuator Controller..."
echo "- Command-driven siren/beacon control"
echo "- MQTT status message handling"
echo "- Web server command distribution"
cd "$SCRIPT_DIR/../zones/ground_floor/controllers" && nohup node actuator_controller.js > /dev/null 2>&1 &
sleep 3

echo ""
echo "==============================================="
echo "   GROUND FLOOR ENHANCED SECURITY SYSTEM STARTED"
echo "==============================================="
echo "All components are now running with enhanced features:"
echo ""
echo "Enhanced Web Server (localhost:3001):"
echo "- Standard sensor/actuator data endpoints"
echo "- Siren command endpoints (/siren-commands/ground_floor)"
echo "- Beacon command endpoints (/beacon-commands/ground_floor)"
echo "- Security alerts system (/ground-floor-alerts)"
echo "- Activity statistics (/ground-floor-stats)"
echo "- Dashboard overview (/ground-floor-dashboard)"
echo ""
echo "Sensors (Security Monitoring):"
echo "- 4x AXIS XFQ1656 Cameras with security event detection"
echo "- 4x AirGradient Environmental Monitors (PM2.5, CO2, Temperature, Humidity)"
echo "- 7x Bosch PIR Motion Detectors with area-based monitoring"
echo "- 8x HID Card Readers with access control alerts"
echo "- 2x Honeywell DT8016 Motion Detectors"
echo "- Multiple i3 Smoke Detectors with critical alerts"
echo "- Multiple Schlage Keypad Locks with unauthorized access detection"
echo ""
echo "Command-Driven Actuators:"
echo "- 4x E2S HMA121 Sirens (SIREN_GF_001-004)"
echo "  * Polling web server for activation commands"
echo "  * Pattern control: continuous, pulsed, warble, yelp"
echo "  * Auto-deactivation based on duration settings"
echo "- 4x Werma D62 LED Beacons (BEACON_GF_001-004)"
echo "  * Polling web server for activation commands"
echo "  * Color and pattern control (steady, flashing, rotating, strobe)"
echo "  * Brightness and visibility management"
echo ""
echo "Enhanced Controllers:"
echo "- Sensor Controller: MQTT + Web Server + Security Monitoring"
echo "- Actuator Controller: MQTT Status Handling + Command Distribution"
echo ""
echo "System Architecture:"
echo "- Communication: HTTP (localhost:3001) + MQTT (localhost:1883)"
echo "- Control Flow: MQTT Status → Controller → Web Server Commands → Actuators"
echo "- Monitoring: Real-time alerts, statistics, and dashboard"
echo "- Coverage: Complete Ground Floor with Public Access Security"
echo ""
echo "Key Features:"
echo "- Security alert classification (LOW, MEDIUM, HIGH, CRITICAL)"
echo "- Motion detection by area (Main Lobby, Reception, Corridors)"
echo "- Access control monitoring with success rate tracking"
echo "- Automated actuator response to security events"
echo "- Comprehensive logging and event tracking"
echo ""
echo "Access Points:"
echo "- Main Entrance, Reception Areas, Lobbies, Corridors, Service Areas"
echo "- Emergency Assembly Points, Elevator Bays, Stairwells"
echo ""
echo "Ground Floor System Started Successfully!"