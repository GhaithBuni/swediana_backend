import mongoose, { Document, Schema } from "mongoose";

export interface ILockedDate extends Document {
  date: Date;
  createdAt: Date;
}

const lockedDateSchema = new Schema<ILockedDate>({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster date queries
lockedDateSchema.index({ date: 1 });

export const LockedDateCleaning = mongoose.model<ILockedDate>(
  "LockedDateCleaning",
  lockedDateSchema
);
