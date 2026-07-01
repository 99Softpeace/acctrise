import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";
import { userRoles, userStatuses } from "@/types/auth";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, maxlength: 30 },
    passwordHash: { type: String, required: true },
    firstName: { type: String, trim: true, maxlength: 80 },
    lastName: { type: String, trim: true, maxlength: 80 },
    role: { type: String, enum: userRoles, default: "CUSTOMER", required: true },
    status: { type: String, enum: userStatuses, default: "active", required: true },
    emailVerified: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
    lastPasswordChangeAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };
export const User = (models.User || model("User", userSchema)) as Model<UserDocument>;
