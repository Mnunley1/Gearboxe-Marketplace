import { internalMutation } from "./_generated/server";

/**
 * One-off migration: backfills `clerkOrgId` on existing events from their
 * linked city's `clerkOrgId`. Run via dashboard once after deploying the
 * schema change, then this file can be removed.
 */
export const migrateEventsCityToOrg = internalMutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    let patched = 0;
    let skipped = 0;

    for (const event of events) {
      // Already migrated
      if ((event as any).clerkOrgId) {
        skipped++;
        continue;
      }

      const cityId = (event as any).cityId;
      if (!cityId) {
        skipped++;
        continue;
      }

      const city = await ctx.db.get(cityId);
      if (!(city && (city as any).clerkOrgId)) {
        skipped++;
        continue;
      }

      await ctx.db.patch(event._id, {
        clerkOrgId: (city as any).clerkOrgId,
      } as any);
      patched++;
    }

    return { patched, skipped };
  },
});
