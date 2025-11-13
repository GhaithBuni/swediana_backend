import mongoose, { Document, Schema, Types } from "mongoose";

export interface Iforetagstad extends Document {
  _id: Types.ObjectId; // ✅ Explicitly define _id type
  name: string;
  kvm: string;
  adress: string;
  postalcode: string;
  city: string;
  email: string;
  message: string;
  phone: string;
  subject: string;
  createdAt: Date;
}

const foretagstadSchema = new Schema<Iforetagstad>({
  name: { type: String, required: true },
  kvm: { type: String, required: true },
  adress: { type: String, required: true },
  postalcode: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Foretagstad = mongoose.model<Iforetagstad>(
  "Foretagstad",
  foretagstadSchema
);
export default Foretagstad;
