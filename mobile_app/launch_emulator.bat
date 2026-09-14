@echo off
title Launch Android Emulator - RAS Mobile App
echo ===================================================
echo   Starting Android Phone Emulator (API 36)
echo ===================================================
echo.
echo Booting emulator on your desktop...
start "" "C:\Users\tiwar\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd "Medium_Phone_API_36.0"
echo.
echo Waiting for emulator to come online...
"C:\Users\tiwar\AppData\Local\Android\Sdk\platform-tools\adb.exe" wait-for-device
echo.
echo Emulator online! Launching RAS Candidate Mobile App...
"C:\Users\tiwar\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.example.ras_candidate_mobile -c android.intent.category.LAUNCHER 1
echo.
echo ===================================================
echo   App is running on the emulator!
echo ===================================================
pause
