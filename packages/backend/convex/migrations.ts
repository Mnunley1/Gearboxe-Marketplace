import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireSuperAdmin } from "./users";

export const linkCityToOrg = mutation({
  args: {
    cityId: v.id("cities"),
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const city = await ctx.db.get(args.cityId);
    if (!city) {
      throw new Error("City not found");
    }

    const existing = await ctx.db
      .query("cities")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
    if (existing && existing._id !== args.cityId) {
      throw new Error(
        `Clerk org ${args.clerkOrgId} is already linked to city "${existing.name}"`
      );
    }

    await ctx.db.patch(args.cityId, { clerkOrgId: args.clerkOrgId });
    return { success: true, cityName: city.name };
  },
});
