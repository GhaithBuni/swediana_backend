import ByggBookingModel from "../models/byggBooking";
import { ByggBookingParams } from "../types/ByggBookingParams";
import { validateDiscountCode } from "./discountService";
import { addEventToGoogleCalendarBygg } from "./googleCalendarService";
import { sendBookingNotification } from "./notificationService";

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
  params: ByggBookingParams,
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

    let discountAmount = 0;
    let discountCodeId = null;
    let validatedDiscountCode = null;
    let finalPriceDetails = params.priceDetails;

    if (params.discountCode) {
      const originalBase = params.priceDetails?.totals?.base || 0;

      const validation = await validateDiscountCode(
        params.discountCode,
        originalBase,
        "cleaning",
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
      addressStreet: params.addressStreet ?? "",

      // schedule
      date: when,
      time: params.time ?? "",

      discountCode: validatedDiscountCode,
      discountCodeId: discountCodeId,
      discountAmount: discountAmount,
      // optional snapshot (already computed on client)
      priceDetails: finalPriceDetails,
      cleanType: params.cleanType,

      status: "pending",
    });

    const saved = await doc.save();
    // Add to Google Calendar
    try {
      await addEventToGoogleCalendarBygg(saved);
    } catch (err) {
      console.error("Failed to add event to Google Calendar:", err);
    }
    console.log("Byggstäd booking created:", saved.bookingNumber || saved._id);

    // 📧 SEND EMAIL NOTIFICATION
    try {
      // Prepare extras list for email
      const extras: string[] = [];
      if (params.Persienner && Number(params.Persienner) > 0) {
        extras.push(`${params.Persienner} Persienner`);
      }
      if (params.badrum === "JA") {
        extras.push("Extra Badrum");
      }
      if (params.toalett === "JA") {
        extras.push("Extra Toalett");
      }
      if (params.Inglasadduschhörna === "JA") {
        extras.push("Inglasad Duschhörna");
      }

      await sendBookingNotification({
        bookingNumber: saved.bookingNumber || saved._id.toString(),
        customerName: params.name,
        customerEmail: normalizedEmail,
        customerPhone: params.phone ?? "",
        service: "byggstädning",
        date: when.toLocaleDateString("sv-SE"),
        time: params.time,
        size: params.size,
        address: params.addressStreet,
        postcode: params.postcode,
        totalAmount: finalPriceDetails?.totals?.grandTotal || 0,
        extras: extras.length > 0 ? extras : undefined,
        cleanType: params.cleanType,
      });
    } catch (notificationError) {
      // Don't fail the booking if notification fails
      console.error("Failed to send email notification:", notificationError);
    }

    return { success: true, data: saved };
  } catch (error: any) {
    console.error("Error saving byggstäd booking:", error);
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
