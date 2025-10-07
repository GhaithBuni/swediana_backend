import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password: string;
}

const adminSchema = new Schema<IAdmin>({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const adminModel = mongoose.model<IAdmin>("admin", adminSchema);

export default adminModel;
