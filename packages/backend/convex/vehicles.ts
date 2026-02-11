import { R2 } from "@convex-dev/r2";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import {
  getCurrentUser,
  getCurrentUserOrThrow,
  requireAdmin,
  requireOrgAdmin,
} from "./users";

// Initialize R2 component client
const r2 = new R2(components.r2);

/**
 * Helper function to get photo URLs for a vehicle
 * @param photoKeys - Array of R2 object keys (strings)
 */
async function getPhotoUrls(photoKeys: string[]) {
  if (photoKeys.length === 0) return [];

  return await Promise.all(photoKeys.map((key) => r2.getUrl(key)));
}

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
    const currentUser = await getCurrentUserOrThrow(ctx);

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
      userId: currentUser._id,
      status: "pending",
      saleStatus: "available",
      createdAt: Date.now(),
    });
  },
});

export const getVehicles = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("price_asc"),
        v.literal("price_desc"),
        v.literal("year_desc"),
        v.literal("year_asc"),
        v.literal("mileage_asc"),
        v.literal("mileage_desc"),
        v.literal("newest"),
        v.literal("oldest")
      )
    ),
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
    minMileage: v.optional(v.number()),
    maxMileage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("vehicles");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    const vehicles = await query.collect();

    // Apply filters
    const filtered = vehicles.filter((vehicle) => {
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
      if (args.minMileage && vehicle.mileage < args.minMileage) {
        return false;
      }
      if (args.maxMileage && vehicle.mileage > args.maxMileage) {
        return false;
      }
      return true;
    });

    // Apply sorting
    if (args.sortBy) {
      filtered.sort((a, b) => {
        switch (args.sortBy) {
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "year_desc":
            return b.year - a.year;
          case "year_asc":
            return a.year - b.year;
          case "mileage_asc":
            return a.mileage - b.mileage;
          case "mileage_desc":
            return b.mileage - a.mileage;
          case "newest":
            return (b.createdAt || 0) - (a.createdAt || 0);
          case "oldest":
            return (a.createdAt || 0) - (b.createdAt || 0);
          default:
            return 0;
        }
      });
    } else {
      // Default sort: newest first
      filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    // Apply pagination
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 24;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedVehicles = filtered.slice(startIndex, endIndex);

    // Resolve photo URLs for paginated vehicles
    const vehiclesWithPhotos = await Promise.all(
      paginatedVehicles.map(async (vehicle) => {
        const photoUrls = await getPhotoUrls(vehicle.photos);
        return {
          ...vehicle,
          photoUrls,
        };
      })
    );

    return {
      vehicles: vehiclesWithPhotos,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },
});

export const getVehicleById = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.id);
    if (!vehicle) return null;

    const photoUrls = await getPhotoUrls(vehicle.photos);
    return {
      ...vehicle,
      photoUrls,
    };
  },
});

export const getVehiclesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    if (
      currentUser._id !== args.userId &&
      currentUser.role !== "admin" &&
      currentUser.role !== "superAdmin"
    ) {
      throw new Error("Unauthorized: cannot view another user's vehicles");
    }
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch event data and photo URLs for each vehicle
    const vehiclesWithEvents = await Promise.all(
      vehicles.map(async (vehicle) => {
        const event = await ctx.db.get(vehicle.eventId);
        const photoUrls = await getPhotoUrls(vehicle.photos);
        return {
          ...vehicle,
          event,
          photoUrls,
        };
      })
    );

    return vehiclesWithEvents;
  },
});

