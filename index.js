// index.js
import { Client, GatewayIntentBits } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} from '@discordjs/voice';

// === CONFIGURATION ===
const TOKEN = '';
const TARGET_USER_ID = '348218919649148929'; // replace with the ID you copied
const AUDIO_FILE = 'tobiassang.mp3';

// === CLIENT SETUP ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// === VOICE STATE HANDLER ===
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Debug: log every voice-state change
  console.log(
    `[VSU] ${newState.member.user.tag} (${newState.id}) ` +
    `from ${oldState.channelId} → ${newState.channelId}`
  );

  // Only react to our target user
  if (newState.id !== TARGET_USER_ID) return;

  // Trigger when they enter or switch into any channel
  if (newState.channelId && newState.channelId !== oldState.channelId) {
    console.log(`→ Target is now in channel "${newState.channel.name}"`);

    try {
      // Join their channel
      const connection = joinVoiceChannel({
        channelId:      newState.channelId,
        guildId:        newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator
      });
      // Wait for the connection to be ready
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      console.log('✅ Connection ready');

      // Create player & resource, then play
      const player   = createAudioPlayer();
      const resource = createAudioResource(AUDIO_FILE);
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () =>
        console.log('▶️ Playback started')
      );
      player.on(AudioPlayerStatus.Idle, () => {
        console.log('⏹ Playback finished, disconnecting');
        connection.destroy();
      });

    } catch (err) {
      console.error('❌ Error joining or playing audio:', err);
    }
  }
});

// Log in
client.login(TOKEN);
