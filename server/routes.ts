import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";

interface WSClient extends WebSocket {
  username?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/ws"
  });

  app.post("/api/login", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUser(data.username);

      if (!existingUser) {
        await storage.createUser(data);
      }

      res.json({ username: data.username });
    } catch (error) {
      res.status(400).json({ error: "Invalid username" });
    }
  });

  function broadcast(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  wss.on("connection", (ws: WSClient) => {
    console.log('New WebSocket connection established');

    ws.on("message", async (data) => {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);

      switch (message.type) {
        case "join": {
          ws.username = message.username;
          await storage.setUserOnline(message.username, true);
          const onlineUsers = await storage.getOnlineUsers();
          const messages = await storage.getMessages();

          ws.send(JSON.stringify({
            type: "init",
            messages,
            users: onlineUsers,
          }));

          broadcast({
            type: "userJoined",
            username: message.username,
            users: onlineUsers,
          });
          break;
        }

        case "message": {
          try {
            const validMessage = insertMessageSchema.parse({
              content: message.content,
              username: ws.username!,
            });

            const savedMessage = await storage.addMessage(validMessage);
            broadcast({
              type: "message",
              message: savedMessage,
            });
          } catch (error) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Invalid message format",
            }));
          }
          break;
        }
      }
    });

    ws.on("close", async () => {
      if (ws.username) {
        await storage.setUserOnline(ws.username, false);
        const onlineUsers = await storage.getOnlineUsers();
        broadcast({
          type: "userLeft",
          username: ws.username,
          users: onlineUsers,
        });
      }
    });
  });

  return httpServer;
}