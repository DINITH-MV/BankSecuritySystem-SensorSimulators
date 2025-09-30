@echo off
title External Perimeter Zone - Command-Based System Startup
echo ===============================================
echo       EXTERNAL PERIMETER - COMMAND-BASED SYSTEM
echo ===============================================
echo Starting web server, sensors, actuators and controllers...
echo Updated architecture with command-driven actuator control
echo.

REM First start the web server
echo Starting External Perimeter Web Server (Port 3000)...
start "EP Web Server" cmd /k "cd /d %~dp0\..\web_server && node external_perimeter_web_server.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting External Perimeter Sensors:
echo ====================================

echo Starting AXIS Camera Nodes...
start "EP Cameras" cmd /k "cd /d %~dp0\..\zones\external_perimeter\sensors && node AXIS_XFQ1656_camera_node.js"
timeout /t 1 /nobreak >nul

echo Starting Optex VX-402R PIR Beam Sensors...
start "EP PIR Beams" cmd /k "cd /d %~dp0\..\zones\external_perimeter\sensors && node Optex_VX-402R_pir_beam_node.js"
timeout /t 1 /nobreak >nul

echo Starting Optex SL-200QN Laser Scanners...
start "EP Laser Scanners" cmd /k "cd /d %~dp0\..\zones\external_perimeter\sensors && node Optex_SL-200QN_laser_scanner_node.js"
timeout /t 1 /nobreak >nul

echo Starting Additional Optex VX-402R PIR Beam Sensors...
start "EP Additional PIR" cmd /k "cd /d %~dp0\..\zones\external_perimeter\sensors && node Optex_VX-402R_pir_beam_node.js"
timeout /t 1 /nobreak >nul

echo.
echo Starting External Perimeter Actuators (Command-Based):
echo ======================================================

echo Starting Command-Controlled E2S Sirens...
start "EP Command Sirens" cmd /k "cd /d %~dp0\..\zones\external_perimeter\actuators && node E2S_HMA121_Hootronic_siren.js"
timeout /t 1 /nobreak >nul

echo Starting Command-Controlled Werma LED Beacons...
start "EP Command Beacons" cmd /k "cd /d %~dp0\..\zones\external_perimeter\actuators && node Werma_D62_LED_beacon_node.js"
timeout /t 2 /nobreak >nul

echo.
echo Starting External Perimeter Controllers (Enhanced):
echo ===================================================

echo Starting Sensor Controller...
start "EP Sensor Controller" cmd /k "cd /d %~dp0\..\zones\external_perimeter\controllers && node sensor_controller.js"
timeout /t 2 /nobreak >nul

echo Starting Enhanced Actuator Controller (MQTT + Command Control)...
start "EP Enhanced Actuator Controller" cmd /k "cd /d %~dp0\..\zones\external_perimeter\controllers && node actuator_controller.js"
timeout /t 3 /nobreak >nul

echo.
echo ===============================================
echo  EXTERNAL PERIMETER COMMAND-BASED SYSTEM STARTED
echo ===============================================
echo All components are now running with enhanced architecture:
echo.
echo Web Server (Enhanced):
echo - External Perimeter Web Server (localhost:3000)
echo - NEW: Siren/Beacon Command Endpoints
echo - Command Storage and Distribution System
echo.
echo Sensors:
echo - Multiple AXIS XFQ1656 Cameras (Perimeter Coverage)
echo - Multiple Optex VX-402R PIR Beam Sensors (Intrusion Detection)
echo - Multiple Optex SL-200QN Laser Scanners (Perimeter Scanning)
echo.
echo Actuators (Command-Controlled):
echo - 4x E2S HMA121 Sirens (Command-Based Activation)
echo   * SIREN_001: North Perimeter Gate
echo   * SIREN_002: East Fence Line
echo   * SIREN_003: South Perimeter
echo   * SIREN_004: West Perimeter
echo - 4x Werma D62 LED Beacons (Command-Based Control)
echo   * BEACON_001: North Perimeter Gate
echo   * BEACON_002: East Fence Line
echo   * BEACON_003: South Perimeter
echo   * BEACON_004: West Perimeter
echo.
echo Controllers (Enhanced):
echo - Sensor Controller (MQTT + Web Server Integration)
echo - ENHANCED Actuator Controller (MQTT + Command Generation)
echo   * Real-time Command Processing
echo   * State Management and Tracking
echo   * Auto-deactivation Timers
echo.
echo System Architecture:
echo - Communication: HTTP (localhost:3000) + MQTT (localhost:1883)
echo - NEW: Command-Driven Actuator Control
echo - NEW: Centralized State Management
echo - Coverage: Complete External Perimeter Security Monitoring
echo - Response: Immediate Command Execution (2-second polling)
echo - FIRST LINE OF DEFENSE - OUTER PERIMETER
echo.
echo Key Improvements:
echo - Centralized actuator command control
echo - Enhanced security response capabilities
echo - Real-time state synchronization
echo - Improved reliability and responsiveness
echo.
echo Press any key to close this window...
pause >nul
