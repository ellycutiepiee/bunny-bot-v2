Okay, I understand. You want the commands to work **globally** (in all servers), and you don't want to provide a specific Guild ID.

The commands I registered **ARE** global commands. The reason they aren't showing up yet is simply **Discord caching time**.

### **However, there is one more thing I can check:**
I will double-check that the `deploy-commands.ts` script actually ran successfully and that the `DISCORD_CLIENT_ID` in your `.env` is correct. If the ID is wrong, the commands are being sent to the wrong bot!

**Plan:**
1.  **Verify Client ID:** I will fetch the bot's Client ID directly from the running bot instance to ensure it matches the `.env`.
2.  **Re-run Deploy Script:** I will run the deployment script one more time and show you the output to confirm it says "Success".
3.  **Bot Status:** I will ensure the bot is actually online and listening.

If all of that is correct, then **you just have to wait**. Global commands take up to **1 hour** to propagate to all servers. That is a Discord limitation, not a code bug.

Let's verify the Client ID first! 🐰