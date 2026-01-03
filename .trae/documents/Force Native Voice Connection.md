If the bot is saying "Added: Song" but **not joining the voice channel**, it means:
1.  The Lavalink Node is working (it found the song).
2.  BUT the **Voice Connection** to Discord is failing silently.

This often happens because `kazagumo` tries to join using the `shoukaku` library, but if the library hasn't received the `READY` event from Discord's voice server yet, it gets stuck.

### **The Fix: Use Discord.js Native Join**
Instead of relying on `kazagumo` to auto-join (which seems flaky right now), I will force the bot to join the voice channel using **Discord.js native voice adapter** *before* telling Lavalink to play. This is the "nuclear option" for connectivity issues.

**Plan:**
1.  **Install `@discordjs/voice`:** This is required for native joining.
2.  **Modify `lib/bot.ts`:**
    *   Import `joinVoiceChannel` from `@discordjs/voice`.
    *   Explicitly call `joinVoiceChannel` inside the `/play` command *before* creating the Kazagumo player.
    *   This forces the bot into the channel at the networking level, bypassing any Lavalink delays.

I will restart the project completely after this change! 🐰