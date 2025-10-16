import ByggBookingModel from "../models/byggBooking";
import { ByggBookingParams } from "../types/ByggBookingParams";

export const getByggBooking = async () => {
  return await ByggBookingModel.find();
};
interface GetParams {
  id: string;
}
export const getByggBookingid = async ({ id }: GetParams) => {
  return await ByggBookingModel.findById(id);
};

export const addByggBooking = async (
  params: ByggBookingParams
): Promise<{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}> => {
  try {
    const when = new Date(params.date);
    if (isNaN(when.getTime())) {
      return { success: false, message: "Invalid date" };
    }

    const normalizedEmail = String(params.email).trim().toLowerCase();

    // Optional duplicate rule: same email + exact date
    const dup = await ByggBookingModel.findOne({
      email: normalizedEmail,
      date: when,
    });
    if (dup) {
      return {
        success: false,
        message: "You already have a cleaning booking for this date.",
      };
    }

    const doc = new ByggBookingModel({
      size: params.size,
      address: {
        postcode: params.postcode,
        homeType: params.homeType,
        floor: params.floor,
        access: params.Access,
        parkingDistance: params.parkingDistance,
      },

      // extras (keep exact schema field names)
      Persienner: Number(params.Persienner ?? 0),
      badrum: params.badrum ?? "NEJ",
      toalett: params.toalett ?? "NEJ",
      Inglasadduschhörna: params.Inglasadduschhörna ?? "NEJ",

      // customer
      name: params.name,
      email: normalizedEmail,
      phone: params.phone ?? "",
      personalNumber: params.personalNumber ?? "",
      message: params.message ?? "",

      // schedule
      date: when,

      // optional snapshot (already computed on client)
      priceDetails: params.priceDetails,

      status: "pending",
    });

    const saved = await doc.save();
    return { success: true, data: saved };
  } catch (error: any) {
    console.error("Error saving cleaning booking:", error);
    console.log(params.postcode);
    return {
      success: false,
      message: "Something went wrong",
      error: error.message,
    };
  }
};

export const deleteBooking = async ({ id }: { id: string }) => {
  try {
    const result = await ByggBookingModel.findByIdAndDelete(id);

    if (!result) {
      return { message: "Bokning hittades inte", statusCode: 404 };
    }

    return { message: "Bokning raderad", statusCode: 200 };
  } catch (err: any) {
    console.error("Error in deleteBooking:", err);
    return { message: "Något gick fel", statusCode: 500 };
  }
};
