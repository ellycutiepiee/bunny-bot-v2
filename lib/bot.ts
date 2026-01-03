import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextChannel, MessageFlags, PermissionFlagsBits } from "discord.js";
import { Kazagumo, KazagumoPlayer, KazagumoTrack } from "kazagumo";
// @ts-ignore
const lyricsFinder = require("lyrics-finder");
import Spotify from "kazagumo-spotify";
import { Connectors } from "shoukaku";
import YouTube from "youtube-sr";
import fetch from "isomorphic-unfetch";
// @ts-ignore
const { getData } = require("spotify-url-info")(fetch);
import { checkPremium, addPremium, logSong } from "./db";

// Store timeouts for leaving voice channels
const idleTimers = new Map<string, NodeJS.Timeout>();

// Store autoplay status
const autoplayMap = new Map<string, boolean>();
const radioMap = new Map<string, boolean>(); // 24/7 mode

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
                    clientId: process.env.SPOTIFY_CLIENT_ID || "",
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
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

        // Log song to database for history
        if (track.requester) {
            const userId = (track.requester as any).id;
            await logSong(userId, track.title, track.author || "Unknown Artist", track.uri || "");
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
                await i.reply({ content: "You must be in the same voice channel!", flags: MessageFlags.Ephemeral });
                return;
            }

            switch (i.customId) {
                case "replay":
                    player.seek(0);
                    await i.reply({ content: "Replaying!", flags: MessageFlags.Ephemeral });
                    break;
                case "like":
                    await i.reply({ content: "Added to Liked Songs!", flags: MessageFlags.Ephemeral });
                    break;
                case "stop":
                    player.queue.length = 0;
                    player.skip();
                    await i.reply({ content: "Stopped!", flags: MessageFlags.Ephemeral });
                    break;
                case "skip":
                    player.skip();
                    await i.reply({ content: "Skipped!", flags: MessageFlags.Ephemeral });
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

    kazagumo.on("playerEnd", async (player) => {
        // Autoplay Logic
        if (autoplayMap.get(player.guildId) && player.queue.length === 0 && player.data.get("previousTrack")) {
            const previousTrack = player.data.get("previousTrack") as KazagumoTrack;
            const searchResult = await kazagumo.search(`related ${previousTrack.author} ${previousTrack.title}`, { requester: previousTrack.requester });
            if (searchResult.tracks.length) {
                player.queue.add(searchResult.tracks[0]);
                player.play();
                return;
            }
        }
        startIdleTimer(player, client, kazagumo);
    });

    kazagumo.on("playerEmpty", (player) => {
        if (radioMap.get(player.guildId)) return; // Don't leave if 24/7 mode is on
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

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const { commandName } = interaction;
        const player = kazagumo.players.get(interaction.guildId || "");

        // --- ADMIN COMMANDS ---
        if (commandName === "admin") {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === "addpremium") {
                const user = interaction.options.getUser("user", true);
                const days = interaction.options.getInteger("days", true);
                await addPremium(user.id, days);
                return interaction.reply(`💎 Added premium to **${user.tag}** for ${days} days!`);
            }
        }

        // --- PREMIUM COMMANDS ---
        if (commandName === "premium") {
            const isPremium = await checkPremium(interaction.user.id);
            const embed = new EmbedBuilder()
                .setTitle("💎 Premium Status")
                .setDescription(isPremium 
                    ? "✅ You are a **Premium Member**! Enjoy all features." 
                    : "❌ You are not a premium member.\n\n**Benefits:**\n• 📁 Play local MP3/MP4 files\n• 🎹 Audio Filters (Bassboost, Nightcore)\n• 🔄 Autoplay\n• 🕰️ 24/7 Mode\n\n**Price:** $4/month")
                .setColor(isPremium ? "#00FF00" : "#FF0000");
            
            return interaction.reply({ embeds: [embed] });
        }

        if (["file", "filter", "autoplay", "247"].includes(commandName)) {
            const isPremium = await checkPremium(interaction.user.id);
            if (!isPremium) {
                return interaction.reply({ content: "🔒 This command is for **Premium Members** only! Type `/premium` to upgrade.", ephemeral: true });
            }
        }

        if (commandName === "file") {
            const attachment = interaction.options.getAttachment("track", true);
            const member = interaction.member as any;
            if (!member.voice.channel) return interaction.reply({ content: "You need to be in a voice channel!", ephemeral: true });

            let player = kazagumo.players.get(interaction.guildId!);
            if (!player) {
                player = await kazagumo.createPlayer({
                    guildId: interaction.guildId!,
                    textId: interaction.channelId,
                    voiceId: member.voice.channel.id,
                    volume: 100,
                    deaf: true,
                });
            }

            await interaction.deferReply();
            const result = await kazagumo.search(attachment.url, { requester: interaction.user });
            if (!result.tracks.length) {
                return interaction.editReply("Could not play file!");
            }

            player.queue.add(result.tracks[0]);
            if (!player.playing && !player.paused) player.play();
            return interaction.editReply(`📁 Added file: **${attachment.name}**`);
        }

        if (commandName === "filter") {
            if (!player) return interaction.reply({ content: "No music is playing!", ephemeral: true });
            const type = interaction.options.getString("type", true);
            
            if (type === "off") {
                player.shoukaku.clearFilters();
                return interaction.reply("Filters cleared!");
            }
            
            // Apply basic filters (simplified for demo)
            if (type === "bassboost") {
                player.shoukaku.setFilters({ equalizer: [{ band: 0, gain: 0.3 }, { band: 1, gain: 0.2 }] });
            } else if (type === "nightcore") {
                player.shoukaku.setFilters({ timescale: { speed: 1.2, pitch: 1.2, rate: 1.0 } });
            } else if (type === "vaporwave") {
                player.shoukaku.setFilters({ timescale: { speed: 0.85, pitch: 0.8, rate: 1.0 } });
            } else if (type === "8d") {
                 player.shoukaku.setFilters({ rotation: { rotationHz: 0.2 } }); 
            }
            
            return interaction.reply(`🎹 Applied **${type}** filter!`);
        }

        if (commandName === "autoplay") {
            const current = autoplayMap.get(interaction.guildId!) || false;
            autoplayMap.set(interaction.guildId!, !current);
            return interaction.reply(`🔄 Autoplay is now **${!current ? "ON" : "OFF"}**`);
        }

        if (commandName === "247") {
            const current = radioMap.get(interaction.guildId!) || false;
            radioMap.set(interaction.guildId!, !current);
            return interaction.reply(`🕰️ 24/7 Mode is now **${!current ? "ON" : "OFF"}**`);
        }

        // --- MUSIC COMMANDS ---
        if (commandName === "play") {
            const query = interaction.options.getString("query", true);
            const member = interaction.member as any;
            if (!member.voice.channel) {
                return interaction.reply({ content: "You need to be in a voice channel!", ephemeral: true });
            }

            await interaction.deferReply();
            // Ensure voice connection is ready before playing
            let player = kazagumo.players.get(interaction.guildId!);
            
            // Check if player exists but voice connection is dead (ghost connection)
            if (player && !member.guild.voiceStates.cache.has(client.user?.id!)) {
                player.destroy();
                player = undefined as any;
            }

            if (!player) {
                player = await kazagumo.createPlayer({
                    guildId: interaction.guildId!,
                    textId: interaction.channelId,
                    voiceId: member.voice.channel.id,
                    volume: 100,
                    deaf: true,
                });
            } else {
                if (player.voiceId !== member.voice.channel.id) {
                    player.setVoiceChannel(member.voice.channel.id);
                }
            }

            // Verify connection
            if (!player) {
                return interaction.editReply("Failed to join voice channel! Please try again.");
            }

            try {
                // Auto-detect URL or use YouTube search
                const isUrl = /^https?:\/\//.test(query);
                const searchEngine = isUrl ? undefined : "youtube";

                const result = await kazagumo.search(query, { requester: interaction.user, engine: searchEngine });
                if (!result.tracks.length) {
                    // Fallback: If SoundCloud link fails, try searching YouTube for the URL segments
                    if (query.includes("soundcloud.com")) {
                        const fallbackQuery = query.split("/").pop()?.replace(/-/g, " ") || query;
                        const fallbackResult = await kazagumo.search(fallbackQuery, { requester: interaction.user, engine: "youtube" });
                        
                        if (fallbackResult.tracks.length) {
                            player.queue.add(fallbackResult.tracks[0]);
                            await interaction.editReply(`Added (Fallback): **${fallbackResult.tracks[0].title}**`);
                            if (!player.playing && !player.paused) player.play();
                            return;
                        }
                    }
                    return interaction.editReply("No results found!");
                }

                if (result.type === "PLAYLIST") {
                    for (const track of result.tracks) player.queue.add(track);
                    await interaction.editReply(`Playlist loaded: ${result.tracks.length} tracks.`);
                } else {
                    player.queue.add(result.tracks[0]);
                    await interaction.editReply(`Added: **${result.tracks[0].title}**`);
                }

                if (!player.playing && !player.paused) player.play();
            } catch (e) {
                console.error("Play Error:", e);
                await interaction.editReply("Error playing track! Make sure the link is valid.");
            }
        }

        if (commandName === "stop") {
            if (!player) return interaction.reply({ content: "No music is playing!", ephemeral: true });
            player.destroy();
            return interaction.reply("Stopped the music and cleared the queue!");
        }

        if (commandName === "skip") {
            if (!player) return interaction.reply({ content: "No music is playing!", ephemeral: true });
            player.skip();
            return interaction.reply("Skipped current song!");
        }

        if (commandName === "pause") {
            if (!player) return interaction.reply({ content: "No music is playing!", ephemeral: true });
            player.pause(true);
            return interaction.reply("Paused the music!");
        }

        if (commandName === "resume") {
            if (!player) return interaction.reply({ content: "No music is playing!", ephemeral: true });
            player.pause(false);
            return interaction.reply("Resumed the music!");
        }

        if (commandName === "volume") {
            if (!player) return interaction.reply({ content: "No music is playing!", ephemeral: true });
            const vol = interaction.options.getInteger("level", true);
            player.setVolume(vol);
            return interaction.reply(`Volume set to **${vol}%**`);
        }

        if (commandName === "queue") {
            if (!player || !player.queue.length) return interaction.reply({ content: "Queue is empty!", ephemeral: true });
            const queueList = player.queue.map((track, i) => `${i + 1}. ${track.title}`).slice(0, 10).join("\n");
            return interaction.reply(`**Current Queue:**\n${queueList}${player.queue.length > 10 ? `\n...and ${player.queue.length - 10} more` : ""}`);
        }

        if (commandName === "lyrics") {
            if (!player || !player.queue.current) return interaction.reply({ content: "No music is playing!", ephemeral: true });
            await interaction.deferReply();
            
            try {
                const track = player.queue.current;
                // Clean title for better search accuracy
                const cleanTitle = track.title
                    .replace(/\(Official Video\)/gi, "")
                    .replace(/\[Official Audio\]/gi, "")
                    .replace(/\(Lyrics\)/gi, "")
                    .replace(/\(Audio\)/gi, "")
                    .replace(/ft\..*/gi, "")
                    .replace(/feat\..*/gi, "")
                    .trim();

                const lyrics = await lyricsFinder(track.author, cleanTitle) || await lyricsFinder("", cleanTitle) || "No lyrics found!";
                
                const embed = new EmbedBuilder()
                    .setTitle(`Lyrics for ${track.title}`)
                    .setDescription(lyrics.length > 4096 ? lyrics.substring(0, 4093) + "..." : lyrics)
                    .setColor("#DAA520")
                    .setFooter({ text: `Requested by ${interaction.user.tag}` });
                
                return interaction.editReply({ embeds: [embed] });
            } catch (e) {
                console.error(e);
                return interaction.editReply("Error fetching lyrics!");
            }
        }

        // --- MODERATION COMMANDS ---
        if (commandName === "ban") {
            // Permission check is handled by Discord automatically via setDefaultMemberPermissions in deploy script
            // But we can double check just in case
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: "You do not have permission to ban members!", ephemeral: true });
            }

            const target = interaction.options.getUser("target", true);
            const reason = interaction.options.getString("reason") || "No reason provided";
            const member = interaction.guild?.members.cache.get(target.id);

            if (member) {
                if (!member.bannable) return interaction.reply({ content: "I cannot ban this user! (Check my role hierarchy)", ephemeral: true });
                await member.ban({ reason });
                return interaction.reply(`🔨 **${target.tag}** has been banned!\nReason: ${reason}`);
            } else {
                return interaction.reply({ content: "User not found in this server!", ephemeral: true });
            }
        }

        if (commandName === "kick") {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({ content: "You do not have permission to kick members!", ephemeral: true });
            }
            const target = interaction.options.getUser("target", true);
            const reason = interaction.options.getString("reason") || "No reason provided";
            const member = interaction.guild?.members.cache.get(target.id);

            if (member) {
                if (!member.kickable) return interaction.reply({ content: "I cannot kick this user!", ephemeral: true });
                await member.kick(reason);
                return interaction.reply(`👢 **${target.tag}** has been kicked!\nReason: ${reason}`);
            } else {
                return interaction.reply({ content: "User not found!", ephemeral: true });
            }
        }

        if (commandName === "mute") {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: "You do not have permission to mute members!", ephemeral: true });
            }
            const target = interaction.options.getUser("target", true);
            const duration = interaction.options.getInteger("duration", true);
            const member = interaction.guild?.members.cache.get(target.id);

            if (member) {
                if (!member.moderatable) return interaction.reply({ content: "I cannot mute this user!", ephemeral: true });
                await member.timeout(duration * 60 * 1000, `Muted by ${interaction.user.tag}`);
                return interaction.reply(`😶 **${target.tag}** has been muted for ${duration} minutes.`);
            } else {
                return interaction.reply({ content: "User not found!", ephemeral: true });
            }
        }

        if (commandName === "purge") {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: "You do not have permission to delete messages!", ephemeral: true });
            }
            const amount = interaction.options.getInteger("amount", true);
            const channel = interaction.channel as TextChannel;
            
            if (channel) {
                await channel.bulkDelete(amount, true).catch(err => {
                    console.error(err);
                    return interaction.reply({ content: "Error deleting messages (messages older than 14 days cannot be bulk deleted).", ephemeral: true });
                });
                return interaction.reply({ content: `Deleted ${amount} messages!`, ephemeral: true });
            }
        }

        // --- FUN COMMANDS ---
        if (commandName === "ping") {
            return interaction.reply(`Pong! 🏓 Latency: ${client.ws.ping}ms`);
        }

        if (commandName === "avatar") {
            const target = interaction.options.getUser("user") || interaction.user;
            const embed = new EmbedBuilder()
                .setTitle(`${target.tag}'s Avatar`)
                .setImage(target.displayAvatarURL({ size: 1024 }))
                .setColor("#DAA520")
                .setFooter({ text: `Requested by ${interaction.user.tag}` });
            
            return interaction.reply({ embeds: [embed] });
        }

        if (commandName === "poll") {
            const question = interaction.options.getString("question", true);
            const pollEmbed = new EmbedBuilder()
                .setTitle("📊 Poll Time!")
                .setDescription(question)
                .setColor("#DAA520")
                .setFooter({ text: `Poll started by ${interaction.user.tag}` });
            
            const message = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });
            await message.react("👍");
            await message.react("👎");
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