export const getVehiclesByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const isAdmin =
      currentUser?.role === "admin" || currentUser?.role === "superAdmin";

    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Non-admins only see approved vehicles
    const filtered = isAdmin
      ? vehicles
      : vehicles.filter((v) => v.status === "approved");

    // Resolve photo URLs for all vehicles
    const vehiclesWithPhotos = await Promise.all(
      filtered.map(async (vehicle) => {
        const photoUrls = await getPhotoUrls(vehicle.photos);
        return {
          ...vehicle,
          photoUrls,
        };
      })
    );

    return vehiclesWithPhotos;
  },
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
    photos: v.optional(v.array(v.id("_storage"))),
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
    const currentUser = await getCurrentUserOrThrow(ctx);
    const { id, eventId, ...updates } = args;

    // Verify ownership or admin
    const existingVehicle = await ctx.db.get(id);
    if (!existingVehicle) {
      throw new Error("Vehicle not found");
    }
    if (
      existingVehicle.userId !== currentUser._id &&
      currentUser.role !== "admin" &&
      currentUser.role !== "superAdmin"
    ) {
      throw new Error("Unauthorized: not vehicle owner or admin");
    }

    // If photos are being updated, clean up old photos that are no longer referenced
    if (updates.photos !== undefined) {
      const vehicle = await ctx.db.get(id);
      if (vehicle) {
        const oldPhotos = vehicle.photos || [];
        const newPhotos = updates.photos;
        const photosToDelete = oldPhotos.filter(
          (photoId) => !newPhotos.includes(photoId)
        );

        // Delete orphaned photos
        for (const photoKey of photosToDelete) {
          try {
            await r2.deleteObject(ctx, photoKey);
          } catch (error) {
            console.error(`Failed to delete photo ${photoKey}:`, error);
            // Continue even if deletion fails
          }
        }
      }
    }

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
    const currentUser = await getCurrentUserOrThrow(ctx);
    const vehicle = await ctx.db.get(args.id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    if (
      vehicle.userId !== currentUser._id &&
      currentUser.role !== "admin" &&
      currentUser.role !== "superAdmin"
    ) {
      throw new Error("Unauthorized: not vehicle owner or admin");
    }
    await ctx.db.patch(args.id, { saleStatus: args.saleStatus });
  },
});

export const deleteVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const vehicle = await ctx.db.get(args.id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    if (
      vehicle.userId !== currentUser._id &&
      currentUser.role !== "admin" &&
      currentUser.role !== "superAdmin"
    ) {
      throw new Error("Unauthorized: not vehicle owner or admin");
    }

    // Delete all associated photos
    for (const photoKey of vehicle.photos) {
      try {
        await r2.deleteObject(ctx, photoKey);
      } catch (error) {
        console.error(`Failed to delete photo ${photoKey}:`, error);
        // Continue even if deletion fails
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const approveVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const { cityId, isSuperAdmin } = await requireOrgAdmin(ctx);
    if (!isSuperAdmin && cityId) {
      const vehicle = await ctx.db.get(args.id);
      if (!vehicle?.eventId) {
        throw new Error("Vehicle has no associated event");
      }
      const event = await ctx.db.get(vehicle.eventId);
      if (!event || event.cityId !== cityId) {
        throw new Error("Unauthorized: vehicle does not belong to your city");
      }
    }
    await ctx.db.patch(args.id, { status: "approved" });
  },
});

export const rejectVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const { cityId, isSuperAdmin } = await requireOrgAdmin(ctx);
    if (!isSuperAdmin && cityId) {
      const vehicle = await ctx.db.get(args.id);
      if (!vehicle?.eventId) {
        throw new Error("Vehicle has no associated event");
      }
      const event = await ctx.db.get(vehicle.eventId);
      if (!event || event.cityId !== cityId) {
        throw new Error("Unauthorized: vehicle does not belong to your city");
      }
    }
    await ctx.db.patch(args.id, { status: "rejected" });
  },
});

/**
 * Migration function to fix vehicles with URL strings in photos array
 * This should be run once to clean up existing data
 */
export const migrateVehiclePhotos = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const vehicles = await ctx.db.query("vehicles").collect();
    let fixed = 0;

    for (const vehicle of vehicles) {
      // Check if photos array contains any strings (URLs) instead of storage IDs
      const hasInvalidPhotos = vehicle.photos.some(
        (photo: any) => typeof photo === "string" && photo.startsWith("http")
      );

      if (hasInvalidPhotos) {
        // Replace URLs with empty array (or filter out URLs)
        const validPhotos = vehicle.photos.filter(
          (photo: any) =>
            !(typeof photo === "string" && photo.startsWith("http"))
        ) as any[];

        await ctx.db.patch(vehicle._id, {
          photos: validPhotos,
        });
        fixed++;
      }
    }

    return { fixed, total: vehicles.length };
  },
});
