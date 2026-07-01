/**
 * Database connection entrypoint.
 * Acctrise now uses MongoDB Atlas via Mongoose.
 */

export { connectMongo as connectDatabase } from "@/lib/mongodb";
export { connectMongo as default } from "@/lib/mongodb";
