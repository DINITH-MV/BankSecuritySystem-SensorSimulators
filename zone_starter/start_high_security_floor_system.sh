#!/bin/bash

echo "==============================================="
echo "      HIGH SECURITY FLOOR - COMMAND-DRIVEN SYSTEM"
echo "==============================================="
echo "Starting web server, sensors, actuators and controllers..."
echo "Using enhanced command-based control architecture"
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# First start the web server with command endpoints
echo "Starting High Security Floor Web Server (Port 3100)..."
echo "- Command endpoints for siren/beacon control"
echo "- Enhanced security monitoring and alerting"
cd "$SCRIPT_DIR/../web_server" && nohup node high_security_floor_web_server.js > /dev/null 2>&1 &
sleep 3

echo ""
echo "Starting High Security Floor Sensors:"
echo "======================================="

echo "Starting AirGradient Air Quality Monitors..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node AirGradient_ONE_monitor_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting AXIS Camera Nodes..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node AXIS_XFQ1656_camera_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting Bosch PIR Motion Detectors..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node Bosch_PIR_motion_detector_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting HID Card Readers..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node HID_MiniProx_proxpoint_reader.js > /dev/null 2>&1 &
sleep 1

echo "Starting Honeywell Motion Detectors..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node Honeywell_DT8016_motion_detector_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting i3 Smoke Detectors..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node i3_smoke_detector_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting Schlage Keypad Locks..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node Schlage_CO-100_keypad_lock.js > /dev/null 2>&1 &
sleep 1

echo "Starting Schlage Lock Nodes..."
cd "$SCRIPT_DIR/../zones/high_security_floor/sensors" && nohup node schlage_keypad_lock_node.js > /dev/null 2>&1 &
sleep 1

echo ""
echo "Starting High Security Floor Command-Driven Actuators:"
echo "======================================================="

echo "Starting E2S Sirens (Command-Controlled)..."
echo "- 8 High-Security Sirens with Web Server Command Integration"
echo "- Executive offices, conference rooms, server areas"
cd "$SCRIPT_DIR/../zones/high_security_floor/actuators" && nohup node E2S_HMA121_Hootronic_siren.js > /dev/null 2>&1 &
sleep 1

echo "Starting Werma LED Beacons (Command-Controlled)..."
echo "- 10 High-Visibility LED Beacons with Enhanced Control"
echo "- Strategic placement for maximum security coverage"
cd "$SCRIPT_DIR/../zones/high_security_floor/actuators" && nohup node Werma_D62_LED_beacon_node.js > /dev/null 2>&1 &
sleep 1

echo ""
echo "Starting High Security Floor Enhanced Controllers:"
echo "=================================================="

echo "Starting Sensor Controller..."
echo "- Multi-sensor data aggregation and analysis"
echo "- MQTT and web server integration"
cd "$SCRIPT_DIR/../zones/high_security_floor/controllers" && nohup node sensor_controller.js > /dev/null 2>&1 &
sleep 2

echo "Starting Actuator Controller (Enhanced Command-Based)..."
echo "- Command-driven siren and beacon control"
echo "- MQTT status monitoring and web server commands"
echo "- Intelligent actuator state management"
cd "$SCRIPT_DIR/../zones/high_security_floor/controllers" && nohup node actuator_controller.js > /dev/null 2>&1 &
sleep 2

echo ""
echo "==============================================="
echo "  HIGH SECURITY FLOOR COMMAND-DRIVEN SYSTEM STARTED"
echo "==============================================="
echo "All components are now running with enhanced command architecture:"
echo ""
echo "Web Server (Enhanced):"
echo "- High Security Floor Web Server (localhost:3100)"
echo "- Command endpoints: /siren-commands/:zone, /beacon-commands/:zone"
echo "- Enhanced security monitoring and alerting"
echo ""
echo "Sensors (Multi-Point Coverage):"
echo "- 8+ AirGradient Air Quality Monitors (Server rooms, offices)"
echo "- 10+ AXIS XFQ1656 Cameras (Strategic security coverage)"
echo "- 8+ Bosch PIR Motion Detectors (Perimeter and interior)"
echo "- 6+ HID Card Readers (Access control points)"
echo "- 8+ Honeywell DT8016 Motion Detectors (Backup motion detection)"
echo "- 8+ i3 Smoke Detectors (Fire safety compliance)"
echo "- 6+ Schlage Keypad Locks (Secure access control)"
echo ""
echo "Command-Driven Actuators:"
echo "- 8 E2S HMA121 Sirens (Command-controlled via web server)"
echo "- 10 Werma D62 LED Beacons (Enhanced visibility and control)"
echo ""
echo "Enhanced Controllers:"
echo "- Sensor Controller (MQTT + Web Server data aggregation)"
echo "- Actuator Controller (Command-based MQTT + Web Server control)"
echo ""
echo "System Architecture:"
echo "- Communication: HTTP Commands (localhost:3100) + MQTT (localhost:1883)"
echo "- Control Pattern: Command-driven actuator management"
echo "- Coverage: Complete High Security Floor Monitoring"
echo "- Security Features: Air Quality, Motion Detection, Access Control, Fire Safety"
echo "- Command Integration: Real-time siren/beacon control via web server"
echo "- MAXIMUM SECURITY CONFIGURATION WITH COMMAND ARCHITECTURE"
echo ""
echo "System Status: OPERATIONAL - Command-Driven High Security Mode"
echo "Access web dashboard at: http://localhost:3100/security-dashboard"
echo ""
echo "High Security Floor System Started Successfully!"