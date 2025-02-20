import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/hooks/use-websocket";
import { MessageCircle, Users, AlertCircle, LogOut } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Chat() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const username = localStorage.getItem("chat-username");
  const { messages, users, connected, sendMessage } = useWebSocket(username);

  useEffect(() => {
    if (!username) {
      setLocation("/");
      return;
    }
  }, [username, setLocation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage(message.trim());
    setMessage("");
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      localStorage.removeItem("chat-username");
      setLocation("/");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  if (!username) return null;

  return (
    <div className="min-h-screen w-full bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-2rem)]">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold">Чат</h2>
                <div className="ml-auto flex items-center gap-4">
                  <ThemeToggle />
                  {!connected && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Отключено</span>
                    </motion.div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-orange-500 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              </div>

              <ScrollArea ref={scrollRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className={`flex flex-col ${
                        msg.username === username ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.username === username
                            ? "bg-orange-500 text-white"
                            : "bg-accent"
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {msg.username === username ? "Вы" : msg.username}
                        </div>
                        <div className="break-words">{msg.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.timestamp), "HH:mm")}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <form onSubmit={handleSubmit} className="p-4 border-t">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    disabled={!connected}
                    className="focus-visible:ring-orange-500"
                  />
                  <Button
                    type="submit"
                    disabled={!connected}
                    className="bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Отправить
                  </Button>
                </motion.div>
              </form>
            </div>
          </Card>
        </div>

        <Card className="h-[calc(100vh-2rem)]">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold">Пользователи онлайн</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-accent/50"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="font-medium">
                      {user.username === username ? "Вы" : user.username}
                    </span>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}