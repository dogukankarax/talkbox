import type { channelMembersTable } from "@/db/schema.js";
import type { InferSelectModel } from "drizzle-orm";

export type AuthUser = { id: string; email: string; username: string };
export type ChannelMembership = InferSelectModel<typeof channelMembersTable>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      channelMember?: ChannelMembership;
    }
  }
}

export {};
