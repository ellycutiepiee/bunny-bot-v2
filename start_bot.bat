@echo off
echo Starting Bunny Bot (Local)...

:: 1. Keep PC Awake (PowerShell script to prevent sleep)
echo Preventing system sleep...
start /min powershell -Command "$w=Add-Type -MemberDefinition '[DllImport(\"kernel32.dll\")]public static extern void SetThreadExecutionState(uint esFlags);' -Name 'Win32' -Namespace Win32 -PassThru; $w::SetThreadExecutionState(0x80000003); Read-Host 'Press Enter to stop keeping awake...'; $w::SetThreadExecutionState(0x80000000)"

:: 2. Start Bot with PM2 (Auto-restart on crash)
echo Starting Bot process...
call npm run build
pm2 start npm --name "bunny-bot" -- run start

:: 3. Start Public Tunnel (Cloudflare)
echo Starting Public Tunnel...
start cmd /k "cloudflared tunnel run bunnybot"

echo.
echo ===================================================
echo  Bunny Bot is ONLINE! 🐰
echo  - Local Dashboard: http://localhost:3000
echo  - Public URL: https://bunny-bot.com
echo  - Logs: pm2 logs bunny-bot
echo  - Stop: pm2 stop bunny-bot
echo ===================================================
pause
