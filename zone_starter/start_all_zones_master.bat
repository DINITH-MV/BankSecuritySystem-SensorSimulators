@echo off
title Security System - Master Zone Controller v2.1
color 0A
echo ===============================================
echo      SECURITY SYSTEM - MASTER CONTROLLER v2.1
echo ===============================================
echo      Enhanced Command-Driven Architecture
echo      Date: September 15, 2025
echo      Updated: Zone Batch File Management
echo ===============================================
echo.

REM Verify zone starter directory and batch files exist
echo Verifying zone starting batch files...
set "BATCH_ERROR=0"

if not exist "%~dp0start_external_perimeter_system.bat" (
    echo ERROR: start_external_perimeter_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_ground_floor_system.bat" (
    echo ERROR: start_ground_floor_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_high_security_floor_system.bat" (
    echo ERROR: start_high_security_floor_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_1_system.bat" (
    echo ERROR: start_office_floor_1_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_2_system.bat" (
    echo ERROR: start_office_floor_2_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_3_system.bat" (
    echo ERROR: start_office_floor_3_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_4_system.bat" (
    echo ERROR: start_office_floor_4_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_5_system.bat" (
    echo ERROR: start_office_floor_5_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_6_system.bat" (
    echo ERROR: start_office_floor_6_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_7_system.bat" (
    echo ERROR: start_office_floor_7_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_8_system.bat" (
    echo ERROR: start_office_floor_8_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_9_system.bat" (
    echo ERROR: start_office_floor_9_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_10_system.bat" (
    echo ERROR: start_office_floor_10_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_11_system.bat" (
    echo ERROR: start_office_floor_11_system.bat not found!
    set "BATCH_ERROR=1"
)
if not exist "%~dp0start_office_floor_12_system.bat" (
    echo ERROR: start_office_floor_12_system.bat not found!
    set "BATCH_ERROR=1"
)

