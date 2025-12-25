I will add diagnostic logs to `index.ts` to check if the Music Server (Lavalink) is actually connecting to the bot.

1. Add a log in `client.on("ready")` to show the number of connected music nodes.
2. Update the `!play` command to explicitly tell you if the music server is disconnected (instead of doing nothing).
3. Restart the bot to see these logs.

