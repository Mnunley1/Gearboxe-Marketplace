import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireOrgAdmin } from "./users";

/**
 * Create a pending registration before payment
 * This prevents orphaned vehicles and allows capacity checks
 * Includes expiration to prevent stale pending registrations from blocking capacity
 */
export const createPendingRegistration = mutation({
  args: {
    eventId: v.id("events"),
    vehicleId: v.id("vehicles"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    if (currentUser._id !== args.userId) {
      throw new Error(
        "Unauthorized: cannot register on behalf of another user"
      );
    }

    // Check if event exists and is upcoming
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const now = Date.now();
    if (event.date <= now) {
      throw new Error("Cannot register for past events");
    }

    // Check capacity - count BOTH completed AND non-expired pending registrations
    const PENDING_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

    const allRegistrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Count registrations that are either:
    // 1. Completed (always count)
    // 2. Pending and not expired (count as reserved)
    const activeRegistrations = allRegistrations.filter((reg) => {
      if (reg.paymentStatus === "completed") {
        return true;
      }
      if (reg.paymentStatus === "pending") {
        // Count pending registrations that haven't expired
        if (reg.expiresAt && reg.expiresAt > now) {
          return true;
        }
        // If no expiresAt, assume it's very recent (backward compatibility)
        if (!reg.expiresAt && reg.createdAt > now - PENDING_EXPIRY_MS) {
          return true;
        }
      }
      return false;
    });

    if (activeRegistrations.length >= event.capacity) {
      throw new Error("Event is full");
    }

    // Check for existing registration for this vehicle
    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .first();

    if (existing) {
      if (existing.paymentStatus === "completed") {
        throw new Error("Vehicle is already registered for this event");
      }
      // Update existing pending registration with new expiration
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes from now
      await ctx.db.patch(existing._id, {
        eventId: args.eventId,
        userId: args.userId,
        paymentStatus: "pending",
        expiresAt,
      });
      return existing._id;
    }

    // Create new pending registration with expiration (15 minutes to complete payment)
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    return await ctx.db.insert("registrations", {
      ...args,
      paymentStatus: "pending",
      checkedIn: false,
      expiresAt,
      createdAt: Date.now(),
    });
  },
});

/**
 * Complete registration after successful payment (called from webhook)
 */
export const completeRegistration = internalMutation({
  args: {
    registrationId: v.id("registrations"),
    stripePaymentId: v.string(),
    qrCodeData: v.string(),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    // Idempotency check - if already completed, return early
    if (registration.paymentStatus === "completed") {
      console.log(
        "Registration already completed, skipping:",
        args.registrationId
      );
      return registration._id;
    }

    // Update registration to completed (remove expiration)
    await ctx.db.patch(args.registrationId, {
      paymentStatus: "completed",
      stripePaymentId: args.stripePaymentId,
      qrCodeData: args.qrCodeData,
      expiresAt: undefined, // Clear expiration on completion
    });

    // Update vehicle payment status
    await ctx.db.patch(registration.vehicleId, {
      paymentStatus: "completed",
    });

    return args.registrationId;
  },
});

/**
 * Mark registration payment as failed
 */
export const failRegistration = internalMutation({
  args: {
    registrationId: v.id("registrations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.registrationId, {
      paymentStatus: "failed",
    });
  },
});

/**
 * Clean up expired pending registrations
 * This should be called periodically (e.g., via cron job)
 */
export const cleanupExpiredRegistrations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const PENDING_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

    // Find all pending registrations
    const pendingRegistrations = await ctx.db
      .query("registrations")
      .filter((q) => q.eq(q.field("paymentStatus"), "pending"))
      .collect();

    let cleaned = 0;
    for (const reg of pendingRegistrations) {
      const isExpired =
        (reg.expiresAt && reg.expiresAt <= now) ||
        (!reg.expiresAt && reg.createdAt <= now - PENDING_EXPIRY_MS);

      if (isExpired) {
        // Mark as failed and clear expiration
        await ctx.db.patch(reg._id, {
          paymentStatus: "failed",
          expiresAt: undefined,
        });
        cleaned++;
      }
    }

    return { cleaned, total: pendingRegistrations.length };
  },
});

/**
 * Resend confirmation email with QR code
 */
export const resendConfirmationEmail = mutation({
  args: {
    registrationId: v.id("registrations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    if (registration.userId !== currentUser._id) {
      throw new Error("Unauthorized: not the registration owner");
    }

    if (registration.paymentStatus !== "completed") {
      throw new Error("Cannot resend email for unpaid registration");
    }

    if (!registration.qrCodeData) {
      throw new Error("QR code not found for this registration");
    }

    // Schedule email send
    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendRegistrationConfirmationEmail,
      {
        registrationId: args.registrationId,
        qrCodeData: registration.qrCodeData,
      }
    );

    return { success: true };
  },
});

