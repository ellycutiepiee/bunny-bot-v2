To make the tunnel run permanently in the background, you need to install it as a **system service**.

### **Step 1: Get your Token**
1.  Go to the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2.  Go to **Networks** -> **Tunnels**.
3.  Click on your tunnel (`bunnybot` or whatever you named it).
4.  Click **Configure**.
5.  Look for the **"Install and run a connector"** section.
6.  You will see a command that looks like this:
    ```powershell
    cloudflared.exe service install eyJhIjoiM...
    ```
    (The long string starting with `ey...` is your **Token**).

### **Step 2: Run the Command**
Once you have that token, paste it here, and I will run the installation command for you.

**Or, if you want to do it yourself:**
1.  Open a new PowerShell window as **Administrator**.
2.  Run: `& "C:\Program Files (x86)\cloudflared\cloudflared.exe" service install <YOUR_TOKEN_HERE>`
3.  Then run: `& "C:\Program Files (x86)\cloudflared\cloudflared.exe" service start`

**Just paste the token here if you want me to do it!** 🐰