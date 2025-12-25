import { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextChannel } from "discord.js";
import { Kazagumo, KazagumoPlayer, KazagumoTrack } from "kazagumo";
import Spotify from "kazagumo-spotify";
import { Connectors } from "shoukaku";
import dotenv from "dotenv";
import YouTube from "youtube-sr";
import fetch from "isomorphic-unfetch";
import express from "express";
const { getData } = require("spotify-url-info")(fetch);

dotenv.config();

// --- Keep-Alive Server for Render/UptimeRobot ---
const app = express();
const port = process.env.PORT || 3000;

// Serve a simple HTML page instead of just text
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bunny Bot 🐰</title>
        <style>
            body {
                background-color: #121212;
                color: #DAA520; /* GoldenRod */
                font-family: 'Arial', sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                text-align: center;
            }
            h1 { font-size: 3rem; margin-bottom: 10px; }
            p { font-size: 1.2rem; color: #fff; }
            .status {
                margin-top: 20px;
                padding: 10px 20px;
                border: 2px solid #DAA520;
                border-radius: 20px;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <h1>🐰 Bunny Bot</h1>
        <p>Your ultimate Discord music companion.</p>
        <div class="status">
            🟢 <strong>Status:</strong> Online & Hopping!
        </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`[Web] Keep-alive server listening on port ${port}`);
});
// ------------------------------------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const Nodes = [
  {
    name: process.env.LAVALINK_NAME || "Main",
    url: process.env.LAVALINK_URL || "127.0.0.1:2333",
    auth: process.env.LAVALINK_AUTH || "youshallnotpass",
    secure: process.env.LAVALINK_SECURE === "true",
  },
];

// Store timeouts for leaving voice channels
const idleTimers = new Map<string, NodeJS.Timeout>();

const kazagumo = new Kazagumo(
  {
    defaultSearchEngine: "youtube", // Switch back to YouTube so our fallback logic works better
    plugins: [
      new Spotify({
        clientId: process.env.SPOTIFY_CLIENT_ID || "333a39f15c1e406385750033c46e254e", // Fallback public ID or use yours
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "19e13b0d4f3b499182372c3d97f225e3", // Fallback public Secret or use yours
        playlistPageLimit: 1, // optional ( 100 tracks per page )
        albumPageLimit: 1, // optional ( 50 tracks per page )
        searchLimit: 10, // optional ( track search limit. 1-50 )
        searchMarket: 'US', // optional : can be "US", "IN" or any country code
      }),
    ],
    // We send the "bot" client so Kazagumo can manage voice states
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  Nodes,
  {
    shoukaku: {
      moveOnDisconnect: false,
      resume: false,
      reconnectTries: 5,
      restTimeout: 10000,
      voiceConnectionTimeout: 30000, // Increase timeout to 30s
    },
  }
);

// --- Kazagumo Events ---
kazagumo.shoukaku.on("ready", (name) => {
  console.log(`[Lavalink] Node ${name} is ready!`);
});

kazagumo.shoukaku.on("error", (name, error) => {
  console.error(`[Lavalink] Node ${name} had an error:`, error);
});

kazagumo.shoukaku.on("close", (name, code, reason) => {
  console.warn(`[Lavalink] Node ${name} closed: code=${code} reason=${reason}`);
});

kazagumo.shoukaku.on("disconnect", (name, players) => {
  console.warn(`[Lavalink] Node ${name} disconnected`);
});

kazagumo.shoukaku.on("debug", (name, info) => {
  console.debug(`[Lavalink Debug] ${name}: ${info}`);
});

kazagumo.on("playerStart", async (player, track) => {
  // Clear any existing idle timer when music starts
  if (idleTimers.has(player.guildId)) {
      clearTimeout(idleTimers.get(player.guildId)!);
      idleTimers.delete(player.guildId);
  }

  const channel = client.channels.cache.get(player.textId || "") as TextChannel;
  if (!channel) return;

  // Create Embed
  const embed = new EmbedBuilder()
    .setTitle(`Now playing: ${track.title}`)
    .setURL(track.uri || "")
    .setDescription(`By: **${track.author}**\nDuration: **${formatTime(track.length || 0)}**`)
    .setColor("#DAA520")
    .setThumbnail(track.thumbnail || null)
    .setFooter({ text: `Requested by ${track.requester ? (track.requester as any).tag : "Unknown"}`, iconURL: client.user?.displayAvatarURL() });

  // Create Buttons: "⏸  ⏹  ⏭  ↻  ♡" (All Grey/Secondary)
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder().setCustomId("pause_resume").setLabel("⏸").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setLabel("⏹").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setLabel("⏭").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("replay").setLabel("↻").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("like").setLabel("♡").setStyle(ButtonStyle.Secondary)
    );

  const message = await channel.send({ embeds: [embed], components: [row as any] });

  // Create button collector
  const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: track.length || 0 });

  collector.on("collect", async (i) => {
      // Check if the user is in the same voice channel
      const member = i.guild?.members.cache.get(i.user.id);
      if (!member?.voice.channelId || member.voice.channelId !== player.voiceId) {
          await i.reply({ content: "You must be in the same voice channel to use buttons!", ephemeral: true });
          return;
      }

      switch (i.customId) {
          case "replay":
              player.seek(0);
              await i.reply({ content: "Replaying song!", ephemeral: true });
              break;
          case "like":
              await i.reply({ content: "Added to your Liked Songs! (Simulated)", ephemeral: true });
              break;
          case "stop":
              // Clear queue and skip current to stop playback but STAY in channel
              player.queue.length = 0;
              player.skip();
              await i.reply({ content: "Stopped playback!", ephemeral: true });
              break;
          case "skip":
              player.skip();
              await i.reply({ content: "Skipped!", ephemeral: true });
              break;
          case "pause_resume":
              const paused = !player.paused;
              player.pause(paused);
              
              // Update button label dynamically
              const newRow = ActionRowBuilder.from(i.message.components[0] as any);
              const button = newRow.components.find((c: any) => c.data.custom_id === "pause_resume");
              if (button) {
                  (button as any).setLabel(paused ? "▶" : "⏸");
              }
              
              await i.update({ components: [newRow as any] });
              break;
      }
  });
});

