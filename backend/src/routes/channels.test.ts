import { app } from "@/app.js";
import { cleanDb, registerUser } from "@/test-utils.js";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(cleanDb);

describe("POST /api/channels", () => {
  it("creates a channel for an authenticated user", async () => {
    const token = await registerUser("creator@example.com");

    const res = await request(app)
      .post("/api/channels")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "general" });

    expect(res.status).toBe(201);
    expect(res.body.channelId).toBeDefined();
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/channels")
      .send({ name: "general" });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/channels/:channelId", () => {
  it("forbids a non-member from updating a channel", async () => {
    const ownerToken = await registerUser("owner@example.com");
    const otherToken = await registerUser("other@example.com");

    const createRes = await request(app)
      .post("/api/channels")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "general" });
    const channelId = createRes.body.channelId;

    const patchRes = await request(app)
      .patch(`/api/channels/${channelId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ name: "hijacked" });

    expect(patchRes.status).toBe(403);
  });
});
