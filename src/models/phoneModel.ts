import mongoose, { Document, Schema } from "mongoose";

export interface IPhone extends Document {
  phone: string;
  service: string;
  createdAt: Date;
  status: "Har Ringt" | "Ska ringa upp" | "Ingen status";
}

const phoneSchema = new Schema<IPhone>({
  phone: { type: String, required: true },
  service: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Har Ringt", "Ska ringa upp", "Ingen status"],
    default: "Ingen status",
  },
});

const phoneModel = mongoose.model<IPhone>("phone", phoneSchema);

export default phoneModel;
