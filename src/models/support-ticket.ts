import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const supportTicketSchema = new Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], default: "OPEN", index: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
    category: { type: String, default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    tags: { type: [String], default: [] },
    lastActivityAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export type SupportTicketDocument = InferSchemaType<typeof supportTicketSchema> & { _id: Types.ObjectId };
export const SupportTicket = (
  models.SupportTicket || model("SupportTicket", supportTicketSchema)
) as Model<SupportTicketDocument>;
