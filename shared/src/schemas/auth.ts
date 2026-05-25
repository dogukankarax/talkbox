import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.email(),
  password: z.string().min(6),
});
