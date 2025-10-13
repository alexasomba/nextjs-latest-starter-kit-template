import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { withCloudflare } from "better-auth-cloudflare";
import { anonymous, openAPI } from "better-auth/plugins";
import { getDb } from "../db";
// Cloudflare Worker runtime types (available via wrangler typegen)

// Define an asynchronous function to build your auth configuration
async function authBuilder() {
  const dbInstance = await getDb();
  const { env, cf } = getCloudflareContext();
  return betterAuth(
    withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf,
        d1: {
          db: dbInstance,
          options: {
            usePlural: false, // Optional: Use plural table names (e.g., "users" instead of "user")
            debugLogs: true, // Optional
          },
        },
        // Cloudflare KV binding (declared in wrangler.jsonc and typegen'd into cloudflare-env.d.ts)
        kv: env.KV,
        // R2 configuration for file storage (R2_BUCKET binding from wrangler.toml)
        r2: {
          bucket: env.R2_BUCKET,
          maxFileSize: 2 * 1024 * 1024, // 2MB
          allowedTypes: [".jpg", ".jpeg", ".png", ".gif"],
          additionalFields: {
            category: { type: "string", required: false },
            isPublic: { type: "boolean", required: false },
            description: { type: "string", required: false },
          },
          hooks: {
            upload: {
              before: async (_file, ctx) => {
                // Only allow authenticated users to upload files
                if (ctx.session === null) {
                  return null; // Blocks upload
                }

                // Only allow paid users to upload files (for example)
                const isPaidUser = (_userId: string) => true; // example
                if (isPaidUser(ctx.session.user.id) === false) {
                  return null; // Blocks upload
                }

                // Allow upload
              },
              after: async (file, _ctx) => {
                // Track your analytics (for example)
                console.log("File uploaded:", file);
              },
            },
            download: {
              before: async (file, ctx) => {
                // Only allow user to access their own files (by default all files are public)
                if (
                  file.isPublic === false &&
                  file.userId !== ctx.session?.user.id
                ) {
                  return null; // Blocks download
                }
                // Allow download
              },
            },
          },
        },
      },
      // Your core Better Auth configuration (see Better Auth docs for all options)
      {
        rateLimit: {
          // Enable rate limiting only when KV is available to avoid 500s in local dev
          enabled: Boolean(env?.KV),
          // ... other rate limiting options
        },
        plugins: [openAPI(), anonymous()],
        // ... other Better Auth options
      },
    ),
  );
}

// Singleton pattern to ensure a single auth instance
let authInstance: Awaited<ReturnType<typeof authBuilder>> | null = null;

// Asynchronously initializes and retrieves the shared auth instance
export async function initAuth() {
  if (!authInstance) {
    authInstance = await authBuilder();
  }
  return authInstance;
}

/* ======================================================================= */
/* Configuration for Schema Generation                                     */
/* ======================================================================= */

// This simplified configuration is used by the Better Auth CLI for schema generation.
// It includes only the options that affect the database schema.
// It's necessary because the main `authBuilder` performs operations (like `getDb()`)
// which use `getCloudflareContext` (not available in a CLI context only on Cloudflare).
// For more details, see: https://www.answeroverflow.com/m/1362463260636479488
export const auth = betterAuth({
  ...withCloudflare(
    {
      autoDetectIpAddress: true,
      geolocationTracking: true,
      cf: {},
      // R2 configuration for schema generation
      r2: {
        bucket: null as unknown as R2Bucket, // Mock bucket for schema generation (types only)
        additionalFields: {
          category: { type: "string", required: false },
          isPublic: { type: "boolean", required: false },
          description: { type: "string", required: false },
        },
      },
      // No actual database or KV instance is needed here, only schema-affecting options
    },
    {
      // Include only configurations that influence the Drizzle schema,
      // e.g., if certain features add tables or columns.
      // socialProviders: { /* ... */ } // If they add specific tables/columns
      plugins: [openAPI(), anonymous()],
    },
  ),

  // Used by the Better Auth CLI for schema generation.
  database: drizzleAdapter(process.env.DATABASE as unknown as D1Database, {
    // Added 'as any' to handle potential undefined process.env.DATABASE
    provider: "sqlite",
    usePlural: false,
    debugLogs: true,
  }),
});
