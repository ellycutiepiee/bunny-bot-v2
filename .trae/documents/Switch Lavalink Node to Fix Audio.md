This is a deeper issue with **Lavalink communication**.

When the bot says "Added: Song" and "Now Playing" but isn't in VC, it means:
1.  **Lavalink** thinks it's playing.
2.  **Discord** never received (or rejected) the voice connection request.
3.  The bot's internal state is out of sync with reality.

The issue is likely that the **Lavalink Node** (hosted on `ajieblogs.eu.org`) is online but failing to establish the voice connection handshake with Discord, or the `kazagumo` library is masking the connection error.

### **The Fix:**
I will switch to a **different, more reliable free Lavalink node**. The current one seems to be having connectivity issues (accepting requests but failing to transmit audio).

**Plan:**
1.  **Update `.env`:** Change `LAVALINK_URL` and `LAVALINK_AUTH` to a new public node.
2.  **Restart Bot:** Apply the new node settings.

I will try the **LavaLink.hosting** public node or another high-uptime alternative.