import { 
  Message, 
  PermissionFlagsBits,
  TextChannel,
  ChannelType
} from 'discord.js';
import { log } from '../vite';
import { type DiscordConfig } from '@shared/schema';

/**
 * Command to set a custom welcome message
 */
export async function handleSetWelcomeCommand(message: Message, args: string[], config: DiscordConfig) {
  try {
    // Check if message is in a guild
    if (!message.guild) {
      await message.reply('This command can only be used in a server.');
      return;
    }
    
    // Check for admin permissions
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply('❌ You need Administrator permission to change the welcome message.');
      return;
    }
    
    // Get the new welcome message
    const newWelcomeMessage = args.join(' ').trim();
    
    if (!newWelcomeMessage) {
      await message.reply('⚠️ Please provide a welcome message. Usage: `.setwelcome Your welcome message here`');
      return;
    }
    
    // Store the raw welcome message in the config
    config.customSettings.welcomeMessage = newWelcomeMessage;
    
    // Make sure we're in a text channel
    if (message.channel.type !== ChannelType.GuildText) {
      await message.reply('⚠️ This command works best in a regular text channel.');
      return;
    }
    
    const textChannel = message.channel as TextChannel;
    
    // Send confirmation with properly rendered emoji
    await textChannel.send({
      content: `✅ Welcome message updated! New members will see:`,
      allowedMentions: { parse: [] }
    });
    
    // Send a preview of how the welcome message will appear
    await textChannel.send({
      content: `<@${message.author.id}> ${newWelcomeMessage}`,
      allowedMentions: { users: [message.author.id] }
    });
    
    log(`Welcome message updated to: "${newWelcomeMessage}" by ${message.author.tag}`, 'discord');
    
  } catch (error) {
    log(`Error in setwelcome command: ${error}`, 'discord');
    await message.reply('❌ There was an error updating the welcome message.');
  }
}

/**
 * Command to view the current welcome message
 */
export async function handleGetWelcomeCommand(message: Message, config: DiscordConfig) {
  try {
    // Get the current welcome message
    const currentMessage = config.customSettings.welcomeMessage;
    
    // Make sure we're in a text channel
    if (message.channel.type !== ChannelType.GuildText) {
      await message.reply('⚠️ This command works best in a regular text channel.');
      return;
    }
    
    const textChannel = message.channel as TextChannel;
    
    // Send info message
    await textChannel.send({
      content: `📢 Current welcome message:`,
      allowedMentions: { parse: [] }
    });
    
    // Send preview of the actual welcome message as it will appear with emojis properly rendered
    await textChannel.send({
      content: `<@${message.author.id}> ${currentMessage}`,
      allowedMentions: { users: [message.author.id] }
    });
    
  } catch (error) {
    log(`Error in getwelcome command: ${error}`, 'discord');
    await message.reply('❌ There was an error getting the welcome message.');
  }
}