kazagumo.on("playerEnd", (player) => {
  // Start 5-minute timer when player ends/is empty
  startIdleTimer(player);
});

kazagumo.on("playerEmpty", (player) => {
  const channel = client.channels.cache.get(player.textId || "") as any;
  if (channel) channel.send("Queue is empty.");
  startIdleTimer(player);
});

function startIdleTimer(player: KazagumoPlayer) {
    if (idleTimers.has(player.guildId)) return; // Timer already exists

    const timer = setTimeout(() => {
        const p = kazagumo.players.get(player.guildId);
        if (p) {
            const channel = client.channels.cache.get(p.textId || "") as any;
            if (channel) channel.send("👋 Left channel due to inactivity (5 mins).");
            p.destroy();
        }
        idleTimers.delete(player.guildId);
    }, 5 * 60 * 1000); // 5 minutes

    idleTimers.set(player.guildId, timer);
}

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// --- Discord Client Events ---
client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  console.log(`[Lavalink Status] Connected Nodes: ${kazagumo.shoukaku.nodes.size}`);
  if (kazagumo.shoukaku.nodes.size === 0) {
      console.log("[Lavalink Status] ⚠️ No nodes connected! Trying to force connection...");
      
      // CRITICAL FIX: Manually set the ID because Connector might have failed to set it early enough
      if (client.user) {
          kazagumo.shoukaku.id = client.user.id;
      }
      
      // @ts-ignore
      kazagumo.shoukaku.addNode({
        name: process.env.LAVALINK_NAME || "Main",
        url: process.env.LAVALINK_URL || "127.0.0.1:2333",
        auth: process.env.LAVALINK_AUTH || "youshallnotpass",
        secure: process.env.LAVALINK_SECURE === "true",
      });
  }
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot || !message.guild) return;

  // !ping command (Simple test)
  if (message.content === "!ping") {
      message.reply("Pong! 🏓 Bot is working.");
      return;
  }

  // !play command
  if (message.content.startsWith("!play")) {
    console.log(`[Command] !play received from ${message.author.tag}: ${message.content}`);
    // Replace !play and play to handle cases like "!play !play url"
    let query = message.content.replace(/^!play\s*/i, "").replace(/^play\s*/i, "").replace(/^!play\s*/i, "").trim();
    if (!query) {
      message.reply("Please provide a song name or link!");
      return;
    }

    const { channel } = message.member?.voice!;
    if (!channel) {
      message.reply("You need to be in a voice channel!");
      return;
    }

    // Create or get the player
    let player = kazagumo.players.get(message.guild.id);
    
    // CHECK: Is the node ready?
    if (!kazagumo.shoukaku.nodes.has("Main")) {
        console.error("[Command Error] Lavalink node 'Main' is not connected.");
        message.reply("⚠️ Music server is not connected yet! Please wait a moment or check the console.");
        return;
    }

    if (!player) {
        player = await kazagumo.createPlayer({
            guildId: message.guild.id,
            textId: message.channel.id,
            voiceId: channel.id,
            volume: 100,
            deaf: true, // Make bot deafen when joining
        });
    }

    try {
      // Check if query is a Spotify Link
       if (query.match(/^(https?:\/\/)?(open\.)?spotify\.com\/.+$/)) {
          console.log(`[Search] Detected Spotify Link: ${query}`);
          try {
              // Try getting data from Spotify
              const data = await getData(query);
              if (data) {
                  // If it's a track
                  if (data.type === "track") {
                      console.log(`[Search] Resolved Spotify Link to Title: ${data.name} - ${data.artists?.[0]?.name}`);
                      query = `${data.name} ${data.artists?.[0]?.name || ""}`;
                  } 
                  // If it's a playlist or album, this library might return tracks or we might need different handling
                  // But for now, let's focus on single tracks as fallback.
                  // Note: Kazagumo-spotify *should* handle playlists, but if it fails, we can at least support single tracks here.
              }
          } catch (err) {
              console.error("[Search] Failed to resolve Spotify link via scraper:", err);
          }
       }

       // Check if query is a YouTube Link (and not a playlist, to be safe, or handle playlists differently)
      // Simple check for youtube.com or youtu.be
      if (query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
           console.log(`[Search] Detected YouTube Link: ${query}`);
           try {
               const video = await YouTube.getVideo(query);
               if (video) {
                    console.log(`[Search] Resolved YouTube Link to Title: ${video.title}`);
                    query = `${video.title} ${video.channel?.name || ""}`;
                    // message.reply(`ℹ️ YouTube link detected. Searching for **"${query}"** on SoundCloud (fallback)...`);
                }
           } catch (err) {
               console.error("[Search] Failed to resolve YouTube link:", err);
           }
      }

      // Search for tracks
      console.log(`[Search] Searching for: ${query} (Requester: ${message.author.tag})`);
      
      // Send "Searching..." message
      const searchingMessage = await message.reply("🔍 Searching...");
      
      const result = await kazagumo.search(query, { requester: message.author });
      
      // Delete "Searching..." message
      if (searchingMessage.deletable) {
          await searchingMessage.delete().catch(() => {});
      }
      
      console.log(`[Search] Result Type: ${result.type}, Tracks Found: ${result.tracks.length}`);
      
      if (!result.tracks.length) {
          message.reply("No results found! Try a different search term or link.");
          return;
      }

      // Handle different result types (PLAYLIST, TRACK, SEARCH)
      if (result.type === "PLAYLIST") {
        for (const track of result.tracks) {
            player.queue.add(track);
        }
        message.reply(`Playlist **${result.playlistName}** added with ${result.tracks.length} tracks!`);
      } else {
        const track = result.tracks[0];
        player.queue.add(track);
        message.reply(`Added to queue: **${track.title}**`);
      }

      // If not playing, start playing
      if (!player.playing && !player.paused) {
          player.play();
      }

    } catch (err) {
      console.error(err);
      message.reply(`Something went wrong: ${err}`);
    }
  }

  // !skip command
  if (message.content.startsWith("!skip")) {
    const player = kazagumo.players.get(message.guild.id);
    if (!player) {
        message.reply("Nothing is playing!");
        return;
    }
    player.skip();
    message.reply("⏭️ Skipped the current song!");
  }

  // !stop command
  if (message.content.startsWith("!stop")) {
    const player = kazagumo.players.get(message.guild.id);
    if (player) {
        player.destroy();
        message.reply("🛑 Stopped playback and cleared the queue.");
    } else {
        message.reply("Nothing is playing!");
    }
  }

  // !pause command
  if (message.content.startsWith("!pause")) {
    const player = kazagumo.players.get(message.guild.id);
    if (!player) {
        message.reply("Nothing is playing!");
        return;
    }
    if (player.paused) {
        message.reply("Already paused!");
        return;
    }
    player.pause(true);
    message.reply("⏸️ Paused!");
  }

  // !resume command
  if (message.content.startsWith("!resume")) {
    const player = kazagumo.players.get(message.guild.id);
    if (!player) {
        message.reply("Nothing is playing!");
        return;
    }
    if (!player.paused) {
        message.reply("Already playing!");
        return;
    }
    player.pause(false);
    message.reply("▶️ Resumed!");
  }

  // !join command
  if (message.content.startsWith("!join")) {
    const { channel } = message.member?.voice!;
    if (!channel) {
        message.reply("You need to be in a voice channel!");
        return;
    }
    
    // Check if already connected
    let player = kazagumo.players.get(message.guild.id);
    if (player) {
        const currentChannelId = player.voiceId || "";
        const currentChannelName = message.guild.channels.cache.get(currentChannelId)?.name || "Unknown Channel";
        message.reply(`I am already in **${currentChannelName}**!`);
        return;
    }

    await kazagumo.createPlayer({
        guildId: message.guild.id,
        textId: message.channel.id,
        voiceId: channel.id,
        volume: 100,
        deaf: true,
    });
    message.reply(`👋 Joined **${channel.name}**!`);
  }

  // !leave command
  if (message.content.startsWith("!leave")) {
    const player = kazagumo.players.get(message.guild.id);
    if (player) {
        player.destroy();
        message.reply("👋 Left the voice channel.");
    } else {
        message.reply("I'm not in a voice channel!");
    }
  }

  // !help command
  if (message.content.startsWith("!help")) {
    const embed = new EmbedBuilder()
        .setTitle("Bunny Bot Commands")
        .setDescription("Here are the commands you can use:")
        .setColor("#DAA520") // Darker GoldenRod color
        .addFields(
            { name: "Music", value: "`!play <query/url>` - Plays a song from YouTube, Spotify, or SoundCloud.\n`!pause` - Pauses the current song.\n`!resume` - Resumes the paused song.\n`!skip` - Skips the current song.\n`!stop` - Stops playback and clears the queue." },
            { name: "Voice", value: "`!join` - Joins your voice channel.\n`!leave` - Leaves the voice channel." },
            { name: "Info", value: "`!help` - Shows this message." }
        )
        .setFooter({ text: "Bunny Bot", iconURL: client.user?.displayAvatarURL() });

    message.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