if "%BATCH_ERROR%"=="1" (
    echo.
    echo CRITICAL ERROR: One or more zone starting batch files are missing!
    echo Please ensure all zone starting batch files are present in the zone_starter directory.
    echo.
    echo Required files:
    echo - start_external_perimeter_system.bat
    echo - start_ground_floor_system.bat
    echo - start_high_security_floor_system.bat
    echo - start_office_floor_1_system.bat
    echo - start_office_floor_2_system.bat
    echo - start_office_floor_3_system.bat
    echo - start_office_floor_4_system.bat
    echo - start_office_floor_5_system.bat
    echo - start_office_floor_6_system.bat
    echo - start_office_floor_7_system.bat
    echo - start_office_floor_8_system.bat
    echo - start_office_floor_9_system.bat
    echo - start_office_floor_10_system.bat
    echo - start_office_floor_11_system.bat
    echo - start_office_floor_12_system.bat
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo All zone starting batch files verified successfully!
echo.

:start
echo ===============================================
echo           INDIVIDUAL ZONE START MENU
echo ===============================================
echo Select a single zone to start OR start all zones.
echo Each selection opens a new window for that zone.
echo You may return to this menu to start additional zones.
echo -----------------------------------------------
echo  1. External Perimeter (Port 3000)
echo  2. Ground Floor (Port 3001)
echo  3. High Security Floor (Port 3100)
echo  4. Office Floor 1 (Port 3002)
echo  5. Office Floor 2 (Port 3003)
echo  6. Office Floor 3 (Port 3004)
echo  7. Office Floor 4 (Port 3005)
echo  8. Office Floor 5 (Port 3006)
echo  9. Office Floor 6 (Port 3007)
echo 10. Office Floor 7 (Port 3008)
echo 11. Office Floor 8 (Port 3009)
echo 12. Office Floor 9 (Port 3010)
echo 13. Office Floor 10 (Port 3011)
echo 14. Office Floor 11 (Port 3012)
echo 15. Office Floor 12 (Port 3013)
echo 16. START ALL ZONES (Full Building)
echo  0. Exit
echo -----------------------------------------------
set /p choice="Enter your choice (0-16): "

if "%choice%"=="0"  goto :exit
if "%choice%"=="1"  goto :single_external
if "%choice%"=="2"  goto :single_ground
if "%choice%"=="3"  goto :single_high
if "%choice%"=="4"  goto :single_of1
if "%choice%"=="5"  goto :single_of2
if "%choice%"=="6"  goto :single_of3
if "%choice%"=="7"  goto :single_of4
if "%choice%"=="8"  goto :single_of5
if "%choice%"=="9"  goto :single_of6
if "%choice%"=="10" goto :single_of7
if "%choice%"=="11" goto :single_of8
if "%choice%"=="12" goto :single_of9
if "%choice%"=="13" goto :single_of10
if "%choice%"=="14" goto :single_of11
if "%choice%"=="15" goto :single_of12
if "%choice%"=="16" goto :all_zones

echo Invalid choice. Please select a number between 0 and 16.
pause
goto :start

REM -------- Generic single-zone launch helper --------
:launch_zone
REM %1 = Friendly Zone Name (for window title & messages)
REM %2 = Port
REM %3 = Batch File Name
echo.
echo ===============================================
echo   STARTING: %~1 (Port %~2)
echo ===============================================
echo Executing: %~3
if exist "%~dp0%~3" (
    start "Zone - %~1" cmd /c "cd /d %~dp0 && %~3"
    timeout /t 2 /nobreak >nul
    echo %~1 started successfully on port %~2!
) else (
    echo ERROR: %~3 not found in zone_starter directory!
)
echo.
echo Return to menu to start additional zones or choose ALL ZONES.
echo.
pause
goto :start

REM -------- Individual zone entry points --------
:single_external  call :launch_zone "External Perimeter" 3000 start_external_perimeter_system.bat
:single_ground    call :launch_zone "Ground Floor" 3001 start_ground_floor_system.bat
:single_high      call :launch_zone "High Security Floor" 3100 start_high_security_floor_system.bat
:single_of1       call :launch_zone "Office Floor 1" 3002 start_office_floor_1_system.bat
:single_of2       call :launch_zone "Office Floor 2" 3003 start_office_floor_2_system.bat
:single_of3       call :launch_zone "Office Floor 3" 3004 start_office_floor_3_system.bat
:single_of4       call :launch_zone "Office Floor 4" 3005 start_office_floor_4_system.bat
:single_of5       call :launch_zone "Office Floor 5" 3006 start_office_floor_5_system.bat
:single_of6       call :launch_zone "Office Floor 6" 3007 start_office_floor_6_system.bat
:single_of7       call :launch_zone "Office Floor 7" 3008 start_office_floor_7_system.bat
:single_of8       call :launch_zone "Office Floor 8" 3009 start_office_floor_8_system.bat
:single_of9       call :launch_zone "Office Floor 9" 3010 start_office_floor_9_system.bat
:single_of10      call :launch_zone "Office Floor 10" 3011 start_office_floor_10_system.bat
:single_of11      call :launch_zone "Office Floor 11" 3012 start_office_floor_11_system.bat
:single_of12      call :launch_zone "Office Floor 12" 3013 start_office_floor_12_system.bat

:all_zones
echo.
echo ===============================================
echo      STARTING ALL ZONES: COMPLETE BUILDING
echo ===============================================
echo Full Building Coverage with Enhanced Command Architecture
echo.
echo Starting External Perimeter (Port 3000)...
echo - Complete Outer Perimeter Defense with Command-Based Control
echo.
echo Executing: start_external_perimeter_system.bat
if exist "%~dp0start_external_perimeter_system.bat" (
    start "Zone 1 - External Perimeter" cmd /c "cd /d %~dp0 && start_external_perimeter_system.bat"
    timeout /t 3 /nobreak >nul
    echo External Perimeter started successfully!
) else (
    echo ERROR: start_external_perimeter_system.bat not found!
    pause
    goto :start
)

echo Starting Ground Floor (Port 3001)...
echo - Enhanced Public Access Security with Environmental Monitoring
echo.
echo Executing: start_ground_floor_system.bat
if exist "%~dp0start_ground_floor_system.bat" (
    start "Zone 2 - Ground Floor" cmd /c "cd /d %~dp0 && start_ground_floor_system.bat"
    timeout /t 3 /nobreak >nul
    echo Ground Floor started successfully!
) else (
    echo ERROR: start_ground_floor_system.bat not found!
    pause
    goto :start
)

echo Starting High Security Floor (Port 3100)...
echo - Maximum Security Configuration with Air Quality Monitoring
echo.
echo Executing: start_high_security_floor_system.bat
if exist "%~dp0start_high_security_floor_system.bat" (
    start "Zone 3 - High Security Floor" cmd /c "cd /d %~dp0 && start_high_security_floor_system.bat"
    timeout /t 3 /nobreak >nul
    echo High Security Floor started successfully!
) else (
    echo ERROR: start_high_security_floor_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 2 (Port 3003)...
echo - Professional Work Areas with Complete Sensor Coverage
echo.
echo Executing: start_office_floor_2_system.bat
if exist "%~dp0start_office_floor_2_system.bat" (
    start "Zone 4 - Office Floor 2" cmd /c "cd /d %~dp0 && start_office_floor_2_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 2 started successfully!
) else (
    echo ERROR: start_office_floor_2_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 4 (Port 3005)...
echo - Enhanced Office Security with Complete Sensor Coverage
echo.
echo Executing: start_office_floor_4_system.bat
if exist "%~dp0start_office_floor_4_system.bat" (
    start "Zone 5 - Office Floor 4" cmd /c "cd /d %~dp0 && start_office_floor_4_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 4 started successfully!
) else (
    echo ERROR: start_office_floor_4_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 3 (Port 3004)...
echo - Enhanced Office Security with Complete Sensor Coverage
echo.
echo Executing: start_office_floor_3_system.bat
if exist "%~dp0start_office_floor_3_system.bat" (
    start "Zone 6 - Office Floor 3" cmd /c "cd /d %~dp0 && start_office_floor_3_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 3 started successfully!
) else (
    echo ERROR: start_office_floor_3_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 1 (Port 3002)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_1_system.bat
if exist "%~dp0start_office_floor_1_system.bat" (
    start "Zone 7 - Office Floor 1" cmd /c "cd /d %~dp0 && start_office_floor_1_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 1 started successfully!
) else (
    echo ERROR: start_office_floor_1_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 5 (Port 3006)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_5_system.bat
if exist "%~dp0start_office_floor_5_system.bat" (
    start "Zone 8 - Office Floor 5" cmd /c "cd /d %~dp0 && start_office_floor_5_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 5 started successfully!
) else (
    echo ERROR: start_office_floor_5_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 6 (Port 3007)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_6_system.bat
if exist "%~dp0start_office_floor_6_system.bat" (
    start "Zone 9 - Office Floor 6" cmd /c "cd /d %~dp0 && start_office_floor_6_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 6 started successfully!
) else (
    echo ERROR: start_office_floor_6_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 7 (Port 3008)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_7_system.bat
if exist "%~dp0start_office_floor_7_system.bat" (
    start "Zone 10 - Office Floor 7" cmd /c "cd /d %~dp0 && start_office_floor_7_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 7 started successfully!
) else (
    echo ERROR: start_office_floor_7_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 8 (Port 3009)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_8_system.bat
if exist "%~dp0start_office_floor_8_system.bat" (
    start "Zone 11 - Office Floor 8" cmd /c "cd /d %~dp0 && start_office_floor_8_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 8 started successfully!
) else (
    echo ERROR: start_office_floor_8_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 9 (Port 3010)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_9_system.bat
if exist "%~dp0start_office_floor_9_system.bat" (
    start "Zone 12 - Office Floor 9" cmd /c "cd /d %~dp0 && start_office_floor_9_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 9 started successfully!
) else (
    echo ERROR: start_office_floor_9_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 10 (Port 3011)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_10_system.bat
if exist "%~dp0start_office_floor_10_system.bat" (
    start "Zone 13 - Office Floor 10" cmd /c "cd /d %~dp0 && start_office_floor_10_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 10 started successfully!
) else (
    echo ERROR: start_office_floor_10_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 11 (Port 3012)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_11_system.bat
if exist "%~dp0start_office_floor_11_system.bat" (
    start "Zone 14 - Office Floor 11" cmd /c "cd /d %~dp0 && start_office_floor_11_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 11 started successfully!
) else (
    echo ERROR: start_office_floor_11_system.bat not found!
    pause
    goto :start
)

echo Starting Office Floor 12 (Port 3013)...
echo - 4x AXIS Cameras with strategic coverage
echo - 15x Bosch PIR Motion Detectors (8 Open Office + 3 Meeting Rooms + 4 Corridors)
echo - 2x HID Card Readers (Access control points)
echo - 2x Honeywell Motion Detectors (Backup detection)
echo - 4x Command-Controlled E2S Sirens (Corridor Coverage)
echo - 4x Command-Controlled Werma LED Beacons
echo - Enhanced Controllers with MQTT + Heartbeat + Status Publishing
echo.
echo Executing: start_office_floor_12_system.bat
if exist "%~dp0start_office_floor_12_system.bat" (
    start "Zone 15 - Office Floor 12" cmd /c "cd /d %~dp0 && start_office_floor_12_system.bat"
    timeout /t 3 /nobreak >nul
    echo Office Floor 12 started successfully!
) else (
    echo ERROR: start_office_floor_12_system.bat not found!
    pause
    goto :start
)
echo.
echo ALL ZONES STARTED!
echo Architecture: Complete Building Security with Enhanced Command-Driven Control
echo Coverage: Full Building with Multi-Layer Security Defense
echo.
echo Active Zones: 15/15 - COMPLETE BUILDING SECURITY
echo - External Perimeter (Port 3000) [FIRST LINE OF DEFENSE - OUTER PERIMETER]
echo - Ground Floor (Port 3001) [PUBLIC ACCESS SECURITY WITH ENHANCED MONITORING]
echo - High Security Floor (Port 3100) [MAXIMUM SECURITY WITH AIR QUALITY MONITORING]
echo - Office Floor 2 (Port 3003) [PROFESSIONAL WORK AREAS WITH COMPLETE COVERAGE]
echo - Office Floor 4 (Port 3005) [ADDITIONAL OFFICE SECURITY WITH ENHANCED FEATURES]
echo - Office Floor 3 (Port 3004) [ADDITIONAL OFFICE SECURITY WITH ENHANCED FEATURES]
echo - Office Floor 1 (Port 3002) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 5 (Port 3006) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 6 (Port 3007) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 7 (Port 3008) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 8 (Port 3009) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 9 (Port 3010) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 10 (Port 3011) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 11 (Port 3012) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo - Office Floor 12 (Port 3013) [ENHANCED OFFICE SECURITY WITH COMMAND CONTROL]
echo.
goto :complete

:complete
echo ===============================================
echo           ZONE STARTUP COMPLETE
echo ===============================================
echo.
echo System Status (All Zones Mode):
echo - MQTT Broker: localhost:1883 (Aedes)
echo - Web Servers: Ports 3000-3013
echo - Communication: HTTP + MQTT
echo - Architecture: Command-Driven Actuator Control
echo.
echo Command Endpoints (All Zones):
echo - External Perimeter: /siren-commands/external_perimeter, /beacon-commands/external_perimeter
echo - Ground Floor: /siren-commands/ground_floor, /beacon-commands/ground_floor
echo - High Security: /siren-commands/high_security_floor, /beacon-commands/high_security_floor
echo - Office Floors 1-12: /siren-commands/office_floor_X, /beacon-commands/office_floor_X
echo.
echo Quick Health Check URLs:
echo - External: http://localhost:3000/health
echo - Ground: http://localhost:3001/health
echo - Office 1: http://localhost:3002/health
echo - Office 2: http://localhost:3003/health
echo - Office 3: http://localhost:3004/health
echo - Office 4: http://localhost:3005/health
echo - Office 5: http://localhost:3006/health
echo - Office 6: http://localhost:3007/health
echo - Office 7: http://localhost:3008/health
echo - Office 8: http://localhost:3009/health
echo - Office 9: http://localhost:3010/health
echo - Office 10: http://localhost:3011/health
echo - Office 11: http://localhost:3012/health
echo - Office 12: http://localhost:3013/health
echo - High Security: http://localhost:3100/health
echo.
echo COMPLETE BUILDING SECURITY ACTIVE.
echo Press any key to return to the menu or close to exit...
pause >nul
goto :start

:exit
echo.
echo Master Controller closed.
echo Individual zones continue running in their own windows.
exit
