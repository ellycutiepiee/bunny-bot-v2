We are so close! The logs show the bot is starting and the server is running, but there are two specific errors causing the 502/Login issues:

1.  **`NO_SECRET` Error:** `NextAuth` requires a `NEXTAUTH_SECRET` environment variable in production to encrypt user sessions. This is why your login is failing with "Server error".
2.  **`sharp` Missing:** Next.js Image Optimization requires the `sharp` library when running in "standalone" mode (which we enabled to save memory).

### The Fix

1.  **Add Dependencies:** I will add `sharp` to your `package.json` so the image optimization works.
2.  **Generate Secret:** I will provide you with a random secret string.
3.  **Instruction for Render:** You will need to add this `NEXTAUTH_SECRET` to your Render Environment Variables manually (I cannot do this for you).

After these steps, the "Server Error" on login will disappear, and the site will be fully functional.