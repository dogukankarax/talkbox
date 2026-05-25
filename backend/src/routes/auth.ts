import { db } from "@/db/index.js";
import { usersTable } from "@/db/schema.js";
import { env } from "@/lib/env.js";
import { logger } from "@/lib/logger.js";
import { authMiddleware } from "@/middleware/auth.js";
import { LoginSchema, RegisterSchema } from "@talkbox/shared";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const jwtSecret = env.JWT_SECRET;

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, async (req, res) => {
  const result = RegisterSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { username, email, password } = result.data;

  try {
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      return res.status(400).send({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(usersTable)
      .values({ email, username, password: hashedPassword })
      .returning({
        email: usersTable.email,
        username: usersTable.username,
        id: usersTable.id,
      });

    const createdUser = newUser[0];

    if (!createdUser) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const token = jwt.sign(
      {
        email: createdUser.email,
        username: createdUser.username,
        id: createdUser.id,
      },
      jwtSecret,
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (error) {
    logger.error({ err: error }, "Error during registration");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  const result = LoginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { email, password } = result.data;

  try {
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    const user = existingUser[0];

    if (!user) {
      return res.status(400).send({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email: user.email, username: user.username, id: user.id },
      jwtSecret,
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (error) {
    logger.error({ err: error }, "Error during login");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
  });
});

export { router };
