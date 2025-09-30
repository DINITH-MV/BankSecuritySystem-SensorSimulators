@echo off
title Office Floor 6 Security System
color 0A

echo =====================================
echo     Office Floor 6 Security System
echo =====================================
echo.
echo Starting Office Floor 6 components...
echo.

REM Change to the project directory
cd /d "d:\Github\SIT314\Project"

REM Start the web server in a new window
echo Starting Office Floor 6 Web Server...
start "Office Floor 6 Web Server" cmd /k "node web_server/office_floor_6_web_server.js"

REM Wait a moment for the server to start
timeout /t 3 /nobreak > nul

REM Start sensor controllers
echo Starting Office Floor 6 Sensor Controller...
start "Office Floor 6 Sensor Controller" cmd /k "node zones/office_floor_6/controllers/sensor_controller.js"

REM Start actuator controllers
echo Starting Office Floor 6 Actuator Controller...
start "Office Floor 6 Actuator Controller" cmd /k "node zones/office_floor_6/controllers/actuator_controller.js"

REM Wait a moment for controllers to start
timeout /t 2 /nobreak > nul

REM Start sensors
echo Starting Office Floor 6 Sensors...
start "OF6 AXIS Cameras" cmd /k "node zones/office_floor_6/sensors/AXIS_XFQ1656_camera_node.js"
start "OF6 Bosch PIR Motion" cmd /k "node zones/office_floor_6/sensors/Bosch_PIR_motion_detector_node.js"
start "OF6 HID Card Reader" cmd /k "node zones/office_floor_6/sensors/HID_MiniProx_proxpoint_reader.js"
start "OF6 Honeywell Motion" cmd /k "node zones/office_floor_6/sensors/Honeywell_DT8016_motion_detector_node.js"

REM Wait a moment for sensors to start
timeout /t 2 /nobreak > nul

REM Start actuators
echo Starting Office Floor 6 Actuators...
start "OF6 Sirens" cmd /k "node zones/office_floor_6/actuators/E2S_HMA121_Hootronic_siren.js"
start "OF6 Beacons" cmd /k "node zones/office_floor_6/actuators/Werma_D62_LED_beacon_node.js"

echo.
echo =====================================
echo Office Floor 6 System Started!
echo =====================================
echo.
echo Web Server running on: http://localhost:3007
echo Health Check: http://localhost:3007/health
echo Statistics: http://localhost:3007/stats
echo Zone Status: http://localhost:3007/zone-status
echo.
echo Press any key to exit this window...
pause > nul