import { useEffect, useRef, useState, useCallback } from "react";
import type { Message, User } from "@shared/schema";

type WebSocketMessage = 
  | { type: "init"; messages: Message[]; users: User[] }
  | { type: "message"; message: Message }
  | { type: "userJoined" | "userLeft"; username: string; users: User[] }
  | { type: "error"; message: string };

function createWebSocket(url: string, handlers: {
  onOpen: () => void;
  onClose: () => void;
  onMessage: (data: WebSocketMessage) => void;
}) {
  const ws = new WebSocket(url);

  ws.onopen = handlers.onOpen;
  ws.onclose = handlers.onClose;
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data) as WebSocketMessage;
    handlers.onMessage(data);
  };
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return ws;
}

export function useWebSocket(username: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!username) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = createWebSocket(wsUrl, {
      onOpen: () => {
        console.log("WebSocket connected");
        setConnected(true);
        ws.send(JSON.stringify({ type: "join", username }));
      },
      onClose: () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      },
      onMessage: (data) => {
        switch (data.type) {
          case "init":
            setMessages(data.messages);
            setUsers(data.users);
            break;
          case "message":
            setMessages((prev) => [...prev, data.message]);
            break;
          case "userJoined":
          case "userLeft":
            setUsers(data.users);
            break;
        }
      }
    });

    wsRef.current = ws;

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [username]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", content }));
    }
  }, []);

  return { messages, users, connected, sendMessage };
}