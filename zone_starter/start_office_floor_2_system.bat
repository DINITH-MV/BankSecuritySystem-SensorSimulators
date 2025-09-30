@echo off
title Office Floor 2 Zone - Complete System Startup
echo ===============================================
echo        OFFICE FLOOR 2 - COMPLETE SYSTEM
echo ===============================================
echo Starting web server, sensors, actuators and controllers...
echo.

REM First start the web server (critical for actuator communication)
echo Starting Office Floor 2 Web Server (Port 3003)...
echo - Actuator Command Endpoints: /siren-commands /beacon-commands
echo - Sensor Data Collection: /sensor-data
start "OF2 Web Server" cmd /k "cd /d %~dp0\..\web_server && node office_floor_2_web_server.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting Office Floor 2 Sensors:
echo =================================

echo Starting AXIS Camera Nodes...
start "OF2 Cameras" cmd /k "cd /d %~dp0\..\zones\office_floor_2\sensors && node AXIS_XFQ1656_camera_node.js"
timeout /t 1 /nobreak >nul

echo Starting Bosch PIR Motion Detectors...
start "OF2 PIR Motion" cmd /k "cd /d %~dp0\..\zones\office_floor_2\sensors && node Bosch_PIR_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting HID Card Readers...
start "OF2 Card Readers" cmd /k "cd /d %~dp0\..\zones\office_floor_2\sensors && node HID_MiniProx_proxpoint_reader.js"
timeout /t 1 /nobreak >nul

echo Starting Honeywell Motion Detectors...
start "OF2 Honeywell Motion" cmd /k "cd /d %~dp0\..\zones\office_floor_2\sensors && node Honeywell_DT8016_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting Office Floor 2 Actuators (Web Server Polling):
echo ========================================================

echo Starting E2S Sirens (Polling /siren-commands/office_floor_2)...
start "OF2 Sirens" cmd /k "cd /d %~dp0\..\zones\office_floor_2\actuators && node E2S_HMA121_Hootronic_siren.js"
timeout /t 1 /nobreak >nul

echo Starting Werma LED Beacons (Polling /beacon-commands/office_floor_2)...
start "OF2 LED Beacons" cmd /k "cd /d %~dp0\..\zones\office_floor_2\actuators && node Werma_D62_LED_beacon_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting Office Floor 2 Controllers:
echo ====================================

echo Starting Sensor Controller (MQTT + Web Server)...
start "OF2 Sensor Controller" cmd /k "cd /d %~dp0\..\zones\office_floor_2\controllers && node sensor_controller.js"
timeout /t 2 /nobreak >nul

echo Starting Actuator Controller (Status Topic + Web Server Commands)...
start "OF2 Actuator Controller" cmd /k "cd /d %~dp0\..\zones\office_floor_2\controllers && node actuator_controller.js"
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo   OFFICE FLOOR 2 COMPLETE SYSTEM STARTED
echo ===============================================
echo All components are now running:
echo.
echo Web Server (Central Hub):
echo - Office Floor 2 Web Server (localhost:3003)
echo - Actuator Commands: /siren-commands/office_floor_2
echo - Actuator Commands: /beacon-commands/office_floor_2
echo - Sensor Data: /sensor-data
echo.
echo Sensors (MQTT Publishers):
echo - 4x AXIS XFQ1656 Cameras 
echo - Multiple Bosch PIR Motion Detectors (Open Office + Meeting Rooms + Corridors)
echo - 2x HID Card Readers
echo - 2x Honeywell DT8016 Motion Detectors
echo.
echo Actuators (Web Server Polling):
echo - Multiple E2S HMA121 Sirens (Corridor Coverage)
echo - Multiple Werma D62 LED Beacons (Corridor Coverage)
echo.
echo Controllers:
echo - Sensor Controller (Publishes sensor data to MQTT + Web Server)
echo - Actuator Controller (Subscribes to status topic, sends commands via HTTP)
echo.
echo System Architecture:
echo - Communication: HTTP (Web Server) + MQTT (Status Messages)
echo - Data Flow: Sensors → Controllers → Status Topic → Actuator Controller → Web Server → Actuators
echo - Coverage: Complete Office Floor 2 Security Monitoring
echo - Open Offices, Meeting Rooms, Corridors, Access Points
echo.
echo MQTT Topics:
echo - Status: bank_security/zone/office_floor_2/actuators/status
echo - Web Server: localhost:3003 (Central Command Hub)
echo.
echo Press any key to close this window...
pause >nul
