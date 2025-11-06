import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createVehicle = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
    title: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    mileage: v.number(),
    price: v.number(),
    vin: v.optional(v.string()),
    photos: v.array(v.string()),
    description: v.string(),
    contactInfo: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate that the event exists and is upcoming
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const now = Date.now();
    if (event.date <= now) {
      throw new Error("Vehicle must be associated with an upcoming event");
    }

    return await ctx.db.insert("vehicles", {
      ...args,
      status: "pending",
      saleStatus: "available",
      createdAt: Date.now(),
    });
  },
});

export const getVehicles = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minYear: v.optional(v.number()),
    maxYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("vehicles");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    const vehicles = await query.collect();

    return vehicles.filter((vehicle) => {
      if (args.make && vehicle.make.toLowerCase() !== args.make.toLowerCase()) {
        return false;
      }
      if (
        args.model &&
        vehicle.model.toLowerCase() !== args.model.toLowerCase()
      ) {
        return false;
      }
      if (args.minPrice && vehicle.price < args.minPrice) {
        return false;
      }
      if (args.maxPrice && vehicle.price > args.maxPrice) {
        return false;
      }
      if (args.minYear && vehicle.year < args.minYear) {
        return false;
      }
      if (args.maxYear && vehicle.year > args.maxYear) {
        return false;
      }
      return true;
    });
  },
});

export const getVehicleById = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getVehiclesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch event data for each vehicle
    const vehiclesWithEvents = await Promise.all(
      vehicles.map(async (vehicle) => {
        const event = await ctx.db.get(vehicle.eventId);
        return {
          ...vehicle,
          event,
        };
      })
    );

    return vehiclesWithEvents;
  },
});

export const getVehiclesByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("vehicles")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect(),
});

export const updateVehicle = mutation({
  args: {
    id: v.id("vehicles"),
    eventId: v.optional(v.id("events")),
    title: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    mileage: v.optional(v.number()),
    price: v.optional(v.number()),
    vin: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
    saleStatus: v.optional(
      v.union(
        v.literal("available"),
        v.literal("salePending"),
        v.literal("sold")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, eventId, ...updates } = args;

    // If eventId is being updated, validate it's an upcoming event
    if (eventId !== undefined) {
      const event = await ctx.db.get(eventId);
      if (!event) {
        throw new Error("Event not found");
      }
      const now = Date.now();
      if (event.date <= now) {
        throw new Error("Vehicle must be associated with an upcoming event");
      }
      updates.eventId = eventId;
    }

    await ctx.db.patch(id, updates);
  },
});

export const updateSaleStatus = mutation({
  args: {
    id: v.id("vehicles"),
    saleStatus: v.union(
      v.literal("available"),
      v.literal("salePending"),
      v.literal("sold")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { saleStatus: args.saleStatus });
  },
});

export const deleteVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const approveVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "approved" });
  },
});

export const rejectVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "rejected" });
  },
});
