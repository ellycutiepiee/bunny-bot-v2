I know exactly what is happening. Even though we set the URL in the `.env` file, the bot (running on your computer) sometimes gets confused because it's running behind a tunnel and thinks it should use `http` or `localhost`.

I will **force** the bot to use the correct URL by hardcoding it in the code. This will bypass any confusion the bot has about where it is running.

### **The Plan:**
1.  **Modify `lib/auth.ts`:** I will manually force the `redirect_uri` in the Discord provider configuration to be exactly `https://bunny-bot.com/api/auth/callback/discord`.
2.  **Restart the Bot:** This will apply the change.

This is the "nuclear option" for this error and almost always fixes it! 🐰