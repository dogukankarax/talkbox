import { db } from "@/db/index.js";
import { channelMembersTable } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const requireChannelMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user!;
  const channelId = req.params.channelId;

  if (typeof channelId !== "string") {
    return res.status(400).json({ error: "Invalid channel id" });
  }

  const membership = await db
    .select()
    .from(channelMembersTable)
    .where(
      and(
        eq(channelMembersTable.user_id, user.id),
        eq(channelMembersTable.channel_id, channelId),
      ),
    )
    .limit(1);

  const member = membership[0];
  if (!member) {
    return res
      .status(403)
      .json({ error: "You are not a member of this channel" });
  }

  req.channelMember = member;
  next();
};

export const requireChannelAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.channelMember?.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Only admins can perform this action" });
  }
  next();
};
