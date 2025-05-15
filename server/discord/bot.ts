import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { log } from '../vite';
import { discordConfig, type DiscordConfig } from '@shared/schema';
import { setupCommands } from './commands';
import { setupEvents } from './events';

// Create a collection for commands (Discord.js doesn't include this in the types)
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
  }
}

/**
 * Initialize the Discord bot with the provided configuration
 */
export async function initializeBot(config: DiscordConfig) {
  try {
    // Validate the configuration
    const validatedConfig = discordConfig.parse(config);
    
    // Create a new client with necessary intents - adding privileged intents
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,  // Privileged intent - needed for purge command
        GatewayIntentBits.GuildMembers     // Privileged intent - needed for welcome messages
      ]
    });

    // Add collection for commands
    client.commands = new Collection();

    // Setup commands and events
    setupCommands(client, validatedConfig);
    setupEvents(client, validatedConfig);

    // Log in to Discord
    await client.login(validatedConfig.token);
    log(`Discord bot logged in`, 'discord');
    
    // Generate and log the invite link
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${validatedConfig.clientId}&permissions=8&scope=bot`;
    log(`--------------------------------------------------`, 'discord');
    log(`BOT INVITE LINK: ${inviteLink}`, 'discord');
    log(`Use this link to add the bot to your server`, 'discord');
    log(`--------------------------------------------------`, 'discord');
    
    return client;
  } catch (error) {
    log(`Failed to initialize Discord bot: ${error}`, 'discord');
    throw error;
  }
}
