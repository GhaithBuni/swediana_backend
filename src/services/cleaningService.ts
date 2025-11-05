// server/services/cleaningBookingService.ts
import cleaningModel from "../models/cleaningBooking";
import { CleaningBookingParams } from "../types/CleaningBookingParams";
import { validateDiscountCode, applyDiscountCode } from "./discountService";

export const getCleaningBooking = async () => {
  return await cleaningModel.find().populate("discountCodeId");
};

interface GetParams {
  id: string;
}

export const getCleaningBookingid = async ({ id }: GetParams) => {
  return await cleaningModel.findById(id).populate("discountCodeId");
};

interface DeleteParams {
  id: string;
}

export const deleteCleaningBooking = async ({ id }: DeleteParams) => {
  try {
    const result = await cleaningModel.findByIdAndDelete(id);
    if (!result) {
      return { message: "bokning hittades inte", statusCode: 404 };
    }
    return { message: "Bokning raderad", statusCode: 200 };
  } catch (err) {
    console.error("Error in Delete Booking", err);
    return { message: "Något gick fel", statusCode: 500 };
  }
};

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

    // Handle discount code validation
    let discountAmount = 0;
    let discountCodeId = null;
    let validatedDiscountCode = null;
    let finalPriceDetails = params.priceDetails;

    if (params.discountCode) {
      const originalBase = params.priceDetails?.totals?.base || 0;

      const validation = await validateDiscountCode(
        params.discountCode,
        originalBase,
        "cleaning"
      );

      if (!validation.valid) {
        return {
          success: false,
          message: validation.error || "Ogiltig rabattkod",
        };
      }

      discountAmount = validation.discountAmount!;
      discountCodeId = validation.discount!._id;
      validatedDiscountCode = params.discountCode.toUpperCase();

      // Recalculate totals with discount
      const subtotal = originalBase;
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
          base: newBase,
          extras: params.priceDetails?.totals?.extras || 0,
          subtotal: subtotal,
          discount: discountAmount,
          grandTotal: params.priceDetails?.totals?.grandTotal || 0,
        },
      };
    }

    const doc = new cleaningModel({
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
      addressStreet: params.addressStreet ?? "",

      // schedule
      date: when,
      time: params.time ?? "",

      // discount fields
      discountCode: validatedDiscountCode,
      discountCodeId: discountCodeId,
      discountAmount: discountAmount,
      apartmentKeys: params.apartmentKeys,
      cleanType: params.cleanType,

      // price details with discount applied
      priceDetails: finalPriceDetails,

      status: "pending",
    });

    const saved = await doc.save();

    // Increment discount code usage count
    if (discountCodeId) {
      await applyDiscountCode(discountCodeId.toString());
    }

    console.log("Booking created:", doc.bookingNumber);
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

// New function to validate discount code before booking
export const validateDiscount = async (
  code: string,
  amount: number
): Promise<{
  valid: boolean;
  discountAmount?: number;
  message?: string;
  discountType?: string;
  discountValue?: number;
}> => {
  const validation = await validateDiscountCode(code, amount, "cleaning");

  if (!validation.valid) {
    return {
      valid: false,
      message: validation.error,
    };
  }

  return {
    valid: true,
    discountAmount: validation.discountAmount,
    discountType: validation.discount!.type,
    discountValue: validation.discount!.value,
  };
};
