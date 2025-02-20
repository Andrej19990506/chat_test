import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите имя пользователя",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/login", { username: username.trim() });
      localStorage.setItem("chat-username", username.trim());
      setLocation("/chat");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось войти. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Добро пожаловать в Чат</h1>
          <p className="text-muted-foreground">Введите ваше имя пользователя для продолжения</p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            <Input
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">
              Войти в чат
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}