import phoneModel, { IPhone } from "../models/phoneModel";

export const addPhoneRecord = async (phone: string, service: string) => {
  const newPhoneRecord = new phoneModel({
    phone,
    service,
  });
  if (!newPhoneRecord) {
    throw new Error("Failed to create phone record");
  }
  await newPhoneRecord.save();
  return newPhoneRecord;
};

export const getAllPhoneRecords = async () => {
  return await phoneModel.find();
};

export const updatePhoneStatus = async (
  id: string,
  status: "Har Ringt" | "Ska ringa upp" | "Ingen status"
): Promise<IPhone | null> => {
  try {
    const updatedPhone = await phoneModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true } // Return updated document and validate
    );

    return updatedPhone;
  } catch (error) {
    console.error("Error updating phone status:", error);
    throw error;
  }
};

export const deletePhoneRecord = async (id: string): Promise<IPhone | null> => {
  try {
    const deletedPhone = await phoneModel.findByIdAndDelete(id);
    return deletedPhone;
  } catch (error) {
    console.error("Error deleting phone record:", error);
    throw error;
  }
};
