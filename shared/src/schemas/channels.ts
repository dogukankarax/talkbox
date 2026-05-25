import { z } from "zod";

export const CreateChannelSchema = z.object({
  name: z.string().min(1).max(50),
});

export const JoinChannelSchema = z.object({
  invite_code: z.string().min(1),
});

export const UpdateChannelSchema = z.object({
  name: z.string().min(1).max(50),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});
