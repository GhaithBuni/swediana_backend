import cleaningModel from "../models/cleaningBooking";

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

export const addBooking = async ({
  size,
  postnummer,
  buildingType,
  floor,
  Access,
  parkingDistance,

  Persinner,
  ExtraBadrum,
  ExtraToalett,
  inglassadDusch,
  name,
  email,
  telefon,
  date,
  presonalNumber,
  apartmentKeys,
  message,
}: bookingParams): Promise<any> => {
  try {
    // Check if booking with same email already exists
    const existingBooking = await cleaningModel.findOne({ email });
    if (existingBooking) {
      return { success: false, message: "You have already made a booking" };
    }

    // Create new booking
    const booking = new cleaningModel({
      size,
      postnummer,
      buildingType,
      floor,
      Access,
      parkingDistance,

      Persinner,
      ExtraBadrum,
      ExtraToalett,
      inglassadDusch,
      name,
      email,
      telefon,
      date,
      presonalNumber,
      apartmentKeys,
      message,
    });

    const savedBooking = await booking.save();

    return { success: true, data: savedBooking };
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
