import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const tokenBase = {
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  usedAt: { type: Date, default: null }
};

const emailVerificationTokenSchema = new Schema(tokenBase, { timestamps: true });
const passwordResetTokenSchema = new Schema(tokenBase, { timestamps: true });

export type EmailVerificationTokenDocument = InferSchemaType<typeof emailVerificationTokenSchema> & { _id: Types.ObjectId };
export type PasswordResetTokenDocument = InferSchemaType<typeof passwordResetTokenSchema> & { _id: Types.ObjectId };

export const EmailVerificationToken = (
  models.EmailVerificationToken || model("EmailVerificationToken", emailVerificationTokenSchema)
) as Model<EmailVerificationTokenDocument>;

export const PasswordResetToken = (
  models.PasswordResetToken || model("PasswordResetToken", passwordResetTokenSchema)
) as Model<PasswordResetTokenDocument>;
