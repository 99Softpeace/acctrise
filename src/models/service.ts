import mongoose, { type InferSchemaType, type Model, Types } from "mongoose";

const { Schema, model, models } = mongoose;

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: null },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    priceCents: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 1, min: 1 },
    maxOrder: { type: Number, default: null },
    stock: { type: Number, default: null },
    icon: { type: String, default: null },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type ServiceDocument = InferSchemaType<typeof serviceSchema> & { _id: Types.ObjectId };
export const Service = (models.Service || model("Service", serviceSchema)) as Model<ServiceDocument>;
