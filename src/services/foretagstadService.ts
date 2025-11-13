import Foretagstad from "../models/foretagstadModel";

export interface Iforetagstad {
  name: string;
  kvm: string;
  adress: string;
  postalcode: string;
  city: string;
  email: string;
  message: string;
  phone: string;
  subject: string;
  createdAt: Date;
}

export const getForetagstad = async () => {
  return await Foretagstad.find();
};

interface GetParams {
  id: string;
}
export const getForetagstadId = async ({ id }: GetParams) => {
  return await Foretagstad.findById(id);
};

export const submitForetagstad = async (data: Iforetagstad) => {
  try {
    if (!data) {
      throw new Error("No data provided");
    }
    const newForetagstad = new Foretagstad(data);
    await newForetagstad.save();
  } catch (err) {
    console.error("Error submitting contact:", err);
    throw new Error("Internal server error");
  }
};
