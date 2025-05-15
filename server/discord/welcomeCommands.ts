import { 
  Message, 
  PermissionFlagsBits
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
    
    // Update the welcome message in the config
    config.customSettings.welcomeMessage = newWelcomeMessage;
    
    // Send confirmation
    await message.reply(`✅ Welcome message updated to: "${newWelcomeMessage}"`);
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
    
    // Send the current welcome message
    await message.reply(`📢 Current welcome message: "${currentMessage}"`);
    
  } catch (error) {
    log(`Error in getwelcome command: ${error}`, 'discord');
    await message.reply('❌ There was an error getting the welcome message.');
  }
}