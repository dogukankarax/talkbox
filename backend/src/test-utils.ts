import { app } from "@/app.js";
import { db } from "@/db/index.js";
import {
  channelMembersTable,
  channelsTable,
  messagesTable,
  usersTable,
} from "@/db/schema.js";
import request from "supertest";

export async function cleanDb() {
  await db.delete(messagesTable);
  await db.delete(channelMembersTable);
  await db.delete(channelsTable);
  await db.delete(usersTable);
}

export async function registerUser(email: string): Promise<string> {
  const res = await request(app).post("/api/auth/register").send({
    username: "tester",
    email,
    password: "secret1",
  });
  return res.body.token as string;
}
