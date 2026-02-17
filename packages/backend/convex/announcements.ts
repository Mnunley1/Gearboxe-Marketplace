import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireOrgAdmin } from "./users";

const resend = new Resend(components.resend, {
  testMode: process.env.NODE_ENV !== "production",
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { user, orgId } = await requireOrgAdmin(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event || event.clerkOrgId !== orgId) {
      throw new Error("Event does not belong to your organization");
    }

    const announcementId = await ctx.db.insert("eventAnnouncements", {
      clerkOrgId: orgId,
      eventId: args.eventId,
      authorId: user._id,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    });

    // Schedule email fan-out
    await ctx.scheduler.runAfter(0, internal.announcements.sendEmails, {
      announcementId,
    });

    return announcementId;
  },
});

export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrgAdmin(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event || event.clerkOrgId !== orgId) {
      throw new Error("Event does not belong to your organization");
    }

    const announcements = await ctx.db
      .query("eventAnnouncements")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Sort desc by createdAt
    announcements.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      announcements.map(async (ann) => {
        const author = await ctx.db.get(ann.authorId);
        return {
          ...ann,
          authorName: author?.name ?? "Unknown",
        };
      })
    );
  },
});

export const getForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Get user's completed registrations
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const completedRegs = registrations.filter(
      (r) => r.paymentStatus === "completed"
    );

    const eventIds = [...new Set(completedRegs.map((r) => r.eventId))];

    // Get announcements for all registered events
    const allAnnouncements = [];
    for (const eventId of eventIds) {
      const announcements = await ctx.db
        .query("eventAnnouncements")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();

      const event = await ctx.db.get(eventId);

      for (const ann of announcements) {
        const readRecord = await ctx.db
          .query("announcementReads")
          .withIndex("by_user_announcement", (q) =>
            q.eq("userId", user._id).eq("announcementId", ann._id)
          )
          .first();

        allAnnouncements.push({
          ...ann,
          eventName: event?.name ?? "Unknown Event",
          isRead: !!readRecord,
        });
      }
    }

    // Sort desc by createdAt
    allAnnouncements.sort((a, b) => b.createdAt - a.createdAt);

    return allAnnouncements;
  },
});

export const markRead = mutation({
  args: { announcementId: v.id("eventAnnouncements") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Idempotent: check if already read
    const existing = await ctx.db
      .query("announcementReads")
      .withIndex("by_user_announcement", (q) =>
        q.eq("userId", user._id).eq("announcementId", args.announcementId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("announcementReads", {
      userId: user._id,
      announcementId: args.announcementId,
      createdAt: Date.now(),
    });
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const completedRegs = registrations.filter(
      (r) => r.paymentStatus === "completed"
    );

    const eventIds = [...new Set(completedRegs.map((r) => r.eventId))];

    let unread = 0;
    for (const eventId of eventIds) {
      const announcements = await ctx.db
        .query("eventAnnouncements")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();

      for (const ann of announcements) {
        const readRecord = await ctx.db
          .query("announcementReads")
          .withIndex("by_user_announcement", (q) =>
            q.eq("userId", user._id).eq("announcementId", ann._id)
          )
          .first();

        if (!readRecord) unread++;
      }
    }

    return unread;
  },
});

export const sendEmails = internalMutation({
  args: { announcementId: v.id("eventAnnouncements") },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);
    if (!announcement) return;

    const event = await ctx.db.get(announcement.eventId);
    if (!event) return;

    // Get all completed registrations for this event
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", announcement.eventId))
      .collect();

    const completedRegs = registrations.filter(
      (r) => r.paymentStatus === "completed"
    );

    // Get unique user IDs
    const userIds = [...new Set(completedRegs.map((r) => r.userId))];

    for (const userId of userIds) {
      const user = await ctx.db.get(userId);
      if (!user?.email) continue;

      const eventDate = new Date(event.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://gearboxe.com";

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Announcement</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Announcement from ${event.name}</h1>
            </div>

            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${user.name},</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">${announcement.title}</h2>
                <p style="margin: 8px 0; white-space: pre-wrap;">${announcement.content}</p>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #667eea; margin-top: 0; font-size: 16px;">Event Details</h3>
                <p style="margin: 8px 0;"><strong>Event:</strong> ${event.name}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${eventDate}</p>
                <p style="margin: 8px 0;"><strong>Location:</strong> ${event.location}</p>
                <p style="margin: 8px 0;"><strong>Address:</strong> ${event.address}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${siteUrl}/myAccount/notifications" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View in Gearboxe Market</a>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Best regards,<br>
                The Gearboxe Market Team
              </p>
            </div>
          </body>
        </html>
      `;

      await resend.sendEmail(ctx, {
        from: process.env.RESEND_FROM_EMAIL || "noreply@gearboxe.com",
        to: user.email,
        subject: `${event.name}: ${announcement.title}`,
        html,
      });
    }
  },
});
