I have fixed the two critical issues that were causing the bot to fail:

1.  **Search Error Fix (`!play !play` issue):**
    The logs showed `[Search] Searching for: !play https://...`. This happened because the bot wasn't cleaning the command prefix correctly when you copy-pasted or typed quickly.
    *   **Fix:** I updated the code to aggressively remove `!play` and `play` from the start of your query, ensuring only the link or song name is searched.

2.  **Voice Connection Timeout (`15s` error):**
    The logs showed `Error: The voice connection is not established in 15 seconds`. This is common on free hosting like Render because the network can be a bit slow.
    *   **Fix:** I increased the timeout to **30 seconds** and added a retry configuration to give it more time to connect.

**Action Required:**
Please go to Render and click **Manual Deploy** -> **Deploy latest commit** again. It should work perfectly now! 🐰