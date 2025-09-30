@echo off
title Ground Floor Zone - Enhanced Security System Startup
echo ===============================================
echo      GROUND FLOOR - ENHANCED SECURITY SYSTEM
echo ===============================================
echo Starting enhanced web server, sensors, actuators and controllers...
echo With command-driven control and security monitoring...
echo.

REM First start the web server with enhanced features
echo Starting Enhanced Ground Floor Web Server (Port 3001)...
echo - Command endpoints for siren/beacon control
echo - Security alert monitoring system
echo - Dashboard and statistics endpoints
start "GF Web Server" cmd /k "cd /d %~dp0\..\web_server && node ground_floor_web_server.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting Ground Floor Sensors:
echo ==============================

echo Starting AXIS Camera Nodes...
start "GF Cameras" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node AXIS_XFQ1656_camera_node.js"
timeout /t 1 /nobreak >nul

echo Starting AirGradient Environmental Monitor...
start "GF Environmental Monitor" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node AirGradient_ONE_monitor_node.js"
timeout /t 1 /nobreak >nul

echo Starting Bosch PIR Motion Detectors...
start "GF PIR Motion" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node Bosch_PIR_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting HID Card Readers...
start "GF Card Readers" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node HID_MiniProx_proxpoint_reader.js"
timeout /t 1 /nobreak >nul

echo Starting Honeywell Motion Detectors...
start "GF Honeywell Motion" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node Honeywell_DT8016_motion_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting i3 Smoke Detectors...
start "GF Smoke Detectors" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node i3_smoke_detector_node.js"
timeout /t 1 /nobreak >nul

echo Starting Schlage Keypad Locks...
start "GF Keypad Locks" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node Schlage_CO-100_keypad_lock.js"
timeout /t 1 /nobreak >nul

echo Starting Schlage Lock Nodes...
start "GF Lock Nodes" cmd /k "cd /d %~dp0\..\zones\ground_floor\sensors && node schlage_keypad_lock_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting Ground Floor Actuators (Command-Driven):
echo =================================================

echo Starting E2S Sirens (Web Server Command Control)...
echo - 4x Sirens: SIREN_GF_001 to SIREN_GF_004
echo - Locations: Main Lobby, Reception, Emergency Exit, Stairwell
start "GF Sirens" cmd /k "cd /d %~dp0\..\zones\ground_floor\actuators && node E2S_HMA121_Hootronic_siren.js"
timeout /t 2 /nobreak >nul

echo Starting Werma LED Beacons (Web Server Command Control)...
echo - 4x Beacons: BEACON_GF_001 to BEACON_GF_004
echo - Locations: Lobby Entrance, Reception Desk, Elevator Bay, Assembly Point
start "GF LED Beacons" cmd /k "cd /d %~dp0\..\zones\ground_floor\actuators && node Werma_D62_LED_beacon_node.js"
timeout /t 2 /nobreak >nul

echo.
echo Starting Ground Floor Controllers (Enhanced):
echo =============================================

echo Starting Sensor Controller...
echo - MQTT integration and web server communication
start "GF Sensor Controller" cmd /k "cd /d %~dp0\..\zones\ground_floor\controllers && node sensor_controller.js"
timeout /t 2 /nobreak >nul

echo Starting Enhanced Actuator Controller...
echo - Command-driven siren/beacon control
echo - MQTT status message handling
echo - Web server command distribution
start "GF Actuator Controller" cmd /k "cd /d %~dp0\..\zones\ground_floor\controllers && node actuator_controller.js"
timeout /t 3 /nobreak >nul

echo.
echo ===============================================
echo   GROUND FLOOR ENHANCED SECURITY SYSTEM STARTED
echo ===============================================
echo All components are now running with enhanced features:
echo.
echo Enhanced Web Server (localhost:3001):
echo - Standard sensor/actuator data endpoints
echo - Siren command endpoints (/siren-commands/ground_floor)
echo - Beacon command endpoints (/beacon-commands/ground_floor)
echo - Security alerts system (/ground-floor-alerts)
echo - Activity statistics (/ground-floor-stats)
echo - Dashboard overview (/ground-floor-dashboard)
echo.
echo Sensors (Security Monitoring):
echo - 4x AXIS XFQ1656 Cameras with security event detection
echo - 4x AirGradient Environmental Monitors (PM2.5, CO2, Temperature, Humidity)
echo - 7x Bosch PIR Motion Detectors with area-based monitoring
echo - 8x HID Card Readers with access control alerts
echo - 2x Honeywell DT8016 Motion Detectors
echo - Multiple i3 Smoke Detectors with critical alerts
echo - Multiple Schlage Keypad Locks with unauthorized access detection
echo.
echo Command-Driven Actuators:
echo - 4x E2S HMA121 Sirens (SIREN_GF_001-004)
echo   * Polling web server for activation commands
echo   * Pattern control: continuous, pulsed, warble, yelp
echo   * Auto-deactivation based on duration settings
echo - 4x Werma D62 LED Beacons (BEACON_GF_001-004)
echo   * Polling web server for activation commands
echo   * Color and pattern control (steady, flashing, rotating, strobe)
echo   * Brightness and visibility management
echo.
echo Enhanced Controllers:
echo - Sensor Controller: MQTT + Web Server + Security Monitoring
echo - Actuator Controller: MQTT Status Handling + Command Distribution
echo.
echo System Architecture:
echo - Communication: HTTP (localhost:3001) + MQTT (localhost:1883)
echo - Control Flow: MQTT Status → Controller → Web Server Commands → Actuators
echo - Monitoring: Real-time alerts, statistics, and dashboard
echo - Coverage: Complete Ground Floor with Public Access Security
echo.
echo Key Features:
echo - Security alert classification (LOW, MEDIUM, HIGH, CRITICAL)
echo - Motion detection by area (Main Lobby, Reception, Corridors)
echo - Access control monitoring with success rate tracking
echo - Automated actuator response to security events
echo - Comprehensive logging and event tracking
echo.
echo Access Points:
echo - Main Entrance, Reception Areas, Lobbies, Corridors, Service Areas
echo - Emergency Assembly Points, Elevator Bays, Stairwells
echo.
echo Press any key to close this window...
pause >nul
