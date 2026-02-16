import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireOrgAdmin } from "./users";

export const createEvent = mutation({
  args: {
    cityId: v.id("cities"),
    name: v.string(),
    date: v.number(),
    location: v.string(),
    address: v.string(),
    capacity: v.number(),
    description: v.string(),
    vendorPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const { cityId } = await requireOrgAdmin(ctx);
    if (cityId && args.cityId !== cityId) {
      throw new Error("Unauthorized: cannot create events for another city");
    }
    return await ctx.db.insert("events", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getEvents = query({
  args: {
    cityId: v.optional(v.id("cities")),
    upcoming: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("events");

    if (args.cityId) {
      query = query.withIndex("by_city", (q) => q.eq("cityId", args.cityId));
    }

    const events = await query.collect();

    if (args.upcoming) {
      const now = Date.now();
      return events.filter((event) => event.date > now);
    }

    return events;
  },
});

export const getEventById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getUpcomingEvents = query({
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_date", (q) => q.gt("date", now))
      .collect();

    // Get capacity info for each event (count completed + non-expired pending)
    const PENDING_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

    return await Promise.all(
      events.map(async (event) => {
        const allRegistrations = await ctx.db
          .query("registrations")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        // Count active registrations (completed + non-expired pending)
        const activeRegistrations = allRegistrations.filter((reg) => {
          if (reg.paymentStatus === "completed") {
            return true;
          }
          if (reg.paymentStatus === "pending") {
            if (reg.expiresAt && reg.expiresAt > now) {
              return true;
            }
            if (!reg.expiresAt && reg.createdAt > now - PENDING_EXPIRY_MS) {
              return true;
            }
          }
          return false;
        });

        const completedCount = allRegistrations.filter(
          (reg) => reg.paymentStatus === "completed"
        ).length;

        return {
          ...event,
          registered: completedCount,
          reserved: activeRegistrations.length - completedCount, // Pending reservations
          available: event.capacity - activeRegistrations.length,
          isFull: activeRegistrations.length >= event.capacity,
        };
      })
    );
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
    date: v.optional(v.number()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    capacity: v.optional(v.number()),
    description: v.optional(v.string()),
    vendorPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { cityId } = await requireOrgAdmin(ctx);
    if (cityId) {
      const event = await ctx.db.get(args.id);
      if (!event || event.cityId !== cityId) {
        throw new Error("Unauthorized: event does not belong to your city");
      }
    }
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const getEventCapacity = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const now = Date.now();
    const PENDING_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

    const allRegistrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Count active registrations (completed + non-expired pending)
    const activeRegistrations = allRegistrations.filter((reg) => {
      if (reg.paymentStatus === "completed") {
        return true;
      }
      if (reg.paymentStatus === "pending") {
        if (reg.expiresAt && reg.expiresAt > now) {
          return true;
        }
        if (!reg.expiresAt && reg.createdAt > now - PENDING_EXPIRY_MS) {
          return true;
        }
      }
      return false;
    });

    const completedCount = allRegistrations.filter(
      (reg) => reg.paymentStatus === "completed"
    ).length;

    return {
      capacity: event.capacity,
      registered: completedCount,
      reserved: activeRegistrations.length - completedCount, // Pending reservations
      available: event.capacity - activeRegistrations.length,
      isFull: activeRegistrations.length >= event.capacity,
    };
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const { cityId } = await requireOrgAdmin(ctx);
    if (cityId) {
      const event = await ctx.db.get(args.id);
      if (!event || event.cityId !== cityId) {
        throw new Error("Unauthorized: event does not belong to your city");
      }
    }
    await ctx.db.delete(args.id);
  },
});

// One-off backfill: adds vendorPrice to existing events missing it.
// Run via dashboard: npx convex run --no-push events:backfillVendorPrice
export const backfillVendorPrice = internalMutation({
  args: { defaultPrice: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const defaultPrice = args.defaultPrice ?? 50;
    const events = await ctx.db.query("events").collect();
    let patched = 0;
    for (const event of events) {
      if ((event as Record<string, unknown>).vendorPrice === undefined) {
        await ctx.db.patch(event._id, { vendorPrice: defaultPrice });
        patched++;
      }
    }
    return { patched };
  },
});
