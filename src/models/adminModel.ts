// models/adminModel.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId; // ✅ Explicitly define _id type
  username: string;
  password: string;
}

const adminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const adminModel = mongoose.model<IAdmin>("admin", adminSchema);
export default adminModel;
