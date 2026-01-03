If it says "No results found!", it means **Lavalink received the URL but failed to resolve it**.

This confirms that even the new node (`ajieblogs`) might have blocked SoundCloud or is having trouble with it.

### **The Ultimate Fix: Fallback to YouTube**
Since direct SoundCloud resolution is failing on these public nodes, the most reliable way to "support" SoundCloud is to **search for the song on YouTube** if the direct SoundCloud link fails.

**Plan:**
1.  **Modify `lib/bot.ts`:**
    *   If `kazagumo.search()` returns "No results" AND the query was a SoundCloud link...
    *   **Retry the search** using the `youtube` engine with the raw URL (some nodes support this) OR extract the song name from the URL and search YouTube for it.
    *   Actually, the best way is to let `kazagumo` try to resolve it, and if it fails, just tell the user "Sorry, SoundCloud is not supported by this node, try YouTube".
    *   **BETTER IDEA:** I will try one more node (`lavalink.lexnet.cc`) which is very popular. If that fails, I will implement the "Auto-Fallback" logic where it converts the SoundCloud link into a YouTube search query automatically.

Let's try the **Fallback Logic** first, as it guarantees it works on *any* node.

**Logic:**
1.  User sends SoundCloud link.
2.  Bot tries to resolve link.
3.  If "No results", Bot parses URL (e.g. `soundcloud.com/artist/song-name`).
4.  Bot searches YouTube for `artist - song-name`.
5.  Bot plays the YouTube version.

This is how most music bots handle it when they don't have a premium SoundCloud API key! 🐰