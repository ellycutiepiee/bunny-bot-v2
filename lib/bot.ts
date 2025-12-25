import { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextChannel } from "discord.js";
import { Kazagumo, KazagumoPlayer, KazagumoTrack } from "kazagumo";
import Spotify from "kazagumo-spotify";
import { Connectors } from "shoukaku";
import YouTube from "youtube-sr";
import fetch from "isomorphic-unfetch";
// @ts-ignore
const { getData } = require("spotify-url-info")(fetch);

// Store timeouts for leaving voice channels
const idleTimers = new Map<string, NodeJS.Timeout>();

export function startBot() {
    console.log("🚀 Starting Bunny Bot...");

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

    const kazagumo = new Kazagumo(
        {
            defaultSearchEngine: "youtube",
            plugins: [
                new Spotify({
                    clientId: process.env.SPOTIFY_CLIENT_ID || "333a39f15c1e406385750033c46e254e",
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "19e13b0d4f3b499182372c3d97f225e3",
                    playlistPageLimit: 1,
                    albumPageLimit: 1,
                    searchLimit: 10,
                    searchMarket: 'US',
                }),
            ],
            send: (guildId, payload) => {
                const guild = client.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            },
        },
        new Connectors.DiscordJS(client),
        Nodes,
        {
            moveOnDisconnect: false,
            resume: false,
            reconnectTries: 10,
            restTimeout: 30000,
            voiceConnectionTimeout: 60000, // 60s timeout
        }
    );

    // --- Events ---
    kazagumo.shoukaku.on("ready", (name) => console.log(`[Lavalink] Node ${name} is ready!`));
    kazagumo.shoukaku.on("error", (name, error) => console.error(`[Lavalink] Node ${name} error:`, error));
    
    // Self-ping to keep connection alive
    setInterval(() => {
        if (kazagumo.shoukaku.nodes.size > 0) {
             // Just accessing the property keeps the event loop active
             const status = kazagumo.shoukaku.nodes.get("Main")?.state;
        }
    }, 30000);

    kazagumo.on("playerStart", async (player, track) => {
        if (idleTimers.has(player.guildId)) {
            clearTimeout(idleTimers.get(player.guildId)!);
            idleTimers.delete(player.guildId);
        }

        const channel = client.channels.cache.get(player.textId || "") as TextChannel;
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(`Now playing: ${track.title}`)
            .setURL(track.uri || "")
            .setDescription(`By: **${track.author}**\nDuration: **${formatTime(track.length || 0)}**`)
            .setColor("#DAA520")
            .setThumbnail(track.thumbnail || null)
            .setFooter({ text: `Requested by ${track.requester ? (track.requester as any).tag : "Unknown"}`, iconURL: client.user?.displayAvatarURL() });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId("pause_resume").setLabel("⏸").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("stop").setLabel("⏹").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("skip").setLabel("⏭").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("replay").setLabel("↻").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("like").setLabel("♡").setStyle(ButtonStyle.Secondary)
            );

        const message = await channel.send({ embeds: [embed], components: [row as any] });
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: track.length || 0 });

        collector.on("collect", async (i) => {
            const member = i.guild?.members.cache.get(i.user.id);
            if (!member?.voice.channelId || member.voice.channelId !== player.voiceId) {
                await i.reply({ content: "You must be in the same voice channel!", ephemeral: true });
                return;
            }

            switch (i.customId) {
                case "replay":
                    player.seek(0);
                    await i.reply({ content: "Replaying!", ephemeral: true });
                    break;
                case "like":
                    await i.reply({ content: "Added to Liked Songs!", ephemeral: true });
                    break;
                case "stop":
                    player.queue.length = 0;
                    player.skip();
                    await i.reply({ content: "Stopped!", ephemeral: true });
                    break;
                case "skip":
                    player.skip();
                    await i.reply({ content: "Skipped!", ephemeral: true });
                    break;
                case "pause_resume":
                    const paused = !player.paused;
                    player.pause(paused);
                    const newRow = ActionRowBuilder.from(i.message.components[0] as any);
                    const button = newRow.components.find((c: any) => c.data.custom_id === "pause_resume");
                    if (button) (button as any).setLabel(paused ? "▶" : "⏸");
                    await i.update({ components: [newRow as any] });
                    break;
            }
        });
    });

    kazagumo.on("playerEnd", (player) => startIdleTimer(player, client, kazagumo));
    kazagumo.on("playerEmpty", (player) => {
        const channel = client.channels.cache.get(player.textId || "") as any;
        if (channel) channel.send("Queue is empty.");
        startIdleTimer(player, client, kazagumo);
    });

    client.on("ready", () => {
        console.log(`Logged in as ${client.user?.tag}!`);
        if (kazagumo.shoukaku.nodes.size === 0) {
            console.log("⚠️ Force connecting Lavalink...");
             if (client.user) kazagumo.shoukaku.id = client.user.id;
             // @ts-ignore
             kazagumo.shoukaku.addNode(Nodes[0]);
        }
    });

    client.on("messageCreate", async (message) => {
        if (message.author.bot || !message.guild) return;
        if (message.content === "!ping") return message.reply("Pong! 🏓");

        if (message.content.startsWith("!play")) {
            let query = message.content.replace(/^!play\s*/i, "").replace(/^play\s*/i, "").replace(/^!play\s*/i, "").trim();
            if (!query) return message.reply("Please provide a song name or link!");

            const { channel } = message.member?.voice!;
            if (!channel) return message.reply("You need to be in a voice channel!");

            let player = kazagumo.players.get(message.guild.id);
            if (!player) {
                player = await kazagumo.createPlayer({
                    guildId: message.guild.id,
                    textId: message.channel.id,
                    voiceId: channel.id,
                    volume: 100,
                    deaf: true,
                });
            }

            try {
                 if (query.match(/^(https?:\/\/)?(open\.)?spotify\.com\/.+$/)) {
                    const data = await getData(query);
                    if (data && data.type === "track") query = `${data.name} ${data.artists?.[0]?.name || ""}`;
                 } else if (query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
                     const video = await YouTube.getVideo(query);
                     if (video) query = `${video.title} ${video.channel?.name || ""}`;
                 }

                 const msg = await message.reply("🔍 Searching...");
                 const result = await kazagumo.search(query, { requester: message.author });
                 if (msg.deletable) await msg.delete().catch(() => {});

                 if (!result.tracks.length) return message.reply("No results found!");

                 if (result.type === "PLAYLIST") {
                     for (const track of result.tracks) player.queue.add(track);
                     message.reply(`Playlist loaded: ${result.tracks.length} tracks.`);
                 } else {
                     player.queue.add(result.tracks[0]);
                     message.reply(`Added: **${result.tracks[0].title}**`);
                 }

                 if (!player.playing && !player.paused) player.play();

            } catch (e) {
                console.error(e);
                message.reply("Error searching!");
            }
        }
        
        // Other commands (!skip, !stop, etc.)
        if (message.content.startsWith("!skip")) {
            const player = kazagumo.players.get(message.guild.id);
            if (player) { player.skip(); message.reply("Skipped!"); }
        }
        if (message.content.startsWith("!stop")) {
            const player = kazagumo.players.get(message.guild.id);
            if (player) { player.destroy(); message.reply("Stopped!"); }
        }
        if (message.content.startsWith("!join")) {
             const { channel } = message.member?.voice!;
             if (channel) {
                 await kazagumo.createPlayer({
                    guildId: message.guild.id,
                    textId: message.channel.id,
                    voiceId: channel.id,
                    volume: 100,
                    deaf: true,
                });
                message.reply("Joined!");
             }
        }
         if (message.content.startsWith("!leave")) {
            const player = kazagumo.players.get(message.guild.id);
            if (player) { player.destroy(); message.reply("Left!"); }
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}

function startIdleTimer(player: KazagumoPlayer, client: Client, kazagumo: Kazagumo) {
    if (idleTimers.has(player.guildId)) return;
    const timer = setTimeout(() => {
        const p = kazagumo.players.get(player.guildId);
        if (p) {
            const channel = client.channels.cache.get(p.textId || "") as any;
            if (channel) channel.send("👋 Left due to inactivity.");
            p.destroy();
        }
        idleTimers.delete(player.guildId);
    }, 5 * 60 * 1000);
    idleTimers.set(player.guildId, timer);
}

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
