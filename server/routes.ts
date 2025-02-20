import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { setupAuth } from "./auth";

interface WSClient extends WebSocket {
  username?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/ws"
  });

  // Настройка аутентификации
  setupAuth(app);

  // Добавляем новый роут для обновления аватара
  app.post("/api/avatar", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Не авторизован" });
    }

    try {
      await storage.updateAvatar(req.user.username, req.body.avatar);
      res.status(200).json({ message: "Аватар обновлен" });
    } catch (error) {
      res.status(500).json({ message: "Ошибка при обновлении аватара" });
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

    ws.on("error", (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);

        switch (message.type) {
          case "join": {
            ws.username = message.username;
            await storage.setUserOnline(message.username, true);
            const onlineUsers = await storage.getOnlineUsers();
            const messages = await storage.getMessages();
            console.log(`User ${message.username} joined. Online users:`, onlineUsers);

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
              console.log(`New message from ${ws.username}:`, savedMessage);

              broadcast({
                type: "message",
                message: savedMessage,
              });
            } catch (error) {
              console.error('Invalid message format:', error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Invalid message format",
              }));
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on("close", async () => {
      if (ws.username) {
        console.log(`User ${ws.username} disconnected`);
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