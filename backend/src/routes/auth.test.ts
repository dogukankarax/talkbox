import { app } from "@/app.js";
import { cleanDb } from "@/test-utils.js";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(cleanDb);

describe("POST /api/auth/register", () => {
  it("creates a user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "hello",
      email: "hello@example.com",
      password: "secret1",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects a duplicate email", async () => {
    const payload = {
      username: "hello",
      email: "hello@example.com",
      password: "secret1",
    };
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(400);
  });
});
