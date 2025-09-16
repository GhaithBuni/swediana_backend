import movingBookingModel from "../models/movingBooking";

export const getMovingBooking = async () => {
  return await movingBookingModel.find();
};

interface bookingParams {
  size: number;
  postnummer: string;
  postNummerTo: string;
  buildingType: string;
  floor: string;
  Access: string;
  parkingDistance: number;
  //New Adress
  buildingTypeNew: string;
  floorNew: string;
  AccessNew: string;
  parkingDistanceNew: number;
  //Extra Serivces
  packaging: "Ja" | "Nej";
  mounting: "Ja" | "Nej";
  Disposal: "Ja" | "Nej";
  cleaningOption: "Ja" | "Nej";
  Storage: "Ja" | "Nej";
  whatToMove: string;
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
  postNummerTo,
  buildingType,
  floor,
  Access,
  parkingDistance,
  buildingTypeNew,
  floorNew,
  AccessNew,
  parkingDistanceNew,
  packaging,
  mounting,
  Disposal,
  cleaningOption,
  Storage,
  whatToMove,
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
    const existingBooking = await movingBookingModel.findOne({ email });
    if (existingBooking) {
      return { success: false, message: "You have already made a booking" };
    }

    // Create new booking
    const booking = new movingBookingModel({
      size,
      postnummer,
      postNummerTo,
      buildingType,
      floor,
      Access,
      parkingDistance,
      buildingTypeNew,
      floorNew,
      AccessNew,
      parkingDistanceNew,
      packaging,
      mounting,
      Disposal,
      cleaningOption,
      Storage,
      whatToMove,
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
