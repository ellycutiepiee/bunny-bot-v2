@echo off
TITLE Bunny Bot & Website Auto-Starter
echo 🐰 Starting Bunny Bot System...

:: Start the Cloudflare Tunnel in the background
start "Cloudflare Tunnel" /min "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000 run bunnybot

:: Navigate to project directory
cd /d "C:\Users\ellyc\Documents\trae_projects\Bunny"

:: Start the Bot and Website
echo 🚀 Launching Bot...
npm run dev

pause