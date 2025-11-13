import movingBookingModel from "../models/movingBooking";
import { validateDiscountCode } from "./discountService";

export const getMovingBooking = async () => {
  console.log("Fetching moving bookings");
  return await movingBookingModel.find();
};

interface GetParams {
  id: string;
}

export const getMovingBookingid = async ({ id }: GetParams) => {
  return await movingBookingModel.findById(id);
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
  pnr?: string;
  apartmentKeys?: string;
  message?: string;
  addressStreet: string;
  moveType?: string;
  discountCode?: string;

  priceDetails?: {
    lines: { key: string; label: string; amount: number; meta?: string }[];
    totals: {
      movingBase: number;
      movingExtras: number;
      cleaningBaseAfterDiscount: number;
      cleaningExtras: number;
      subtotal?: number;
      discount?: number;
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

    // Handle discount code validation
    let discountAmount = 0;
    let discountCodeId = null;
    let validatedDiscountCode = null;
    let finalPriceDetails = params.priceDetails;

    if (params.discountCode) {
      const baseTotal = params.priceDetails?.totals?.grandTotal || 0;

      const validation = await validateDiscountCode(
        params.discountCode,
        baseTotal,
        "moving"
      );

      if (!validation.valid) {
        return {
          success: false,
          message: validation.error || "Ogiltig rabattkod",
        };
      }

      discountAmount = validation.discountAmount!;
      discountCodeId = validation.discount!._id;
      //validatedDiscountCode = params.discountCode.toUpperCase();

      // Recalculate totals with discount
      const subtotal = baseTotal;
      const newBase = Math.max(0, subtotal - discountAmount);

      finalPriceDetails = {
        ...params.priceDetails,
        lines: [
          ...(params.priceDetails?.lines || []),
          {
            key: "discount",
            label: `Rabattkod (${validatedDiscountCode})`,
            amount: -discountAmount,
            meta:
              validation.discount!.type === "percentage"
                ? `${validation.discount!.value}%`
                : undefined,
          },
        ],
        totals: {
          movingBase: newBase,
          movingExtras: params.priceDetails?.totals?.movingExtras || 0,
          cleaningBaseAfterDiscount:
            params.priceDetails?.totals?.cleaningBaseAfterDiscount || 0,
          cleaningExtras: params.priceDetails?.totals?.cleaningExtras || 0,
          subtotal: subtotal,
          discount: discountAmount,
          grandTotal: params.priceDetails?.totals?.grandTotal || 0,
        },
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

      // discount fields
      discountCode: validatedDiscountCode,
      discountCodeId: discountCodeId,
      discountAmount: discountAmount,
      // disposal/storage if you add them:
      // disposal: params.Disposal,
      // storage: params.Storage,

      whatToMove: params.whatToMove,
      name: params.name,
      email: normalizedEmail,
      phone: params.telefon,
      pnr: params.pnr,
      apartmentKeys: params.apartmentKeys,
      message: params.message,
      addressStreet: params.addressStreet,
      moveType: params.moveType,
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
