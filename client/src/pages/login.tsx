import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

interface AuthForm {
  username: string;
  password: string;
}

export default function Login() {
  const [formData, setFormData] = useState<AuthForm>({ username: "", password: "" });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, type: "login" | "register") => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpoint = type === "login" ? "/api/login" : "/api/register";
      await apiRequest("POST", endpoint, formData);
      localStorage.setItem("chat-username", formData.username.trim());
      setLocation("/chat");
    } catch (error) {
      const message = type === "login" 
        ? "Не удалось войти. Проверьте имя пользователя и пароль."
        : "Не удалось зарегистрироваться. Возможно, пользователь уже существует.";

      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать в Чат</h1>
          <CardDescription className="text-gray-500">Войдите или создайте новый аккаунт</CardDescription>
        </CardHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={(e) => handleSubmit(e, "login")}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username-login">Имя пользователя</Label>
                  <Input
                    id="username-login"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Введите имя пользователя"
                    className="focus-visible:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Пароль</Label>
                  <Input
                    id="password-login"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Введите пароль"
                    className="focus-visible:ring-orange-500"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                  Войти
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={(e) => handleSubmit(e, "register")}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username-register">Имя пользователя</Label>
                  <Input
                    id="username-register"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Выберите имя пользователя"
                    className="focus-visible:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Пароль</Label>
                  <Input
                    id="password-register"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Создайте пароль"
                    className="focus-visible:ring-orange-500"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                  Создать аккаунт
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}