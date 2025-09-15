import mongoose, { Document, Schema } from "mongoose";
export interface IExtraServices extends Document {
  packagingAllRooms: number;
  packagingKitchen: number;
  mounting: number;
}

export interface IPrice extends Document {
  pricePerKvm: number;
  travelFee: number;
  fixedPrice: number;
  extraServices: IExtraServices[];
}

const extraServicesSchema = new Schema<IExtraServices>({
  packagingAllRooms: { type: Number, required: true },
  packagingKitchen: { type: Number, required: true },
  mounting: { type: Number, required: true },
});
const priceSchema = new Schema<IPrice>(
  {
    pricePerKvm: { type: Number, required: true },
    travelFee: { type: Number, required: true },
    fixedPrice: { type: Number, required: true },
    extraServices: { type: [extraServicesSchema], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

const priceModel = mongoose.model<IPrice>("price", priceSchema);

export default priceModel;