export const getRegistrationsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { cityId } = await requireOrgAdmin(ctx);
    if (cityId) {
      const event = await ctx.db.get(args.eventId);
      if (!event || event.cityId !== cityId) {
        throw new Error("Unauthorized: event does not belong to your city");
      }
    }
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return await Promise.all(
      registrations.map(async (reg) => {
        const vehicle = await ctx.db.get(reg.vehicleId);
        const user = await ctx.db.get(reg.userId);
        return {
          ...reg,
          vehicle,
          user,
        };
      })
    );
  },
});

export const getRegistrationsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    if (currentUser._id !== args.userId) {
      throw new Error("Unauthorized: cannot view another user's registrations");
    }
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch related data
    return await Promise.all(
      registrations.map(async (reg) => {
        const vehicle = await ctx.db.get(reg.vehicleId);
        const event = await ctx.db.get(reg.eventId);
        return {
          ...reg,
          vehicle,
          event,
        };
      })
    );
  },
});

export const getRegistrationById = query({
  args: { id: v.id("registrations") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const registration = await ctx.db.get(args.id);
    if (!registration) return null;

    if (
      registration.userId !== currentUser._id &&
      currentUser.role !== "admin" &&
      currentUser.role !== "superAdmin"
    ) {
      throw new Error("Unauthorized: not the registration owner or admin");
    }

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

export const getRegistrationByVehicle = query({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .first();

    if (!registration) {
      return null;
    }

    if (
      registration.userId !== currentUser._id &&
      currentUser.role !== "admin" &&
      currentUser.role !== "superAdmin"
    ) {
      throw new Error("Unauthorized: not the registration owner or admin");
    }

    const event = await ctx.db.get(registration.eventId);
    const user = await ctx.db.get(registration.userId);

    return {
      registration,
      event,
      user,
    };
  },
});

export const checkInRegistration = mutation({
  args: { id: v.id("registrations") },
  handler: async (ctx, args) => {
    const { user, cityId } = await requireOrgAdmin(ctx);
    const registration = await ctx.db.get(args.id);
    if (!registration) {
      throw new Error("Registration not found");
    }
    if (cityId) {
      const event = await ctx.db.get(registration.eventId);
      if (!event || event.cityId !== cityId) {
        throw new Error(
          "Unauthorized: registration does not belong to your city"
        );
      }
    }
    if (registration.paymentStatus !== "completed") {
      throw new Error("Cannot check in unpaid registration");
    }
    if (registration.checkedIn) {
      throw new Error("Registration is already checked in");
    }
    await ctx.db.patch(args.id, {
      checkedIn: true,
      checkedInAt: Date.now(),
      checkedInBy: user._id,
    });
  },
});

export const validateQRCode = query({
  args: { qrCodeData: v.string() },
  handler: async (ctx, args) => {
    const { cityId } = await requireOrgAdmin(ctx);
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_code", (q) => q.eq("qrCodeData", args.qrCodeData))
      .first();

    if (!registration) {
      return null;
    }

    if (registration.paymentStatus !== "completed") {
      return null;
    }

    const event = await ctx.db.get(registration.eventId);
    if (cityId && (!event || event.cityId !== cityId)) {
      return null;
    }

    const vehicle = await ctx.db.get(registration.vehicleId);
    const user = await ctx.db.get(registration.userId);

    return {
      registration,
      vehicle,
      event,
      user,
      alreadyCheckedIn: registration.checkedIn,
    };
  },
});

export const getCheckInSheetData = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { cityId } = await requireOrgAdmin(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    if (cityId && event.cityId !== cityId) {
      throw new Error("Unauthorized: event does not belong to your city");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const completedRegistrations = registrations.filter(
      (r) => r.paymentStatus === "completed"
    );

    const rows = await Promise.all(
      completedRegistrations.map(async (reg) => {
        const user = await ctx.db.get(reg.userId);
        const vehicle = await ctx.db.get(reg.vehicleId);
        return {
          sellerName: user?.name ?? "",
          sellerEmail: user?.email ?? "",
          sellerPhone: user?.phone ?? "",
          vehicleTitle: vehicle?.title ?? "",
          vehicleYear: vehicle?.year ?? 0,
          vehicleMake: vehicle?.make ?? "",
          vehicleModel: vehicle?.model ?? "",
          vin: vehicle?.vin ?? "",
          checkedIn: reg.checkedIn,
          qrCodeData: reg.qrCodeData ?? "",
        };
      })
    );

    return {
      eventName: event.name,
      eventDate: event.date,
      rows,
    };
  },
});
