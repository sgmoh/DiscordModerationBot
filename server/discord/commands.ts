import { 
  Client, 
  Message, 
  PermissionFlagsBits, 
  TextChannel,
  ChannelType
} from 'discord.js';
import { log } from '../vite';
import { type DiscordConfig } from '@shared/schema';

export function setupCommands(client: Client, config: DiscordConfig) {
  // Register the command handler
  client.on('messageCreate', (message) => handleCommands(message, client, config));
  
  // When bot is ready, log important info about message content intent
  client.once('ready', () => {
    log('Command handler is ready, but the purge command requires the MessageContent privileged intent to be enabled in Discord Developer Portal', 'discord');
  });
  
  log('Commands handler set up', 'discord');
}

/**
 * Handles incoming messages to process commands
 */
async function handleCommands(message: Message, client: Client, config: DiscordConfig) {
  try {
    // The MessageContent intent is required to read message content
    // Without it, message.content will be empty for messages not mentioning the bot
    
    // Ignore messages from bots
    if (message.author.bot) {
      return;
    }
    
    // Check if we have access to message content
    if (!message.content) {
      // If this happens often, it means MessageContent intent is not enabled
      return;
    }
    
    // Check if message has the command prefix
    if (!message.content.startsWith(config.prefix)) {
      return;
    }

    // Extract command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Process commands
    switch (commandName) {
      case 'purge':
        await handlePurgeCommand(message, args);
        break;
        
      // Add more commands here if needed
      default:
        // Unknown command, do nothing
        break;
    }
  } catch (error) {
    log(`Error handling command: ${error}`, 'discord');
  }
}

/**
 * Command to purge messages from a channel
 */
async function handlePurgeCommand(message: Message, args: string[]) {
  try {
    // Check if message is in a guild text channel
    if (!message.guild || message.channel.type !== ChannelType.GuildText) {
      await message.reply('This command can only be used in a server text channel.');
      return;
    }

    const channel = message.channel as TextChannel;
    
    // Check for permissions
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('You do not have permission to use this command.');
      return;
    }

    if (!channel.permissionsFor(message.guild.members.me!)?.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('I do not have permission to delete messages in this channel.');
      return;
    }

    // Parse number of messages to delete
    const amount = parseInt(args[0]);
    
    // Validate input
    if (isNaN(amount) || amount < 1 || amount > 100) {
      await message.reply('Please provide a number between 1 and 100 for the number of messages to delete.');
      return;
    }

    // Delete messages
    const deleted = await channel.bulkDelete(amount, true);
    
    // Send confirmation message that auto-deletes after 5 seconds
    const reply = await message.reply(`Successfully deleted ${deleted.size} messages.`);
    setTimeout(() => {
      if (reply.deletable) reply.delete().catch(error => log(`Error deleting confirmation message: ${error}`, 'discord'));
    }, 5000);
    
    log(`Purged ${deleted.size} messages in ${channel.name} by ${message.author.tag}`, 'discord');
  } catch (error) {
    log(`Error in purge command: ${error}`, 'discord');
    
    // Handle errors for messages older than 14 days
    if (error instanceof Error && error.message.includes('14 days')) {
      await message.reply('Cannot delete messages older than 14 days due to Discord limitations.');
    } else {
      await message.reply('There was an error trying to delete messages.');
    }
  }
}
