import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireOrgAdmin } from "./users";

export const getOrCreateConversation = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrgAdmin(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event || event.clerkOrgId !== orgId) {
      throw new Error("Event does not belong to your organization");
    }

    const existing = await ctx.db
      .query("orgConversations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("orgConversations", {
      clerkOrgId: orgId,
      eventId: args.eventId,
      userId: args.userId,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const getConversationsByOrg = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrgAdmin(ctx);

    const conversations = await ctx.db
      .query("orgConversations")
      .withIndex("by_org", (q) => q.eq("clerkOrgId", orgId))
      .collect();

    return await Promise.all(
      conversations.map(async (conv) => {
        const event = await ctx.db.get(conv.eventId);
        const user = await ctx.db.get(conv.userId);

        const messages = await ctx.db
          .query("orgMessages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        const lastMessage = messages.length > 0 ? messages.at(-1) : null;

        const unreadCount = messages.filter(
          (m) => m.senderRole === "vendor" && !m.read
        ).length;

        return {
          ...conv,
          eventName: event?.name ?? "Unknown Event",
          vendorName: user?.name ?? "Unknown User",
          vendorEmail: user?.email ?? "",
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderRole: lastMessage.senderRole,
              }
            : null,
          unreadCount,
        };
      })
    );
  },
});

export const getConversationsByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const conversations = await ctx.db
      .query("orgConversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      conversations.map(async (conv) => {
        const event = await ctx.db.get(conv.eventId);

        const messages = await ctx.db
          .query("orgMessages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        const lastMessage = messages.length > 0 ? messages.at(-1) : null;

        const unreadCount = messages.filter(
          (m) => m.senderRole === "admin" && !m.read
        ).length;

        return {
          ...conv,
          eventName: event?.name ?? "Unknown Event",
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderRole: lastMessage.senderRole,
              }
            : null,
          unreadCount,
        };
      })
    );
  },
});

export const getMessages = query({
  args: { conversationId: v.id("orgConversations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Check authorization: either the vendor or an org admin
    const isVendor = conversation.userId === user._id;
    if (!isVendor) {
      const membership = await ctx.db
        .query("orgMemberships")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", user._id).eq("clerkOrgId", conversation.clerkOrgId)
        )
        .first();
      if (!membership) throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("orgMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          senderName: sender?.name ?? "Unknown",
        };
      })
    );
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("orgConversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Determine sender role
    const isVendor = conversation.userId === user._id;
    let senderRole: "admin" | "vendor" = "vendor";

    if (!isVendor) {
      const membership = await ctx.db
        .query("orgMemberships")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", user._id).eq("clerkOrgId", conversation.clerkOrgId)
        )
        .first();
      if (!membership) throw new Error("Unauthorized");
      senderRole = "admin";
    }

    const messageId = await ctx.db.insert("orgMessages", {
      conversationId: args.conversationId,
      senderId: user._id,
      senderRole,
      content: args.content,
      read: false,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("orgConversations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const isVendor = conversation.userId === user._id;

    // Mark messages NOT sent by current user's role as read
    const targetRole = isVendor ? "admin" : "vendor";

    const messages = await ctx.db
      .query("orgMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const unread = messages.filter(
      (m) => m.senderRole === targetRole && !m.read
    );

    for (const msg of unread) {
      await ctx.db.patch(msg._id, { read: true });
    }

    return unread.length;
  },
});

export const getAdminUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrgAdmin(ctx);

    const conversations = await ctx.db
      .query("orgConversations")
      .withIndex("by_org", (q) => q.eq("clerkOrgId", orgId))
      .collect();

    let total = 0;
    for (const conv of conversations) {
      const messages = await ctx.db
        .query("orgMessages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .collect();
      total += messages.filter(
        (m) => m.senderRole === "vendor" && !m.read
      ).length;
    }

    return total;
  },
});

export const getUserUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const conversations = await ctx.db
      .query("orgConversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    let total = 0;
    for (const conv of conversations) {
      const messages = await ctx.db
        .query("orgMessages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .collect();
      total += messages.filter(
        (m) => m.senderRole === "admin" && !m.read
      ).length;
    }

    return total;
  },
});
