import { 
  Client, 
  Events, 
  GuildMember,
  TextChannel,
  ChannelType,
  GatewayIntentBits
} from 'discord.js';
import { log } from '../vite';
import { type DiscordConfig } from '@shared/schema';

/**
 * Setup event handlers for the Discord bot
 */
export function setupEvents(client: Client, config: DiscordConfig) {
  // Register the GuildMemberAdd event - requires privileged GuildMembers intent
  client.on(Events.GuildMemberAdd, (member) => handleMemberJoin(member, config));
  
  // Log when the bot is ready
  client.once(Events.ClientReady, (readyClient) => {
    log(`Bot is online as ${readyClient.user.tag}`, 'discord');
    
    // Log event setup status
    log(`Welcome message event handler is active and waiting for new members`, 'discord');
    
    // Log current welcome message
    const welcomeMessage = config.customSettings?.welcomeMessage || config.welcomeMessage;
    log(`Current welcome message: "${welcomeMessage}"`, 'discord');
    
    // Check if we have the proper intents
    const hasGuildMembersIntent = readyClient.options.intents.has(GatewayIntentBits.GuildMembers);
    if (!hasGuildMembersIntent) {
      log(`WARNING: GuildMembers intent appears to be missing. Welcome messages may not work.`, 'discord');
      log(`To enable privileged intents, go to Discord Developer Portal → Bot section → Privileged Gateway Intents`, 'discord');
    } else {
      log(`GuildMembers intent is enabled. Welcome messages should work properly.`, 'discord');
    }
  });

  // Log errors
  client.on(Events.Error, (error) => {
    log(`Discord client error: ${error}`, 'discord');
  });

  log('Events handler set up', 'discord');
}

/**
 * Process custom emoji codes in a string, ensuring they render correctly
 */
function processCustomEmojis(text: string): string {
  // Fix broken backslashes and formatting
  let processed = text;
  
  // Match custom emoji format <:name:id> or similar formats
  const emojiRegex = /<(a?):([a-zA-Z0-9_]+):(\d+)>/g;
  
  // Replace any escaped format with the correct format
  processed = processed.replace(/\\?<:([a-zA-Z0-9_]+):(\d+)\\?>/g, '<:$1:$2>');
  
  // Also check for text versions like :emojiname:
  processed = processed.replace(/:([a-zA-Z0-9_]+):/g, (match, name) => {
    // If it's already part of a custom emoji format, leave it alone
    if (processed.includes(`<:${name}:`)) {
      return match;
    }
    // Otherwise, it might be a regular emoji reference
    return match;
  });
  
  return processed;
}

/**
 * Handles when a new member joins a guild
 */
async function handleMemberJoin(member: GuildMember, config: DiscordConfig) {
  try {
    log(`New member joined: ${member.user.tag} (${member.user.id}) in ${member.guild.name}`, 'discord');
    
    // Try to find the best channel for sending welcome messages
    let welcomeChannel: TextChannel | null = null;
    
    // First, look for channels with "welcome" in the name
    welcomeChannel = member.guild.channels.cache.find(
      (ch) => 
        ch.type === ChannelType.GuildText && 
        (ch.name.toLowerCase().includes('welcome') || ch.name.toLowerCase().includes('lobby')) &&
        (ch as TextChannel).permissionsFor(member.guild.members.me!)?.has('SendMessages')
    ) as TextChannel || null;
    
    // If no welcome channel found, try general channel
    if (!welcomeChannel) {
      welcomeChannel = member.guild.channels.cache.find(
        (ch) => 
          ch.type === ChannelType.GuildText && 
          (ch.name.toLowerCase().includes('general') || ch.name.toLowerCase().includes('chat')) &&
          (ch as TextChannel).permissionsFor(member.guild.members.me!)?.has('SendMessages')
      ) as TextChannel || null;
    }
    
    // If still no channel found, find any text channel we can send to
    if (!welcomeChannel) {
      welcomeChannel = member.guild.channels.cache.find(
        (ch) => 
          ch.type === ChannelType.GuildText && 
          (ch as TextChannel).permissionsFor(member.guild.members.me!)?.has('SendMessages')
      ) as TextChannel || null;
    }
    
    if (!welcomeChannel) {
      log(`Could not find any suitable channel to send welcome message in ${member.guild.name}`, 'discord');
      return;
    }
    
    log(`Selected channel for welcome message: #${welcomeChannel.name}`, 'discord');
    
    // Get the welcome message (use custom message if available)
    let welcomeMessage = config.customSettings?.welcomeMessage || config.welcomeMessage;
    
    // Process the message to ensure custom emojis are properly formatted
    welcomeMessage = processCustomEmojis(welcomeMessage);
    
    // Advanced welcome message with emoji support
    try {
      // Send the welcome message with proper emoji rendering
      await welcomeChannel.send({
        content: `<@${member.id}> ${welcomeMessage}`,
        allowedMentions: { users: [member.id] }
      });
      
      log(`Successfully sent welcome message to ${member.user.tag} in #${welcomeChannel.name}`, 'discord');
    } catch (sendError) {
      log(`Error sending formatted welcome message: ${sendError}`, 'discord');
      
      // Fallback to plain text if there's an issue
      try {
        await welcomeChannel.send(`<@${member.id}> Welcome to the server!`);
        log(`Sent fallback welcome message`, 'discord');
      } catch (fallbackError) {
        log(`Failed to send even fallback message: ${fallbackError}`, 'discord');
      }
    }
  } catch (error) {
    log(`Error in welcome message handler: ${error}`, 'discord');
  }
}
