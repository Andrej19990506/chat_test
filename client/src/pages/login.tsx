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
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="flex justify-between items-center">
              <div className="w-10" /> {/* Пустой div для центрирования */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </motion.div>
              <ThemeToggle />
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground"
            >
              Добро пожаловать в Чат
            </motion.h1>
            <CardDescription className="text-muted-foreground">
              Войдите или создайте новый аккаунт
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-200"
              >
                Вход
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-200"
              >
                Регистрация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => handleSubmit(e, "login")}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
                <CardFooter>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                    Войти
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={(e) => handleSubmit(e, "register")}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
                <CardFooter>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                    Создать аккаунт
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}