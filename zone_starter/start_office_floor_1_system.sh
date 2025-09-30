#!/bin/bash

echo "==============================================="
echo "        Office Floor 1 - COMPLETE SYSTEM"
echo "==============================================="
echo "Starting web server, sensors, actuators and controllers..."
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# First start the web server
echo "Starting Office Floor 1 Web Server (Port 3002)..."
cd "$SCRIPT_DIR/../web_server" && nohup node office_floor_1_web_server.js > /dev/null 2>&1 &
sleep 3

echo ""
echo "Starting Office Floor 1 Sensors:"
echo "================================="

echo "Starting AXIS Camera Nodes..."
cd "$SCRIPT_DIR/../zones/office_floor_1/sensors" && nohup node AXIS_XFQ1656_camera_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting Bosch PIR Motion Detectors..."
cd "$SCRIPT_DIR/../zones/office_floor_1/sensors" && nohup node Bosch_PIR_motion_detector_node.js > /dev/null 2>&1 &
sleep 1

echo "Starting HID Card Readers..."
cd "$SCRIPT_DIR/../zones/office_floor_1/sensors" && nohup node HID_MiniProx_proxpoint_reader.js > /dev/null 2>&1 &
sleep 1

echo "Starting Honeywell Motion Detectors..."
cd "$SCRIPT_DIR/../zones/office_floor_1/sensors" && nohup node Honeywell_DT8016_motion_detector_node.js > /dev/null 2>&1 &
sleep 1

echo ""
echo "Starting Office Floor 1 Actuators:"
echo "==================================="

echo "Starting E2S Command-Controlled Sirens..."
cd "$SCRIPT_DIR/../zones/office_floor_1/actuators" && nohup node E2S_HMA121_Hootronic_siren.js > /dev/null 2>&1 &
sleep 1

echo "Starting Werma Command-Controlled LED Beacons..."
cd "$SCRIPT_DIR/../zones/office_floor_1/actuators" && nohup node Werma_D62_LED_beacon_node.js > /dev/null 2>&1 &
sleep 1

echo ""
echo "Starting Office Floor 1 Controllers:"
echo "===================================="

echo "Starting Enhanced Sensor Controller (MQTT + Heartbeat + Status Publishing)..."
cd "$SCRIPT_DIR/../zones/office_floor_1/controllers" && nohup node sensor_controller.js > /dev/null 2>&1 &
sleep 2

echo "Starting Enhanced Actuator Controller (MQTT + Command Processing)..."
cd "$SCRIPT_DIR/../zones/office_floor_1/controllers" && nohup node actuator_controller.js > /dev/null 2>&1 &
sleep 2

echo ""
echo "==============================================="
echo "   Office Floor 1 COMPLETE SYSTEM STARTED"
echo "==============================================="
echo "All components are now running:"
echo ""
echo "Web Server:"
echo "- Office Floor 1 Web Server (localhost:3002)"
echo ""
echo "Sensors (15 Motion + 4 Cameras + 2 Card Readers):"
echo "- 4x AXIS XFQ1656 Cameras"
echo "- 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)"
echo "- 2x HID Card Readers"
echo "- 2x Honeywell DT8016 Motion Detectors"
echo ""
echo "Actuators (4 Command-Controlled Sirens + 4 Command-Controlled LED Beacons):"
echo "- 4x E2S HMA121 Sirens (Web Server Command-Controlled, Corridor Coverage)"
echo "- 4x Werma D62 LED Beacons (Web Server Command-Controlled, Corridor Coverage)"
echo ""
echo "Controllers:"
echo "- Enhanced Sensor Controller (MQTT + Web Server + Heartbeat + Status Publishing)"
echo "- Enhanced Actuator Controller (MQTT + Web Server Command Processing + State Management)"
echo ""
echo "System Status:"
echo "- Total: 23 Sensors + 8 Actuators + 2 Enhanced Controllers + 1 Web Server"
echo "- Communication: HTTP (localhost:3002) + MQTT (localhost:1883)"
echo "- Coverage: Complete Office Floor 1 Security Monitoring"
echo "- Actuator Control: Command-based via MQTT-Web Server integration"
echo "- Actuator Endpoints: /siren-commands/office_floor_1 and /beacon-commands/office_floor_1"
echo "- MQTT Features: Heartbeat, Status Publishing, Error Reporting, Alert Broadcasting"
echo "- Controller Topics: status, heartbeat, error, sensors/{type}/{id}, alerts/{id}"
echo ""
echo "Office Floor 1 System Started Successfully!"