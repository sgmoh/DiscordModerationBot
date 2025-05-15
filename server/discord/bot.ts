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
    
    // Create a new client with necessary intents
    // Note: MessageContent and GuildMembers are privileged intents that need to be enabled in Discord Developer Portal
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
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
    
    return client;
  } catch (error) {
    log(`Failed to initialize Discord bot: ${error}`, 'discord');
    throw error;
  }
}
