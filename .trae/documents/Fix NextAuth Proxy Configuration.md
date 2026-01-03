If you are 100% sure the Discord Portal is correct, then the issue is likely that **Cloudflare is interfering** or **NextAuth is misbehaving** with the new domain.

### **The Issue**
When you use a Cloudflare Tunnel, sometimes the "Host" header that NextAuth sees is `localhost:3000` instead of `bunny-bot.com`. This causes NextAuth to generate the wrong callback URL (e.g., it tells Discord "send the user back to localhost", but you registered "bunny-bot.com").

### **The Fix**
We need to force NextAuth to trust the `bunny-bot.com` domain by adding a special configuration in your code.

**Plan:**
1.  **Modify `lib/auth.ts` (or wherever NextAuth is initialized):** I will add `trustHost: true` to the NextAuth configuration. This tells it to trust the `NEXTAUTH_URL` from your `.env` file even if it thinks it's running on localhost.
2.  **Restart the Bot:** We will restart the process to apply the change.

This is a very common fix for apps running behind proxies/tunnels!