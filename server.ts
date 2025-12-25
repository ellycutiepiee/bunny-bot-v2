import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { startBot } from "./lib/bot"; // Import the bot starter

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Website ready on http://localhost:${port}`);
    
    // Start the Discord Bot alongside the website!
    try {
        startBot();
    } catch (error) {
        console.error("Failed to start bot:", error);
    }
  });
});
