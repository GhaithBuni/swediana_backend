import cleaningModel from "../models/cleaningBooking";
import { CleaningBookingParams } from "../types/CleaningBookingParams";

export const getCleaningBooking = async () => {
  return await cleaningModel.find();
};

interface bookingParams {
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

export const addCleaningBooking = async (
  params: CleaningBookingParams
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
    const dup = await cleaningModel.findOne({
      email: normalizedEmail,
      date: when,
    });
    if (dup) {
      return {
        success: false,
        message: "You already have a cleaning booking for this date.",
      };
    }

    const doc = new cleaningModel({
      size: params.size,
      address: {
        postcode: params.postnummer,
        homeType: params.buildingType,
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
      phone: params.telefon ?? "",
      personalNumber: params.presonalNumber ?? "",
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
    return {
      success: false,
      message: "Something went wrong",
      error: error.message,
    };
  }
};

export const deleteBooking = async ({ id }: { id: string }) => {
  try {
    const result = await cleaningModel.findByIdAndDelete(id);

    if (!result) {
      return { message: "Bokning hittades inte", statusCode: 404 };
    }

    return { message: "Bokning raderad", statusCode: 200 };
  } catch (err: any) {
    console.error("Error in deleteBooking:", err);
    return { message: "Något gick fel", statusCode: 500 };
  }
};
