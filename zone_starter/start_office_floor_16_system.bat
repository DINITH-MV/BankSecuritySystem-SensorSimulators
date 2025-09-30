@echo off
echo Starting Office Floor 16 Security System...
echo ==========================================

REM Set the zone identifier
set ZONE=office_floor_16
set PORT=3017

echo Zone: %ZONE%
echo Port: %PORT%
echo.

REM Start the web server in a new command window
echo [1/4] Starting web server on port %PORT%...
start "Office Floor 16 - Web Server" cmd /k "cd /d %~dp0..\web_server && node office_floor_16_web_server.js"

REM Wait a moment for the server to start
timeout /t 3 /nobreak >nul

REM Start sensor nodes
echo [2/4] Starting sensor nodes...
start "Office Floor 16 - Bosch PIR Sensors" cmd /k "cd /d %~dp0..\zones\office_floor_16\sensors && node Bosch_PIR_motion_detector_node.js"
timeout /t 2 /nobreak >nul

start "Office Floor 16 - AXIS Cameras" cmd /k "cd /d %~dp0..\zones\office_floor_16\sensors && node AXIS_XFQ1656_camera_node.js"
timeout /t 2 /nobreak >nul

start "Office Floor 16 - HID Card Readers" cmd /k "cd /d %~dp0..\zones\office_floor_16\sensors && node HID_MiniProx_proxpoint_reader.js"
timeout /t 2 /nobreak >nul

start "Office Floor 16 - Honeywell Sensors" cmd /k "cd /d %~dp0..\zones\office_floor_16\sensors && node Honeywell_DT8016_motion_detector_node.js"
timeout /t 2 /nobreak >nul

REM Start actuator nodes
echo [3/4] Starting actuator nodes...
start "Office Floor 16 - E2S Sirens" cmd /k "cd /d %~dp0..\zones\office_floor_16\actuators && node E2S_HMA121_Hootronic_siren.js"
timeout /t 2 /nobreak >nul

start "Office Floor 16 - Werma Beacons" cmd /k "cd /d %~dp0..\zones\office_floor_16\actuators && node Werma_D62_LED_beacon_node.js"
timeout /t 2 /nobreak >nul

REM Start controller nodes
echo [4/4] Starting controller nodes...
start "Office Floor 16 - Sensor Controller" cmd /k "cd /d %~dp0..\zones\office_floor_16\controllers && node sensor_controller.js"
timeout /t 2 /nobreak >nul

start "Office Floor 16 - Actuator Controller" cmd /k "cd /d %~dp0..\zones\office_floor_16\controllers && node actuator_controller.js"

echo.
echo ==========================================
echo Office Floor 16 Security System Started!
echo ==========================================
echo.
echo Web Server: http://localhost:%PORT%
echo Zone ID: %ZONE%
echo.
echo All components are now running in separate windows:
echo - Web Server (Port %PORT%)
echo - Bosch PIR Motion Detectors (15 units)
echo - AXIS XFQ1656 Security Cameras (4 units)
echo - HID ProxPoint Card Readers (2 units)
echo - Honeywell DT8016 Motion Detectors (2 units)
echo - E2S HMA121 Sirens (2 units)
echo - Werma EvoPLUS D62 Beacons (2 units)
echo - Sensor Controller (MQTT Integration)
echo - Actuator Controller (MQTT Integration)
echo.
echo Press any key to exit this window...
pause >nul