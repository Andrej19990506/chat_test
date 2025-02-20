import { users, messages, type User, type InsertUser, type Message } from "@shared/schema";

export interface IStorage {
  getUser(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setUserOnline(username: string, online: boolean): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
  addMessage(message: { content: string; username: string }): Promise<Message>;
  getMessages(): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Message[];
  private currentUserId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.messages = [];
    this.currentUserId = 1;
    this.currentMessageId = 1;
  }

  async getUser(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, online: "false" };
    this.users.set(user.username, user);
    return user;
  }

  async setUserOnline(username: string, online: boolean): Promise<void> {
    const user = await this.getUser(username);
    if (user) {
      user.online = online.toString();
      this.users.set(username, user);
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.online === "true",
    );
  }

  async addMessage(message: { content: string; username: string }): Promise<Message> {
    const newMessage: Message = {
      id: this.currentMessageId++,
      content: message.content,
      username: message.username,
      timestamp: new Date(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  async getMessages(): Promise<Message[]> {
    return this.messages;
  }
}

export const storage = new MemStorage();
