If `lyrics-finder` returns "No lyrics found" even for popular songs, it usually means:
1.  The library is scraping a site that blocked it.
2.  Or the song title from Lavalink contains extra junk (like "(Official Video)", "ft. X", etc.) that confuses the search.

### **The Fix:**
I will improve the lyrics logic to **clean up the song title** before searching.
I will remove things like:
*   `(Official Video)`
*   `[Official Audio]`
*   `ft. Someone`
*   `feat. Someone`

This increases the success rate significantly.

**Plan:**
1.  **Modify `lib/bot.ts`:** Add a helper function to clean song titles.
2.  **Restart Bot:** Apply changes.

I'll make the search smarter now! 🐰