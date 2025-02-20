import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUser(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser(async (username: string, done) => {
    try {
      const user = await storage.getUser(username);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const existingUser = await storage.getUser(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь уже существует" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        username: req.body.username,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Ошибка входа после регистрации" });
        }
        res.status(201).json({ username: user.username });
      });
    } catch (error) {
      res.status(500).json({ message: "Ошибка при регистрации" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка сервера" });
      }
      if (!user) {
        return res.status(401).json({ message: "Неверные учетные данные" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Ошибка входа" });
        }
        res.json({ username: user.username });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Не авторизован" });
    }
    res.json({ username: req.user.username });
  });
}
