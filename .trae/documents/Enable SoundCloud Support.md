I can fix SoundCloud support for you! 🐰🎵

Currently, your bot is configured to use **YouTube** as the default search engine, and it has a plugin for **Spotify**. It likely doesn't know how to handle SoundCloud links or search queries effectively yet.

### **The Plan:**

1.  **Update `lib/bot.ts`:**
    *   I need to check the `Kazagumo` configuration.
    *   I will ensure that `SoundCloud` is enabled as a source in the Lavalink node configuration (if using a public node that supports it) or at least ensure the search logic handles SoundCloud URLs correctly.
    *   The current code explicitly checks for Spotify and YouTube regex, but ignores SoundCloud. I will add a check for `soundcloud.com` links.

2.  **Logic to Add:**
    *   Detect if the query is a SoundCloud link (`soundcloud.com/...`).
    *   If it is, tell Kazagumo to search using `soundcloud` engine instead of the default `youtube`.

I will start by modifying `lib/bot.ts` to recognize and handle SoundCloud links! 🚀