import { db } from "@/db/index.js";
import { channelMembersTable, channelsTable, usersTable } from "@/db/schema.js";
import { logger } from "@/lib/logger.js";
import { authMiddleware } from "@/middleware/auth.js";
import {
  requireChannelAdmin,
  requireChannelMember,
} from "@/middleware/channelAccess.js";
import { getIO } from "@/socket/io.js";
import {
  CreateChannelSchema,
  JoinChannelSchema,
  UpdateChannelSchema,
  UpdateMemberRoleSchema,
} from "@talkbox/shared";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { nanoid } from "nanoid";

const router = Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  const result = CreateChannelSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { name } = result.data;

  const user = req.user!;

  try {
    const newChannel = await db
      .insert(channelsTable)
      .values({
        created_by: user.id,
        channel_name: name,
        invite_code: nanoid(10),
      })
      .returning({
        id: channelsTable.id,
        invite_code: channelsTable.invite_code,
      });

    const createdChannel = newChannel[0];

    if (!createdChannel) {
      return res.status(500).json({ error: "Failed to create channel" });
    }

    await db.insert(channelMembersTable).values({
      channel_id: createdChannel.id,
      user_id: user.id,
      role: "admin",
    });

    res.status(201).json({
      channelId: createdChannel.id,
      invite_code: createdChannel.invite_code,
    });
  } catch (error) {
    logger.error({ err: error }, "Error creating channel");
    res
      .status(500)
      .json({ error: "An error occurred while creating the channel" });
  }
});

router.get("/", async (req, res) => {
  const user = req.user!;

  try {
    const result = await db
      .select({
        id: channelsTable.id,
        channel_name: channelsTable.channel_name,
        created_at: channelsTable.created_at,
        role: channelMembersTable.role,
        invite_code: channelsTable.invite_code,
      })
      .from(channelsTable)
      .innerJoin(
        channelMembersTable,
        eq(channelsTable.id, channelMembersTable.channel_id),
      )
      .where(eq(channelMembersTable.user_id, user.id));
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, "Error fetching channels");
    res
      .status(500)
      .json({ error: "An error occurred while fetching channels" });
  }
});

router.post("/join", async (req, res) => {
  const result = JoinChannelSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { invite_code } = result.data;

  const user = req.user!;

  try {
    const channels = await db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.invite_code, invite_code));

    const channel = channels[0];

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const existingMembership = await db
      .select()
      .from(channelMembersTable)
      .where(
        and(
          eq(channelMembersTable.user_id, user.id),
          eq(channelMembersTable.channel_id, channel.id),
        ),
      );

    if (existingMembership.length > 0) {
      return res
        .status(400)
        .json({ error: "Already a member of this channel" });
    }

    await db.insert(channelMembersTable).values({
      channel_id: channel.id,
      user_id: user.id,
      role: "member",
    });

    getIO().to(channel.id).emit("member_joined", {
      channelId: channel.id,
      userId: user.id,
      username: user.username,
    });

    res.status(201).json({
      channelId: channel.id,
      channel_name: channel.channel_name,
    });
  } catch (error) {
    logger.error({ err: error }, "Error joining channel");
    res
      .status(500)
      .json({ error: "An error occurred while joining the channel" });
  }
});

router.get("/:channelId/members", requireChannelMember, async (req, res) => {
  const channelId = req.channelMember!.channel_id;

  try {
    const result = await db
      .select({
        user_id: usersTable.id,
        username: usersTable.username,
        role: channelMembersTable.role,
      })
      .from(channelMembersTable)
      .innerJoin(usersTable, eq(channelMembersTable.user_id, usersTable.id))
      .where(eq(channelMembersTable.channel_id, channelId));

    res.json(result);
  } catch (error) {
    logger.error({ err: error }, "Error fetching channel members");
    res
      .status(500)
      .json({ error: "An error occurred while fetching channel members" });
  }
});

