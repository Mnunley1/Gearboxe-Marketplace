import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { R2 } from "@convex-dev/r2";

/**
 * Get R2 instance - initialized lazily
 * Note: R2 requires environment variables to be set in Convex:
 * - R2_TOKEN
 * - R2_ACCESS_KEY_ID
 * - R2_SECRET_ACCESS_KEY
 * - R2_ENDPOINT
 * - R2_BUCKET
 * 
 * Set them using: npx convex env set R2_TOKEN <value> etc.
 */
function getR2() {
  return new R2(components.r2);
}

// Lazy initialization - R2 instance is created when first accessed
let r2Instance: R2 | null = null;
function r2() {
  if (!r2Instance) {
    r2Instance = getR2();
  }
  return r2Instance;
}

/**
 * R2 client API for file uploads
 * This provides generateUploadUrl and syncMetadata mutations that work with the useUploadFile hook
 */
export const { generateUploadUrl, syncMetadata } = r2().clientApi({
  checkUpload: async (ctx) => {
    // Optional: Add authorization check here
    // const user = await getUser(ctx);
    // if (!user) throw new Error("Unauthorized");
  },
  onUpload: async (ctx, bucket, key) => {
    // Optional: Do something after upload completes
    // This runs in the syncMetadata mutation after metadata is synced
  },
});

/**
 * Get a URL for a file stored in R2
 * @param key - The R2 object key (string)
 * @param expiresIn - Optional expiration time in seconds (default: 900 = 15 minutes)
 */
export const getFileUrl = query({
  args: { 
    key: v.string(),
    expiresIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await r2().getUrl(args.key, {
      expiresIn: args.expiresIn,
    });
  },
});

/**
 * Get URLs for multiple files
 */
export const getFileUrls = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, args) => {
    const urls = await Promise.all(
      args.keys.map((key) => r2().getUrl(key))
    );
    return urls;
  },
});

/**
 * Delete a file from R2 storage
 */
export const deleteFile = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await r2().deleteObject(ctx, args.key);
  },
});

/**
 * Delete multiple files from R2 storage
 */
export const deleteFiles = mutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, args) => {
    await Promise.all(
      args.keys.map((key) => r2().deleteObject(ctx, key))
    );
  },
});

/**
 * Get file metadata
 */
export const getFileMetadata = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await r2().getMetadata(args.key);
  },
});

/**
 * List file metadata (with optional limit)
 */
export const listFileMetadata = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await r2().listMetadata(ctx, args.limit);
  },
});

/**
 * Clean up orphaned files that are not referenced by any vehicle
 * This should be called periodically (e.g., via a scheduled function or cron)
 */
export const cleanupOrphanedFiles = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all vehicles and collect all photo keys
    const vehicles = await ctx.db.query("vehicles").collect();
    const usedKeys = new Set<string>();
    
    for (const vehicle of vehicles) {
      for (const photoKey of vehicle.photos) {
        usedKeys.add(photoKey);
      }
    }

    // Get all file metadata from R2
    const allMetadata = await r2().listMetadata(ctx);
    
    // Find orphaned files (files in R2 but not referenced by any vehicle)
    const orphanedKeys = allMetadata
      .map((meta) => meta.key)
      .filter((key) => !usedKeys.has(key));

    // Delete orphaned files
    let deletedCount = 0;
    for (const key of orphanedKeys) {
      try {
        await r2().deleteObject(ctx, key);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete orphaned file ${key}:`, error);
      }
    }

    return {
      orphanedCount: orphanedKeys.length,
      deletedCount,
    };
  },
});
