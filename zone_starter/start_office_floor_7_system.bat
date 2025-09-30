@echo off
title Office Floor 7 Zone - Complete System Startup
echo ===============================================
echo        Office Floor 7 - COMPLETE SYSTEM
echo ===============================================
echo Starting web server, sensors, actuators and controllers...
echo.

REM First start the web server
echo Starting Office Floor 7 Web Server (Port 3008)...
start "OF7 Web Server" cmd /k "cd /d %~dp0\..\web_server && node office_floor_7_web_server.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting Office Floor 7 Sensors:
echo =================================

echo Starting AXIS Camera Nodes...
start "OF7 Cameras" cmd /k "cd /d %~dp0\..\zones\office_floor_7\sensors && node AXIS_XFQ1656_camera_node.js"
timeout /t 1 /nobreak >nul

echo Starting Bosch PIR Motion Detectors...
start "OF7 PIR Motion" cmd /k "cd /d %~dp0\..\zones\office_floor_7\sensors && node Bosch_PIR_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting HID Card Readers...
start "OF7 Card Readers" cmd /k "cd /d %~dp0\..\zones\office_floor_7\sensors && node HID_MiniProx_proxpoint_reader.js"
timeout /t 1 /nobreak >nul

echo Starting Honeywell Motion Detectors...
start "OF7 Honeywell Motion" cmd /k "cd /d %~dp0\..\zones\office_floor_7\sensors && node Honeywell_DT8016_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting Office Floor 7 Actuators:
echo ===================================

echo Starting E2S Command-Controlled Sirens...
start "OF7 Sirens" cmd /k "cd /d %~dp0\..\zones\office_floor_7\actuators && node E2S_HMA121_Hootronic_siren.js"
timeout /t 1 /nobreak >nul

echo Starting Werma Command-Controlled LED Beacons...
start "OF7 LED Beacons" cmd /k "cd /d %~dp0\..\zones\office_floor_7\actuators && node Werma_D62_LED_beacon_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting Office Floor 7 Controllers:
echo ====================================

echo Starting Enhanced Sensor Controller (MQTT + Heartbeat + Status Publishing)...
start "OF7 Sensor Controller" cmd /k "cd /d %~dp0\..\zones\office_floor_7\controllers && node sensor_controller.js"
timeout /t 2 /nobreak >nul

echo Starting Enhanced Actuator Controller (MQTT + Command Processing)...
start "OF7 Actuator Controller" cmd /k "cd /d %~dp0\..\zones\office_floor_7\controllers && node actuator_controller.js"
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo   Office Floor 7 COMPLETE SYSTEM STARTED
echo ===============================================
echo All components are now running:
echo.
echo Web Server:
echo - Office Floor 7 Web Server (localhost:3008)
echo.
echo Sensors (15 Motion + 4 Cameras + 2 Card Readers):
echo - 4x AXIS XFQ1656 Cameras 
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers
echo - 2x Honeywell DT8016 Motion Detectors
echo.
echo Actuators (4 Command-Controlled Sirens + 4 Command-Controlled LED Beacons):
echo - 4x E2S HMA121 Sirens (Web Server Command-Controlled, Corridor Coverage)
echo - 4x Werma D62 LED Beacons (Web Server Command-Controlled, Corridor Coverage)
echo.
echo Controllers:
echo - Enhanced Sensor Controller (MQTT + Web Server + Heartbeat + Status Publishing)
echo - Enhanced Actuator Controller (MQTT + Web Server Command Processing + State Management)
echo.
echo System Status:
echo - Total: 23 Sensors + 8 Actuators + 2 Enhanced Controllers + 1 Web Server
echo - Communication: HTTP (localhost:3008) + MQTT (localhost:1883)
echo - Coverage: Complete Office Floor 7 Security Monitoring
echo - Actuator Control: Command-based via MQTT-Web Server integration
echo - Actuator Endpoints: /siren-commands/office_floor_7 and /beacon-commands/office_floor_7
echo - MQTT Features: Heartbeat, Status Publishing, Error Reporting, Alert Broadcasting
echo - Controller Topics: status, heartbeat, error, sensors/{type}/{id}, alerts/{id}
echo.
echo Press any key to close this window...
pause >nul