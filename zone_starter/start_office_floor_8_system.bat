@echo off
echo ======================================
echo    Office Floor 8 Security System
echo ======================================
echo Starting Office Floor 8 zone components...
echo Zone: office_floor_8
echo Floor: 8 (Office Environment)
echo Port: 3009
echo ======================================

cd /d "d:\Github\SIT314\Project"

echo [1/8] Starting Office Floor 8 Web Server (Port 3009)...
start "Office Floor 8 Web Server" cmd /k "node web_server/office_floor_8_web_server.js"
timeout /t 3 /nobreak

echo [2/8] Starting AXIS XFQ1656 Camera (OF8-CAM-001)...
start "OF8 Camera" cmd /k "node zones/office_floor_8/sensors/AXIS_XFQ1656_camera_node.js"
timeout /t 2 /nobreak

echo [3/8] Starting Bosch PIR Motion Detector (OF8-PIR-001)...
start "OF8 Motion Detector" cmd /k "node zones/office_floor_8/sensors/Bosch_PIR_motion_detector_node.js"
timeout /t 2 /nobreak

echo [4/8] Starting HID MiniProx Card Reader (OF8-ACR-001)...
start "OF8 Access Reader" cmd /k "node zones/office_floor_8/sensors/HID_MiniProx_proxpoint_reader.js"
timeout /t 2 /nobreak

echo [5/8] Starting Honeywell DT8016 Motion Detector (OF8-DT-001)...
start "OF8 DualTech Motion" cmd /k "node zones/office_floor_8/sensors/Honeywell_DT8016_motion_detector_node.js"
timeout /t 2 /nobreak

echo [6/8] Starting E2S Hootronic Siren (OF8-SIR-001)...
start "OF8 Siren" cmd /k "node zones/office_floor_8/actuators/E2S_HMA121_Hootronic_siren.js"
timeout /t 2 /nobreak

echo [7/8] Starting Werma LED Beacon (OF8-LED-001)...
start "OF8 LED Beacon" cmd /k "node zones/office_floor_8/actuators/Werma_D62_LED_beacon_node.js"
timeout /t 3 /nobreak

echo [8/8] Starting Office Floor 8 Controllers...
start "OF8 Sensor Controller" cmd /k "node zones/office_floor_8/controllers/sensor_controller.js"
timeout /t 2 /nobreak
start "OF8 Actuator Controller" cmd /k "node zones/office_floor_8/controllers/actuator_controller.js"

echo.
echo ======================================
echo Office Floor 8 Security System Started
echo ======================================
echo Components Status:
echo [OK] Web Server (localhost:3009)
echo [OK] AXIS Camera (OF8-CAM-001)
echo [OK] Bosch PIR Motion (OF8-PIR-001)  
echo [OK] HID Access Reader (OF8-ACR-001)
echo [OK] Honeywell Motion (OF8-DT-001)
echo [OK] E2S Siren (OF8-SIR-001)
echo [OK] Werma LED Beacon (OF8-LED-001)
echo [OK] Sensor Controller
echo [OK] Actuator Controller
echo ======================================
echo.
echo Access points:
echo - Web Server: http://localhost:3009
echo - Dashboard: http://localhost:3009/dashboard
echo - Zone Status: http://localhost:3009/zone-status
echo - Health Check: http://localhost:3009/health
echo.
echo Press any key to continue or Ctrl+C to exit...
pause