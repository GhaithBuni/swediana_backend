import mongoose, { Document, Schema } from "mongoose";

const serivceOptionEnum = ["Ja", "Nej"];

export interface ImovingBooking extends Document {
  size: number;
  postnummer: string;
  postNummerTo: string;
  buildingType: string;
  floor: string;
  Access: string;
  parkingDistance: number;
  //New Adress
  buildingTypeNew: string;
  floorNew: string;
  AccessNew: string;
  parkingDistanceNew: number;
  //Extra Serivces
  packaging: "Ja" | "Nej";
  mounting: "Ja" | "Nej";
  Disposal: "Ja" | "Nej";
  cleaningOption: "Ja" | "Nej";
  Storage: "Ja" | "Nej";
  whatToMove: string;
  // Boking Deatiles
  name: string;
  email: string;
  telefon: string;
  date: string;
  presonalNumber: string;
  apartmentKeys: string;
  message: string;
}

const movingBookingSchema = new Schema<ImovingBooking>({
  size: { type: Number, required: true },
  postnummer: { type: String, required: true },
  postNummerTo: { type: String, required: true },
  buildingType: { type: String, required: true },
  floor: { type: String, required: true },
  Access: { type: String, required: true },
  parkingDistance: { type: Number, required: true },
  buildingTypeNew: { type: String, required: true },
  floorNew: { type: String, required: true },
  AccessNew: { type: String, required: true },
  parkingDistanceNew: { type: Number, required: true },
  packaging: { type: String, enum: serivceOptionEnum, default: "Nej" },
  mounting: { type: String, enum: serivceOptionEnum, default: "Nej" },
  Disposal: { type: String, enum: serivceOptionEnum, default: "Nej" },
  cleaningOption: { type: String, enum: serivceOptionEnum, default: "Nej" },
  Storage: { type: String, enum: serivceOptionEnum, default: "Nej" },
  whatToMove: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  telefon: { type: String, required: true },
  date: { type: String, required: true },
  presonalNumber: { type: String, required: true },
  apartmentKeys: { type: String, required: true },
  message: { type: String, required: true },
});

const movingBookingModel = mongoose.model<ImovingBooking>(
  "Moving Booking",
  movingBookingSchema
);

export default movingBookingModel;
