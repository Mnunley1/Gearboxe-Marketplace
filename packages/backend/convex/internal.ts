// Internal queries and mutations that can be called from actions
import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getEventById = internalQuery({
  args: { id: v.id("events") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getVehicleById = internalQuery({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.id);
    if (!vehicle) return null;
    // Note: Photo URLs would need to be resolved here if needed
    return vehicle;
  },
});

export const getUserById = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getRegistrationById = internalQuery({
  args: { id: v.id("registrations") },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.id);
    if (!registration) return null;
    
    const vehicle = await ctx.db.get(registration.vehicleId);
    const event = await ctx.db.get(registration.eventId);
    const user = await ctx.db.get(registration.userId);
    
    return {
      registration,
      vehicle,
      event,
      user,
    };
  },
});
