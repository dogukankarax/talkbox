import { LoginSchema, RegisterSchema } from "@talkbox/shared";
import { describe, expect, it } from "vitest";

describe("LoginSchema", () => {
  it("accepts valid credentials", () => {
    const result = LoginSchema.safeParse({
      email: "test@example.com",
      password: "secret1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "secret1",
    });
    expect(result.success).toBe(false);
  });
});

describe("RegisterSchema", () => {
  it("rejects a password shorter than 6 chars", () => {
    const result = RegisterSchema.safeParse({
      username: "hello",
      email: "test@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});
