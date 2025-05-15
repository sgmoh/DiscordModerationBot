import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add health check endpoints for uptime monitoring
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'UP',
      timestamp: new Date().toISOString(),
      message: 'Discord bot is running'
    });
  });
  
  // Simple ping endpoint for UptimeRobot to monitor
  app.get('/api/ping', (req, res) => {
    res.status(200).send('pong');
  });

  // API routes would go here
  // prefix all API routes with /api

  const httpServer = createServer(app);

  return httpServer;
}
