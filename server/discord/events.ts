import { 
  Client, 
  Events, 
  GuildMember,
  TextChannel,
  ChannelType
} from 'discord.js';
import { log } from '../vite';
import { type DiscordConfig } from '@shared/schema';

/**
 * Setup event handlers for the Discord bot
 */
export function setupEvents(client: Client, config: DiscordConfig) {
  // NOTE: GuildMemberAdd event requires privileged GuildMembers intent
  // So we don't register it here, but the handler code is kept for reference
  
  // Log when the bot is ready
  client.once(Events.ClientReady, (readyClient) => {
    log(`Bot is online as ${readyClient.user.tag}`, 'discord');
    
    // Inform about welcome message functionality
    log(`Welcome message functionality is ready but requires the GuildMembers privileged intent to be enabled in Discord Developer Portal`, 'discord');
    
    // Log message about how to enable privileged intents
    log(`To enable privileged intents like GuildMembers and MessageContent, go to Discord Developer Portal, select your application, go to the Bot section, and enable the required intents under "Privileged Gateway Intents"`, 'discord');
  });

  // Log errors
  client.on(Events.Error, (error) => {
    log(`Discord client error: ${error}`, 'discord');
  });

  log('Events handler set up', 'discord');
}

/**
 * Handles when a new member joins a guild
 */
async function handleMemberJoin(member: GuildMember, config: DiscordConfig) {
  try {
    log(`New member joined: ${member.user.tag}`, 'discord');
    
    // Find the first available text channel to send the welcome message
    const channel = member.guild.channels.cache.find(
      (ch) => ch.type === ChannelType.GuildText && 
              (ch as TextChannel).permissionsFor(member.guild.members.me!)?.has('SendMessages')
    ) as TextChannel;
    
    if (!channel) {
      log(`Could not find a suitable channel to send welcome message in ${member.guild.name}`, 'discord');
      return;
    }
    
    // Send the welcome message (use custom message if available)
    const welcomeMessage = config.customSettings?.welcomeMessage || config.welcomeMessage;
    await channel.send(`${member} ${welcomeMessage}`);
    log(`Sent welcome message to ${member.user.tag} in ${member.guild.name}: "${welcomeMessage}"`, 'discord');
    
  } catch (error) {
    log(`Error sending welcome message: ${error}`, 'discord');
  }
}
