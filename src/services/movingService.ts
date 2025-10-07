import movingBookingModel from "../models/movingBooking";

export const getMovingBooking = async () => {
  console.log("Fetching moving bookings");
  return await movingBookingModel.find();
};

interface BookingParams {
  size: number;
  postnummer: string;
  postNummerTo: string;
  buildingType: string;
  floor: string;
  Access: string;
  parkingDistance: number;
  buildingTypeNew: string;
  floorNew: string;
  AccessNew: string;
  parkingDistanceNew: number;
  packaging: "JA" | "NEJ";
  mounting: "JA" | "NEJ";
  cleaningOption: "JA" | "NEJ";
  packaKitchen: "JA" | "NEJ";

  whatToMove?: string;
  name: string;
  email: string;
  telefon: string;
  date: string;
  presonalNumber?: string;
  apartmentKeys?: string;
  message?: string;
  priceDetails?: {
    lines: { key: string; label: string; amount: number; meta?: string }[];
    totals: {
      movingBase: number;
      movingExtras: number;
      cleaningBaseAfterDiscount: number;
      cleaningExtras: number;
      grandTotal: number;
      currency?: "SEK";
    };
  };
}
export const addBooking = async (params: BookingParams): Promise<any> => {
  try {
    const {
      // ... all your existing fields ...
      priceDetails, // ⬅️ add this to params interface and destructuring
    } = params;

    const when = new Date(params.date);
    if (isNaN(when.getTime())) {
      return { success: false, message: "Invalid date" };
    }

    // Duplicate rule (optional): same email + date
    const normalizedEmail = String(params.email).trim().toLowerCase();
    const duplicate = await movingBookingModel.findOne({
      email: normalizedEmail,
      date: when,
    });
    if (duplicate) {
      return {
        success: false,
        message: "You already have a booking for this date.",
      };
    }

    const booking = new movingBookingModel({
      size: params.size,
      from: {
        postcode: params.postnummer,
        homeType: params.buildingType,
        floor: params.floor,
        access: params.Access,
        parkingDistance: params.parkingDistance,
      },
      to: {
        postcode: params.postNummerTo,
        homeType: params.buildingTypeNew,
        floor: params.floorNew,
        access: params.AccessNew,
        parkingDistance: params.parkingDistanceNew,
      },
      packa: params.packaging,
      packaKitchen: params.packaKitchen ?? "NEJ",
      montera: params.mounting,
      flyttstad: params.cleaningOption,
      // disposal/storage if you add them:
      // disposal: params.Disposal,
      // storage: params.Storage,

      whatToMove: params.whatToMove,
      name: params.name,
      email: normalizedEmail,
      phone: params.telefon,
      personalNumber: params.presonalNumber,
      apartmentKeys: params.apartmentKeys,
      message: params.message,
      date: when,

      /** snapshot straight from client (already computed by your store) */
      priceDetails,
    });

    const saved = await booking.save();
    return { success: true, data: saved };
  } catch (error: any) {
    console.error("Error saving booking:", error);
    return {
      success: false,
      message: "Something went wrong",
      error: error.message,
    };
  }
};

export const deleteBooking = async ({ id }: { id: string }) => {
  try {
    const result = await movingBookingModel.findByIdAndDelete(id);

    if (!result) {
      return { message: "Bokning hittades inte", statusCode: 404 };
    }

    return { message: "Bokning raderad", statusCode: 200 };
  } catch (err: any) {
    console.error("Error in deleteBooking:", err);
    return { message: "Något gick fel", statusCode: 500 };
  }
};
