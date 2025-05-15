# Immy's Discord Bot

A custom Discord bot with message purging capability and automatic welcome messages for new server members.

## Features

- `.purge [1-100]` - Deletes a specified number of messages in a channel
- Automatic welcome messages for new members with custom message support
- `.setwelcome [message]` - Set a custom welcome message (supports emojis)
- `.getwelcome` - View the current welcome message

## Setup

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in your Discord Bot Token and Client ID
3. Install dependencies: `npm install`
4. Run the bot: `npm run dev` (development) or `npm start` (production)

## Deployment on Render

This bot is configured for deployment on Render:

1. Push your code to a GitHub repository
2. In Render, create a new Web Service
3. Connect your GitHub repository
4. Set the build command: `npm install && npm run build`
5. Set the start command: `npm start`
6. Add environment variables:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `NODE_ENV=production`

## Monitoring with UptimeRobot

To keep your bot running 24/7:

1. Deploy your bot on Render
2. Create an account on [UptimeRobot](https://uptimerobot.com/)
3. Add a new monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: Discord Bot
   - URL: Your Render app URL + /ping (e.g., https://your-app.onrender.com/ping)
   - Monitoring Interval: 5 minutes
4. This will ping your bot every 5 minutes to keep it awake

## Requirements

- Node.js v16+
- Discord.js v14
- Express