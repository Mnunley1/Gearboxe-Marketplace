import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired pending registrations every 5 minutes
// This frees up capacity for users who didn't complete payment
crons.interval(
  "Cleanup expired pending registrations",
  { minutes: 5 },
  internal.registrations.cleanupExpiredRegistrations
);

export default crons;
