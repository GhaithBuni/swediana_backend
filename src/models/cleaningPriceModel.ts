import mongoose, { Document, Schema } from "mongoose";
export interface IExtraServices extends Document {
  Persinner: number;
  ExtraBadrum: number;
  ExtraToalett: number;
  inglassadDusch: number;
}

export interface IPrice extends Document {
  pricePerKvm: number;
  fixedPrice: number;
  extraServices: IExtraServices[];
}

const extraServicesSchema = new Schema<IExtraServices>({
  Persinner: { type: Number, required: true },
  ExtraBadrum: { type: Number, required: true },
  ExtraToalett: { type: Number, required: true },
  inglassadDusch: { type: Number, required: true },
});
const priceSchema = new Schema<IPrice>(
  {
    pricePerKvm: { type: Number, required: true },
    fixedPrice: { type: Number, required: true },
    extraServices: { type: [extraServicesSchema], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

const cleanPriceModel = mongoose.model<IPrice>("CleanPrice", priceSchema);

export default cleanPriceModel;
