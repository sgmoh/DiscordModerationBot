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

## Discord Developer Portal Setup

Before using the bot, you need to enable the required privileged intents:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to the "Bot" section
4. Scroll down to "Privileged Gateway Intents"
5. Enable both "MESSAGE CONTENT INTENT" and "SERVER MEMBERS INTENT"
6. Save your changes

## Deployment on Render

This bot is configured for deployment on Render:

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: Discord Bot (or any name you prefer)
   - **Environment**: Node
   - **Build Command**: `bash ./render-build.sh`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `DISCORD_BOT_TOKEN` = your bot token
   - `DISCORD_CLIENT_ID` = your client ID
   - `NODE_ENV` = production
7. Click "Create Web Service"

You can also use Render's Blueprint feature with the `render.yaml` file included in this repository for easier deployment.

## Keeping Your Bot Online with UptimeRobot

Render may put free tier services to sleep after periods of inactivity. To keep your bot running 24/7:

1. Create an account on [UptimeRobot](https://uptimerobot.com/)
2. Click "Add New Monitor"
3. Configure the monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Discord Bot
   - **URL**: `https://your-app.onrender.com/api/ping` (replace with your Render URL)
   - **Monitoring Interval**: Every 5 minutes
4. Click "Create Monitor"

This will ping your bot every 5 minutes to prevent it from sleeping.

## Requirements

- Node.js v16+
- Discord.js v14
- Express