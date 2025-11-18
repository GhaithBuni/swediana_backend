import phoneModel from "../models/phoneModel";

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
