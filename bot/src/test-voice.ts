import { Client, GatewayIntentBits } from "discord.js";
import { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  VoiceConnectionStatus 
} from "@discordjs/voice";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`[Diagnostic] Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!testvoice") {
    const channel = message.member?.voice.channel;
    if (!channel) {
      message.reply("Join a VC first!");
      return;
    }

    console.log("[Diagnostic] Joining channel...");
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log("[Diagnostic] Connection Ready!");
      
      const player = createAudioPlayer();
      const resource = createAudioResource("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log("[Diagnostic] Player is Playing!");
        message.reply("Playing test audio (Direct MP3)...");
      });

      player.on("error", (error) => {
        console.error(`[Diagnostic] Player Error: ${error.message}`);
      });
    });

    connection.on("stateChange", (oldState, newState) => {
      console.log(`[Diagnostic] Connection State: ${oldState.status} -> ${newState.status}`);
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      console.log("[Diagnostic] Disconnected!");
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
