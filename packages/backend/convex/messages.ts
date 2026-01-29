import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    recipientId: v.id("users"),
    vehicleId: v.id("vehicles"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    // Get or create conversation
    const conversationId = await ctx.runMutation(
      api.conversations.getOrCreateConversation,
      {
        vehicleId: args.vehicleId,
        participant1Id: currentUser._id,
        participant2Id: args.recipientId,
      }
    );

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: currentUser._id,
      recipientId: args.recipientId,
      content: args.content,
      read: false,
      createdAt: Date.now(),
    });

    // Update conversation's last message time
    await ctx.runMutation(api.conversations.updateLastMessageTime, {
      conversationId,
    });

    return messageId;
  },
});

export const getMessagesByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.participant1Id !== currentUser._id && conversation.participant2Id !== currentUser._id) {
      throw new Error("Unauthorized: not a participant");
    }
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const getMessagesByVehicle = query({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    if (vehicle.userId !== currentUser._id) {
      throw new Error("Unauthorized: not the vehicle owner");
    }

    // Get all conversations for this vehicle
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();

    // Get all messages from these conversations
    const allMessages = [];
    for (const conversation of conversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();
      allMessages.push(...messages);
    }

    return allMessages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

// This function is now deprecated - use conversations.getConversationsByUser instead
export const getConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Delegate to the new conversations system
    return await ctx.runQuery(api.conversations.getConversationsByUser, {
      userId: args.userId,
    });
  },
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.recipientId !== currentUser._id) {
      throw new Error("Unauthorized: not the message recipient");
    }
    await ctx.db.patch(args.messageId, { read: true });
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    if (currentUser._id !== args.userId) {
      throw new Error("Unauthorized: cannot view another user's unread count");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.userId))
      .collect();

    return messages.filter((message) => !message.read).length;
  },
});

export const markConversationAsRead = mutation({
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    if (currentUser._id !== args.userId) {
      throw new Error("Unauthorized: cannot mark another user's messages as read");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("recipientId"), args.userId),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    // Mark all unread messages as read
    for (const message of messages) {
      await ctx.db.patch(message._id, { read: true });
    }

    return messages.length;
  },
});
