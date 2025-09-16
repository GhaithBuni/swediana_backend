import mongoose, { Document, Schema } from "mongoose";

const serivceOptionEnum = ["Ja", "Nej"];

export interface ICleaningBooking extends Document {
  size: number;
  postnummer: string;
  buildingType: string;
  floor: string;
  Access: string;
  parkingDistance: number;

  //Extra Serivces
  Persinner: Number;
  ExtraBadrum: "Ja" | "Nej";
  ExtraToalett: "Ja" | "Nej";
  inglassadDusch: "Ja" | "Nej";

  // Boking Deatiles
  name: string;
  email: string;
  telefon: string;
  date: string;
  presonalNumber: string;
  apartmentKeys: string;
  message: string;
}

const cleaningBookingSchema = new Schema<ICleaningBooking>({
  size: { type: Number, required: true },
  postnummer: { type: String, required: true },
  buildingType: { type: String, required: true },
  floor: { type: String, required: true },
  Access: { type: String, required: true },
  parkingDistance: { type: Number, required: true },
  Persinner: { type: Number, default: 0 },
  ExtraBadrum: { type: String, enum: serivceOptionEnum, default: "Nej" },
  ExtraToalett: { type: String, enum: serivceOptionEnum, default: "Nej" },
  inglassadDusch: { type: String, enum: serivceOptionEnum, default: "Nej" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  telefon: { type: String, required: true },
  date: { type: String, required: true },
  presonalNumber: { type: String, required: true },
  apartmentKeys: { type: String, required: true },
  message: { type: String, required: true },
});

const cleaningModel = mongoose.model<ICleaningBooking>(
  "Cleaning Booking",
  cleaningBookingSchema
);

export default cleaningModel;
