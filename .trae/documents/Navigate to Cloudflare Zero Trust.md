Ah, I see! You are in the main Cloudflare Dashboard, but Tunnels are in the **Zero Trust** section.

### **Follow these exact steps:**

1.  Look at the **left sidebar** of that page.
2.  Click on **Zero Trust** (It's under "Protect & Connect" or just listed as "Zero Trust").
3.  A **new dashboard** will open (it might ask you to select an account or team name - just click next/confirm).
4.  In this new "Zero Trust" dashboard, look at the **left sidebar** again.
5.  Click **Networks** -> **Tunnels**.
6.  You should see a tunnel named `bunnybot` (or whatever we named it).
7.  Click on its name.
8.  Click the **Configure** button (usually at the top right or next to the name).
9.  You will see a box that says "Install and run a connector".
10. Copy the command for **Windows**. It will look like:
    `cloudflared.exe service install eyJhIjoi...`
11. **Paste that whole command here.**

Once you give me that, I can install the permanent service for you! 🐰