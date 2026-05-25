import { db } from "@/db/index.js";
import { messagesTable, usersTable } from "@/db/schema.js";
import { logger } from "@/lib/logger.js";
import { authMiddleware } from "@/middleware/auth.js";
import { requireChannelMember } from "@/middleware/channelAccess.js";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get("/", requireChannelMember, async (req, res) => {
  const channelId = req.channelMember!.channel_id;

  try {
    const result = await db
      .select({
        id: messagesTable.id,
        content: messagesTable.content,
        created_at: messagesTable.created_at,
        username: usersTable.username,
        sender_id: messagesTable.sender_id,
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.sender_id, usersTable.id))
      .where(eq(messagesTable.channel_id, channelId))
      .orderBy(messagesTable.created_at);

    res.json(result);
  } catch (error) {
    logger.error({ err: error }, "Error fetching messages");
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages" });
  }
});

export default router;
