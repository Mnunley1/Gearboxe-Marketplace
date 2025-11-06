import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const trackView = mutation({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    // Check if analytics record exists
    const existing = await ctx.db
      .query("vehicleAnalytics")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .first();

    if (existing) {
      // Increment views count
      await ctx.db.patch(existing._id, {
        views: existing.views + 1,
      });
    } else {
      // Create new analytics record
      await ctx.db.insert("vehicleAnalytics", {
        vehicleId: args.vehicleId,
        views: 1,
        shares: 0,
      });
    }
  },
});

export const trackShare = mutation({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    // Check if analytics record exists
    const existing = await ctx.db
      .query("vehicleAnalytics")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .first();

    if (existing) {
      // Increment shares count
      await ctx.db.patch(existing._id, {
        shares: existing.shares + 1,
      });
    } else {
      // Create new analytics record
      await ctx.db.insert("vehicleAnalytics", {
        vehicleId: args.vehicleId,
        views: 0,
        shares: 1,
      });
    }
  },
});

export const getVehicleAnalytics = query({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    // Get analytics record
    const analytics = await ctx.db
      .query("vehicleAnalytics")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .first();

    // Count favorites for this vehicle
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();

    return {
      views: analytics?.views ?? 0,
      shares: analytics?.shares ?? 0,
      favorites: favorites.length,
    };
  },
});

