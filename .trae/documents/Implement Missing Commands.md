I found the issue! You registered these commands with Discord, but **the bot code doesn't have the logic to handle them yet.**

I need to add the code for:
1.  **/avatar**: To show a user's profile picture.
2.  **/lyrics**: To fetch song lyrics (I'll install a helper for this).
3.  **/mute**: To timeout users.
4.  **/purge**: To delete messages in bulk.

### **Plan:**
1.  **Install `lyrics-finder`:** A library to fetch lyrics easily.
2.  **Update `lib/bot.ts`:** Add the missing `if (commandName === "avatar") ...` blocks for all 4 commands.
3.  **Restart Bot:** So it learns the new tricks.

I'll get on it! 🐰