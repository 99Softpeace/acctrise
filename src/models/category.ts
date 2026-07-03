import mongoose, { type InferSchemaType, type Model, Types } from "mongoose";

const { Schema, model, models } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export type CategoryDocument = InferSchemaType<typeof categorySchema> & { _id: Types.ObjectId };
export const Category = (models.Category || model("Category", categorySchema)) as Model<CategoryDocument>;
