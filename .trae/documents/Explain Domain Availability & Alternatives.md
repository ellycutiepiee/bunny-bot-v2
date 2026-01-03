Awesome! You now own **`bunny-bot.com`**! 🎉

Now we need to connect this domain to your local computer so that when people visit `bunny-bot.com`, they see your website.

### **The Plan: Connect GoDaddy to Cloudflare Tunnel**
We will use **Cloudflare** because it manages the connection for free and is much easier/safer than opening ports on your router.

**Step 1: Create a Cloudflare Account (Free)**
1.  Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2.  Create an account (it's free).
3.  Click **"Add a Site"** and enter `bunny-bot.com`.
4.  Select the **Free Plan** (at the bottom) and click Continue.

**Step 2: Change Nameservers in GoDaddy**
Cloudflare will give you two "Nameservers" (e.g., `bob.ns.cloudflare.com` and `alice.ns.cloudflare.com`).
1.  Go to your **GoDaddy Domain Portfolio**.
2.  Select `bunny-bot.com`.
3.  Click **DNS** -> **Nameservers**.
4.  Choose **"Change Nameservers"** -> **"I'll use my own nameservers"**.
5.  Paste the two nameservers from Cloudflare and Save.

**Step 3: Update Local Tunnel**
Once Cloudflare says your site is "Active" (this can take 15 mins to a few hours):
1.  I will help you authorize `cloudflared` on your PC.
2.  We will run a command to link `bunny-bot.com` to your local port 3000.

**Immediate Task for You:**
Please go do **Step 1 and Step 2** now.
(Create Cloudflare account -> Add Site -> Change GoDaddy Nameservers).

Tell me when you have changed the nameservers on GoDaddy!