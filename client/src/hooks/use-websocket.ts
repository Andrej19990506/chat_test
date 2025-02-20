import { useEffect, useRef, useState, useCallback } from "react";
import type { Message, User } from "@shared/schema";

type WebSocketMessage = 
  | { type: "init"; messages: Message[]; users: User[] }
  | { type: "message"; message: Message }
  | { type: "userJoined" | "userLeft"; username: string; users: User[] }
  | { type: "error"; message: string };

export function useWebSocket(username: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!username) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", username }));
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketMessage;

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
    };

    return () => {
      ws.close();
    };
  }, [username]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", content }));
    }
  }, []);

  return { messages, users, connected, sendMessage };
}
