import mongoose, { Schema, Document } from "mongoose";

export interface IDiscountCode extends Document {
  code: string; // e.g., "SUMMER2024"
  type: "percentage" | "fixed";
  value: number; // percentage (0-100) or fixed amount in SEK
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  maxUses?: number; // null = unlimited
  usedCount: number;
  minPurchaseAmount?: number; // minimum order value required
  applicableServices?: string[]; // e.g., ["cleaning", "moving"]
  createdAt: Date;
  updatedAt: Date;
}

const DiscountCodeSchema = new Schema<IDiscountCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: Date,
    validUntil: Date,
    maxUses: Number,
    usedCount: {
      type: Number,
      default: 0,
    },
    minPurchaseAmount: {
      type: Number,
      min: 0,
    },
    applicableServices: [String],
  },
  { timestamps: true }
);

DiscountCodeSchema.index({ code: 1 });

const DiscountCodeModel =
  mongoose.models.DiscountCode ||
  mongoose.model<IDiscountCode>("DiscountCode", DiscountCodeSchema);

export default DiscountCodeModel;
