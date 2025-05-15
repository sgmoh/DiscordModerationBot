import { 
  Client, 
  Message, 
  PermissionFlagsBits, 
  TextChannel,
  ChannelType
} from 'discord.js';
import { log } from '../vite';
import { type DiscordConfig } from '@shared/schema';
import { handleSetWelcomeCommand, handleGetWelcomeCommand } from './welcomeCommands';

export function setupCommands(client: Client, config: DiscordConfig) {
  // Register the command handler for all messages
  client.on('messageCreate', (message) => handleCommands(message, client, config));
  
  // When bot is ready, log that commands are ready
  client.once('ready', () => {
    log('Command handler is ready - .purge command is available', 'discord');
    // Log available commands
    log(`Available commands:`, 'discord');
    log(`${config.prefix}purge [1-100] - Deletes specified number of messages in the channel`, 'discord');
  });
  
  log('Commands handler set up', 'discord');
}

/**
 * Handles incoming messages to process commands
 */
async function handleCommands(message: Message, client: Client, config: DiscordConfig) {
  try {
    // Debugging message - log command attempts in console for troubleshooting
    if (message.content && message.content.startsWith(config.prefix)) {
      log(`Command attempt: ${message.content} from ${message.author.tag}`, 'discord');
    }
    
    // Ignore messages from bots
    if (message.author.bot) {
      return;
    }
    
    // Check if message has the command prefix
    if (!message.content || !message.content.startsWith(config.prefix)) {
      return;
    }

    // Extract command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Log the command being processed
    log(`Processing command: ${commandName} with args: [${args.join(', ')}]`, 'discord');

    // Process commands
    switch (commandName) {
      case 'purge':
        await handlePurgeCommand(message, args);
        break;
      
      case 'setwelcome':
        await handleSetWelcomeCommand(message, args, config);
        break;
        
      case 'getwelcome':
        await handleGetWelcomeCommand(message, config);
        break;
        
      // Add more commands here if needed
      default:
        // Unknown command
        await message.reply(`Unknown command: ${commandName}. Available commands: purge, setwelcome, getwelcome`);
        break;
    }
  } catch (error) {
    log(`Error handling command: ${error}`, 'discord');
    // Try to notify the user of the error
    try {
      await message.reply('An error occurred while processing your command. Please try again.');
    } catch (replyError) {
      log(`Failed to send error message: ${replyError}`, 'discord');
    }
  }
}

/**
 * Command to purge messages from a channel
 */
async function handlePurgeCommand(message: Message, args: string[]) {
  try {
    log(`Executing purge command with args: ${args}`, 'discord');
    
    // Check if message is in a guild text channel
    if (!message.guild) {
      await message.reply('This command can only be used in a server channel.');
      return;
    }
    
    if (message.channel.type !== ChannelType.GuildText) {
      await message.reply('This command can only be used in a regular text channel.');
      return;
    }

    const channel = message.channel as TextChannel;
    log(`Purge requested in channel: ${channel.name}`, 'discord');
    
    // Check for permissions
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('❌ You do not have permission to use this command (Manage Messages permission required).');
      return;
    }

    const botMember = message.guild.members.me;
    if (!botMember) {
      await message.reply('❌ Bot user not found in server. This is an unexpected error.');
      return;
    }

    const botPermissions = channel.permissionsFor(botMember);
    if (!botPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply('❌ I do not have permission to delete messages in this channel (Manage Messages permission required).');
      return;
    }

    // Parse number of messages to delete
    if (!args.length) {
      await message.reply('⚠️ Please specify how many messages to delete. Usage: `.purge [1-100]`');
      return;
    }
    
    const amount = parseInt(args[0]);
    log(`Purge amount requested: ${amount}`, 'discord');
    
    // Validate input
    if (isNaN(amount)) {
      await message.reply('⚠️ Please provide a valid number. Usage: `.purge [1-100]`');
      return;
    }
    
    if (amount < 1 || amount > 100) {
      await message.reply('⚠️ Please provide a number between 1 and 100 for the number of messages to delete.');
      return;
    }

    // Send initial response
    const loadingMsg = await message.channel.send('🔄 Processing deletion request...');

    try {
      // Delete messages (add 1 to include the command message)
      const messagesToDelete = await channel.messages.fetch({ limit: amount + 1 });
      log(`Found ${messagesToDelete.size} messages to delete`, 'discord');
      
      // Filter out messages older than 14 days
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const filteredMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
      
      if (filteredMessages.size === 0) {
        await loadingMsg.edit('❌ All selected messages are older than 14 days and cannot be bulk deleted due to Discord limitations.');
        return;
      }
      
      // Perform bulk delete
      const deleted = await channel.bulkDelete(filteredMessages);
      log(`Successfully deleted ${deleted.size} messages`, 'discord');
      
      // Update status message then delete it after a few seconds
      await loadingMsg.edit(`✅ Successfully deleted ${deleted.size} messages.`);
      setTimeout(() => {
        if (loadingMsg.deletable) loadingMsg.delete().catch(error => log(`Error deleting confirmation message: ${error}`, 'discord'));
      }, 5000);
      
      log(`Purged ${deleted.size} messages in ${channel.name} by ${message.author.tag}`, 'discord');
    } catch (innerError) {
      log(`Error during bulk delete: ${innerError}`, 'discord');
      await loadingMsg.edit('❌ Error during message deletion process.');
      throw innerError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    log(`Error in purge command: ${error}`, 'discord');
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('14 days')) {
        await message.reply('❌ Cannot delete messages older than 14 days due to Discord limitations.');
      } else if (error.message.includes('Missing Permissions') || error.message.includes('permission')) {
        await message.reply('❌ I don\'t have proper permissions to delete messages. Please check my role permissions.');
      } else {
        await message.reply(`❌ Error: ${error.message}`);
      }
    } else {
      await message.reply('❌ There was an unknown error trying to delete messages.');
    }
  }
}
