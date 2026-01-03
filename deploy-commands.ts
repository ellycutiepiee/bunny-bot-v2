import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
    // --- MUSIC COMMANDS ---
    new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song from YouTube, Spotify, or SoundCloud")
        .addStringOption(option => 
            option.setName("query").setDescription("The song name or URL").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the currently playing song"),
    new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume the paused song"),
    new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip the current song"),
    new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop the music and clear the queue"),
    new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Show the current music queue"),
    new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Change the volume of the music")
        .addIntegerOption(option => 
            option.setName("level").setDescription("Volume level (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
        ),
    new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("Get lyrics for the current song"),

    // --- MODERATION COMMANDS (Require Permissions) ---
    new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the server")
        .addUserOption(option => 
            option.setName("target").setDescription("The user to ban").setRequired(true)
        )
        .addStringOption(option => 
            option.setName("reason").setDescription("Reason for the ban").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Only users with BAN_MEMBERS can use this
    new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server")
        .addUserOption(option => 
            option.setName("target").setDescription("The user to kick").setRequired(true)
        )
        .addStringOption(option => 
            option.setName("reason").setDescription("Reason for the kick").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Only users with KICK_MEMBERS can use this
    new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a user temporarily")
        .addUserOption(option => 
            option.setName("target").setDescription("The user to mute").setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName("duration").setDescription("Duration in minutes").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Only users with MODERATE_MEMBERS can use this
    new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete multiple messages at once")
        .addIntegerOption(option => 
            option.setName("amount").setDescription("Number of messages to delete").setRequired(true).setMinValue(1).setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Only users with MANAGE_MESSAGES can use this

    // --- FUN COMMANDS ---
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's latency"),
    new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Get a user's avatar")
        .addUserOption(option => 
            option.setName("user").setDescription("The user to get avatar for").setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a simple yes/no poll")
        .addStringOption(option => 
            option.setName("question").setDescription("The question to ask").setRequired(true)
        ),

    // --- PREMIUM COMMANDS ---
    new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Check your premium status or buy premium"),
    new SlashCommandBuilder()
        .setName("file")
        .setDescription("Play a local audio file (Premium Only)")
        .addAttachmentOption(option => 
            option.setName("track").setDescription("Upload an MP3/MP4 file").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Apply audio effects (Premium Only)")
        .addStringOption(option => 
            option.setName("type").setDescription("The filter to apply")
            .setRequired(true)
            .addChoices(
                { name: "Bassboost", value: "bassboost" },
                { name: "Nightcore", value: "nightcore" },
                { name: "Vaporwave", value: "vaporwave" },
                { name: "8D", value: "8d" },
                { name: "Off", value: "off" }
            )
        ),
    new SlashCommandBuilder()
        .setName("autoplay")
        .setDescription("Toggle autoplay mode (Premium Only)"),
    new SlashCommandBuilder()
        .setName("247")
        .setDescription("Toggle 24/7 mode (Premium Only)"),

    // --- ADMIN COMMANDS ---
    new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Admin commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => 
            subcommand
                .setName("addpremium")
                .setDescription("Give premium to a user")
                .addUserOption(option => option.setName("user").setDescription("The user").setRequired(true))
                .addIntegerOption(option => option.setName("days").setDescription("Duration in days").setRequired(true))
        ),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        // Register commands globally (might take up to 1 hour to update, but good for production)
        // For instant updates during dev, use applicationGuildCommands instead of applicationCommands
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), 
            { body: commands }
        );

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();