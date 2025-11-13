import mongoose, { Document, Schema, Types } from "mongoose";

export interface IContact extends Document {
  _id: Types.ObjectId; // ✅ Explicitly define _id type
  name: string;
  email: string;
  message: string;
  phone: string;
  subject: string;
  createdAt: Date;
}

const contactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model<IContact>("Contact", contactSchema);

export default Contact;
