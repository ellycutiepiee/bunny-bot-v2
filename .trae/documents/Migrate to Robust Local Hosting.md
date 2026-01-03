This is a significant pivot from cloud hosting to local hosting. I will execute this migration systematically.

### **Phase 1: Local Environment Hardening**
1.  **Keep-Alive Script:** I'll create a PowerShell script to keep your PC awake while the bot runs.
2.  **Auto-Restart:** I'll configure a local process manager (PM2) to ensure the bot restarts automatically if your PC reboots or the bot crashes.
3.  **Cleanup:** I will remove Render-specific configurations (like the memory limit flags in `package.json` that were only for the free tier).

### **Phase 2: Public Access (Tunneling)**
Since you need the website (`http://localhost:3000`) to be accessible publicly for Discord Login to work, we need a tunnel.
*   **Recommendation:** **Cloudflare Tunnel (cloudflared)** is the best free, persistent, and secure option.
*   **Action:** I will guide you to install Cloudflare Tunnel or set up **ngrok** as a simpler alternative for now.

### **Phase 3: Cleanup External Traces**
*   I will help you identify what needs to be deleted from GitHub/Render (though I cannot click "Delete Account" for you, I can clear the repo configs).

### **Phase 4: Security**
*   We will ensure `.env` is strictly ignored and keys are secure.

Let's start by configuring the local environment to be robust.

**Immediate Actions:**
1.  Install `pm2` globally (for process management).
2.  Update `package.json` to remove cloud-specific memory limits.
3.  Create a "Start Bot" script that handles everything.