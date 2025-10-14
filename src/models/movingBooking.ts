import mongoose, { Schema, Document } from "mongoose";

const YES_NO = ["JA", "NEJ"] as const;
type YesNo = (typeof YES_NO)[number];

type Access = "stairs" | "elevator" | "large-elevator";
type HomeType = "lagenhet" | "Hus" | "forrad" | "kontor";

export interface IAddress {
  postcode: string;
  homeType: HomeType;
  floor: string;
  access: Access;
  parkingDistance: number;
}

/** ─── PRICE SNAPSHOT TYPES ───────────────────────────────────────────── */
export interface IPriceLine {
  key: string; // e.g. "packa", "cleaningBase", "clean-Persienner"
  label: string; // human label shown to the user
  amount: number; // line total in SEK
  meta?: string; // e.g. "2 × 150 kr" or "~ 1200 kr"
}

export interface IPriceTotals {
  movingBase: number;
  movingExtras: number;
  cleaningBaseAfterDiscount: number;
  cleaningExtras: number;
  grandTotal: number;
  currency?: "SEK";
}

export interface IPriceDetails {
  lines: IPriceLine[];
  totals: IPriceTotals;
}
/** ───────────────────────────────────────────────────────────────────── */

export interface IMovingBooking extends Document {
  bookingNumber: number;
  size: number; // m² or m³
  from: IAddress;
  to: IAddress;
  discountCode?: string; // the actual code used (e.g., "SUMMER2024")
  discountCodeId?: mongoose.Types.ObjectId; // reference to DiscountCode
  discountAmount?: number; // calculated discount amount applied
  // Extra services (simple JA/NEJ flags)
  packa: YesNo;
  packaKitchen: YesNo;
  montera: YesNo;
  flyttstad: YesNo;

  // Customer details
  name: string;
  email: string;
  phone: string;
  personalNumber?: string;
  apartmentKeys?: string;
  whatToMove?: string;
  message?: string;
  addressStreet: string;

  // Booking date/time
  date: Date;
  time: string;

  status: "pending" | "confirmed" | "cancelled";

  /** Price snapshot at booking time */
  priceDetails?: IPriceDetails;

  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
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

/** ─── PRICE SNAPSHOT SCHEMAS ─────────────────────────────────────────── */
const PriceLineSchema = new Schema<IPriceLine>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    meta: { type: String, trim: true },
  },
  { _id: false }
);

const PriceTotalsSchema = new Schema<IPriceTotals>(
  {
    movingBase: { type: Number, required: true, min: 0 },
    movingExtras: { type: Number, required: true, min: 0 },
    cleaningBaseAfterDiscount: { type: Number, required: true, min: 0 },
    cleaningExtras: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["SEK"], default: "SEK" },
  },
  { _id: false }
);

const PriceDetailsSchema = new Schema<IPriceDetails>(
  {
    lines: { type: [PriceLineSchema], default: [] },
    totals: { type: PriceTotalsSchema, required: true },
  },
  { _id: false }
);
/** ───────────────────────────────────────────────────────────────────── */

const MovingBookingSchema = new Schema<IMovingBooking>(
  {
    bookingNumber: { type: Number, unique: true },

    size: { type: Number, required: true },

    from: { type: AddressSchema, required: true },
    to: { type: AddressSchema, required: true },

    packa: { type: String, enum: YES_NO, default: "NEJ" },
    packaKitchen: { type: String, enum: YES_NO, default: "NEJ" },
    montera: { type: String, enum: YES_NO, default: "NEJ" },
    flyttstad: { type: String, enum: YES_NO, default: "NEJ" },

    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    personalNumber: { type: String, trim: true },
    apartmentKeys: { type: String, trim: true },
    whatToMove: { type: String, trim: true },
    message: { type: String, trim: true },
    addressStreet: { type: String, required: true },
    discountCode: { type: String, uppercase: true, trim: true },
    discountCodeId: { type: Schema.Types.ObjectId, ref: "DiscountCode" },
    discountAmount: { type: Number, default: 0 },

    date: { type: Date, required: true },
    time: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    /** Price snapshot */
    priceDetails: { type: PriceDetailsSchema, required: false },
  },
  { timestamps: true }
);

// Pre-save hook to auto-increment bookingNumber
MovingBookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Find the highest booking number
      const lastBooking = await mongoose
        .model<IMovingBooking>("MovingBooking")
        .findOne()
        .sort({ bookingNumber: -1 })
        .select("bookingNumber")
        .lean();

      // Set the next booking number
      this.bookingNumber = (lastBooking?.bookingNumber || 0) + 1;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

MovingBookingSchema.index({ bookingNumber: 1 });

const MovingBookingModel =
  mongoose.models.MovingBooking ||
  mongoose.model<IMovingBooking>("MovingBooking", MovingBookingSchema);

export default MovingBookingModel;
