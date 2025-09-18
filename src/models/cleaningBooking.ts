// server/models/CleaningBooking.ts
import mongoose, { Schema, Document } from "mongoose";

const YES_NO = ["JA", "NEJ"] as const;
type YesNo = (typeof YES_NO)[number];

type HomeType = "lagenhet" | "Hus" | "forrad" | "kontor";
type Access = "stairs" | "elevator" | "large-elevator";

export interface ICleaningAddress {
  postcode: string;
  homeType: HomeType;
  floor: string; // "1".."10+"
  access: Access;
  parkingDistance: number;
}

export interface ICleaningBooking extends Document {
  // inputs
  size: number; // m²
  address: ICleaningAddress; // one address for cleaning
  // extras (fixed/qty)
  Persienner?: number; // quantity
  badrum?: YesNo;
  toalett?: YesNo;
  Inglasadduschhörna?: YesNo;

  // customer
  name: string;
  email: string;
  phone?: string;
  personalNumber?: string;
  message?: string;

  // schedule
  date: Date;

  // snapshot of the pricing UI
  priceDetails?: {
    lines: Array<{ key: string; label: string; amount: number; meta?: string }>;
    totals: {
      base: number;
      extras: number;
      grandTotal: number;
    };
  };

  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<ICleaningAddress>(
  {
    postcode: { type: String, required: true, trim: true },
    homeType: {
      type: String,
      enum: ["lagenhet", "Hus", "forrad", "kontor"],
      required: true,
    },
    floor: { type: String, required: true },
    access: {
      type: String,
      enum: ["stairs", "elevator", "large-elevator"],
      required: true,
    },
    parkingDistance: { type: Number, required: true },
  },
  { _id: false }
);

const CleaningBookingSchema = new Schema<ICleaningBooking>(
  {
    size: { type: Number, required: true },
    address: { type: AddressSchema, required: true },

    Persienner: { type: Number, default: 0 },
    badrum: { type: String, enum: YES_NO, default: "NEJ" },
    toalett: { type: String, enum: YES_NO, default: "NEJ" },
    Inglasadduschhörna: { type: String, enum: YES_NO, default: "NEJ" },

    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    personalNumber: { type: String, trim: true },
    message: { type: String, trim: true },

    date: { type: Date, required: true },

    priceDetails: {
      lines: [{ key: String, label: String, amount: Number, meta: String }],
      totals: {
        base: Number,
        extras: Number,
        grandTotal: Number,
      },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const CleaningBookingModel =
  mongoose.models.CleaningBooking ||
  mongoose.model<ICleaningBooking>("CleaningBooking", CleaningBookingSchema);

export default CleaningBookingModel;