router.patch(
  "/:channelId",
  requireChannelMember,
  requireChannelAdmin,
  async (req, res) => {
    const result = UpdateChannelSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { name } = result.data;
    const channelId = req.channelMember!.channel_id;

    try {
      const updated = await db
        .update(channelsTable)
        .set({ channel_name: name })
        .where(eq(channelsTable.id, channelId))
        .returning({
          id: channelsTable.id,
          channel_name: channelsTable.channel_name,
        });

      const updatedChannel = updated[0];
      if (!updatedChannel) {
        return res.status(500).json({ error: "Failed to update channel" });
      }

      getIO().to(channelId).emit("channel_updated", updatedChannel);
      res.json(updatedChannel);
    } catch (error) {
      logger.error({ err: error }, "Error updating channel");
      res
        .status(500)
        .json({ error: "An error occurred while updating the channel" });
    }
  },
);

router.delete(
  "/:channelId",
  requireChannelMember,
  requireChannelAdmin,
  async (req, res) => {
    const channelId = req.channelMember!.channel_id;

    try {
      getIO().to(channelId).emit("channel_deleted", { channelId });
      await db.delete(channelsTable).where(eq(channelsTable.id, channelId));
      res.status(204).send();
    } catch (error) {
      logger.error({ err: error }, "Error deleting channel");
      res
        .status(500)
        .json({ error: "An error occurred while deleting the channel" });
    }
  },
);

router.post("/:channelId/leave", requireChannelMember, async (req, res) => {
  const user = req.user!;
  const member = req.channelMember!;
  const channelId = member.channel_id;

  try {
    if (member.role === "admin") {
      const otherAdmins = await db
        .select()
        .from(channelMembersTable)
        .where(
          and(
            eq(channelMembersTable.channel_id, channelId),
            eq(channelMembersTable.role, "admin"),
          ),
        );

      if (otherAdmins.length <= 1) {
        return res.status(400).json({
          error:
            "You are the only admin. Delete the channel or promote another member first.",
        });
      }
    }

    getIO().to(channelId).emit("member_left", { channelId, userId: user.id });
    await db
      .delete(channelMembersTable)
      .where(
        and(
          eq(channelMembersTable.user_id, user.id),
          eq(channelMembersTable.channel_id, channelId),
        ),
      );
    res.status(204).send();
  } catch (error) {
    logger.error({ err: error }, "Error leaving channel");
    res
      .status(500)
      .json({ error: "An error occurred while leaving the channel" });
  }
});

router.delete(
  "/:channelId/members/:userId",
  requireChannelMember,
  requireChannelAdmin,
  async (req, res) => {
    const user = req.user!;
    const channelId = req.channelMember!.channel_id;
    const targetUserId = req.params.userId;

    if (typeof targetUserId !== "string") {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (user.id === targetUserId) {
      return res.status(400).json({ error: "Cannot remove yourself" });
    }

    try {
      getIO().to(channelId).emit("member_removed", {
        channelId,
        userId: targetUserId,
      });
      await db
        .delete(channelMembersTable)
        .where(
          and(
            eq(channelMembersTable.user_id, targetUserId),
            eq(channelMembersTable.channel_id, channelId),
          ),
        );
      res.status(204).send();
    } catch (error) {
      logger.error({ err: error }, "Error removing member");
      res
        .status(500)
        .json({ error: "An error occurred while removing the member" });
    }
  },
);

router.patch(
  "/:channelId/members/:userId/role",
  requireChannelMember,
  requireChannelAdmin,
  async (req, res) => {
    const result = UpdateMemberRoleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { role } = result.data;
    const user = req.user!;
    const channelId = req.channelMember!.channel_id;
    const targetUserId = req.params.userId;

    if (typeof targetUserId !== "string") {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (user.id === targetUserId) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    try {
      await db
        .update(channelMembersTable)
        .set({ role })
        .where(
          and(
            eq(channelMembersTable.user_id, targetUserId),
            eq(channelMembersTable.channel_id, channelId),
          ),
        );
      getIO().to(channelId).emit("member_role_updated", {
        channelId,
        userId: targetUserId,
        role,
      });
      res.status(204).send();
    } catch (error) {
      logger.error({ err: error }, "Error updating member role");
      res.status(500).json({ error: "An error occurred" });
    }
  },
);

export default router;
