@echo off
cd /d "C:\Users\blend\Documents\My Documents\BlenderTimer\Website\BlenderTimer.com\portfolio"
set PORT=8000

REM === Start the local Python server ===
echo Starting local server on port %PORT%...
start "" http://localhost:%PORT%
python -m http.server %PORT%

REM === Pause after stopping (optional) ===
pause