# Cloud Deployment Guide (Bunny Bot)

This project is now configured to run 24/7 on cloud platforms like **Railway** or **Render**.

## 🚀 Recommended: Deploy to Railway
Railway is the easiest option because it handles the Database (PostgreSQL) and the Bot automatically.

### Step 1: Push Code to GitHub
1. Make sure this project is in a GitHub repository.
2. Push the latest changes (including the new `Dockerfile`).

### Step 2: Create Project on Railway
1. Go to [Railway.app](https://railway.app/).
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. **Important**: When asked, choose to **"Add a Database"** and select **PostgreSQL**.

### Step 3: Configure Environment Variables
Go to the **"Variables"** tab in your Railway project and add these:

| Variable Name | Value Description |
|--------------|-------------------|
| `DISCORD_TOKEN` | Your Bot Token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Your Bot's Application ID |
| `DISCORD_CLIENT_SECRET` | Your Bot's Client Secret |
| `NEXTAUTH_SECRET` | A random long string (e.g., generate one) |
| `NEXTAUTH_URL` | `https://<your-railway-url>.up.railway.app` |
| `STRIPE_SECRET_KEY` | Your Stripe Secret Key |
| `STRIPE_PRICE_ID` | Your Stripe Price ID |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe Webhook Secret |
| `DATABASE_URL` | *Railway adds this automatically when you add Postgres* |

### Step 4: Lavalink (Music Node)
The `Dockerfile` is set up to run `Lavalink.jar` if it exists in the root folder.
*   **If you have a `Lavalink.jar`**: Make sure it is committed to your repo (or uploaded).
*   **If you use a public node**: Set the following variables instead:
    *   `LAVALINK_URL`: `host:port` (e.g., `node.example.com:2333`)
    *   `LAVALINK_AUTH`: `password`

## 🛠 Manual VPS Deployment (DigitalOcean / Hetzner)
If you prefer a raw VPS:
1. Install Docker on the server.
2. Run: `docker build -t bunny-bot .`
3. Run: `docker run -p 3000:3000 -p 2333:2333 --env-file .env bunny-bot`
