import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10"
    >
      <div className="relative w-6 h-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: theme === "dark" ? 1 : 0, rotate: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Moon className="w-6 h-6" />
        </motion.div>
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: theme === "light" ? 1 : 0, rotate: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Sun className="w-6 h-6" />
        </motion.div>
      </div>
    </Button>
  );
}
