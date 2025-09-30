@echo off
title High Security Floor Zone - Command-Driven System Startup
echo ===============================================
echo      HIGH SECURITY FLOOR - COMMAND-DRIVEN SYSTEM
echo ===============================================
echo Starting web server, sensors, actuators and controllers...
echo Using enhanced command-based control architecture
echo.

REM First start the web server with command endpoints
echo Starting High Security Floor Web Server (Port 3100)...
echo - Command endpoints for siren/beacon control
echo - Enhanced security monitoring and alerting
start "HSF Web Server" cmd /k "cd /d %~dp0\..\web_server && node high_security_floor_web_server.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting High Security Floor Sensors:
echo =======================================

echo Starting AirGradient Air Quality Monitors...
start "HSF Air Quality" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node AirGradient_ONE_monitor_node.js"
timeout /t 1 /nobreak >nul

echo Starting AXIS Camera Nodes...
start "HSF Cameras" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node AXIS_XFQ1656_camera_node.js"
timeout /t 1 /nobreak >nul

echo Starting Bosch PIR Motion Detectors...
start "HSF PIR Motion" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node Bosch_PIR_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting HID Card Readers...
start "HSF Card Readers" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node HID_MiniProx_proxpoint_reader.js"
timeout /t 1 /nobreak >nul

echo Starting Honeywell Motion Detectors...
start "HSF Honeywell Motion" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node Honeywell_DT8016_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting i3 Smoke Detectors...
start "HSF Smoke Detectors" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node i3_smoke_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting Schlage Keypad Locks...
start "HSF Keypad Locks" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node Schlage_CO-100_keypad_lock.js"
timeout /t 1 /nobreak >nul

echo Starting Schlage Lock Nodes...
start "HSF Lock Nodes" cmd /k "cd /d %~dp0\..\zones\high_security_floor\sensors && node schlage_keypad_lock_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting High Security Floor Command-Driven Actuators:
echo =======================================================

echo Starting E2S Sirens (Command-Controlled)...
echo - 8 High-Security Sirens with Web Server Command Integration
echo - Executive offices, conference rooms, server areas
start "HSF Sirens" cmd /k "cd /d %~dp0\..\zones\high_security_floor\actuators && node E2S_HMA121_Hootronic_siren.js"
timeout /t 1 /nobreak >nul

echo Starting Werma LED Beacons (Command-Controlled)...
echo - 10 High-Visibility LED Beacons with Enhanced Control
echo - Strategic placement for maximum security coverage
start "HSF LED Beacons" cmd /k "cd /d %~dp0\..\zones\high_security_floor\actuators && node Werma_D62_LED_beacon_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting High Security Floor Enhanced Controllers:
echo ===================================================

echo Starting Sensor Controller...
echo - Multi-sensor data aggregation and analysis
echo - MQTT and web server integration
start "HSF Sensor Controller" cmd /k "cd /d %~dp0\..\zones\high_security_floor\controllers && node sensor_controller.js"
timeout /t 2 /nobreak >nul

echo Starting Actuator Controller (Enhanced Command-Based)...
echo - Command-driven siren and beacon control
echo - MQTT status monitoring and web server commands
echo - Intelligent actuator state management
start "HSF Actuator Controller" cmd /k "cd /d %~dp0\..\zones\high_security_floor\controllers && node actuator_controller.js"
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo  HIGH SECURITY FLOOR COMMAND-DRIVEN SYSTEM STARTED
echo ===============================================
echo All components are now running with enhanced command architecture:
echo.
echo Web Server (Enhanced):
echo - High Security Floor Web Server (localhost:3100)
echo - Command endpoints: /siren-commands/:zone, /beacon-commands/:zone
echo - Enhanced security monitoring and alerting
echo.
echo Sensors (Multi-Point Coverage):
echo - 8+ AirGradient Air Quality Monitors (Server rooms, offices)
echo - 10+ AXIS XFQ1656 Cameras (Strategic security coverage)
echo - 8+ Bosch PIR Motion Detectors (Perimeter and interior)
echo - 6+ HID Card Readers (Access control points)
echo - 8+ Honeywell DT8016 Motion Detectors (Backup motion detection)
echo - 8+ i3 Smoke Detectors (Fire safety compliance)
echo - 6+ Schlage Keypad Locks (Secure access control)
echo.
echo Command-Driven Actuators:
echo - 8 E2S HMA121 Sirens (Command-controlled via web server)
echo - 10 Werma D62 LED Beacons (Enhanced visibility and control)
echo.
echo Enhanced Controllers:
echo - Sensor Controller (MQTT + Web Server data aggregation)
echo - Actuator Controller (Command-based MQTT + Web Server control)
echo.
echo System Architecture:
echo - Communication: HTTP Commands (localhost:3100) + MQTT (localhost:1883)
echo - Control Pattern: Command-driven actuator management
echo - Coverage: Complete High Security Floor Monitoring
echo - Security Features: Air Quality, Motion Detection, Access Control, Fire Safety
echo - Command Integration: Real-time siren/beacon control via web server
echo - MAXIMUM SECURITY CONFIGURATION WITH COMMAND ARCHITECTURE
echo.
echo System Status: OPERATIONAL - Command-Driven High Security Mode
echo Access web dashboard at: http://localhost:3100/security-dashboard
echo.
echo Press any key to close this window...
pause >nul
