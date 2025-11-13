import contact from "../models/ContactModel";

interface IcontactService {
  name: string;
  email: string;
  message: string;
  phone: string;
  subject: string;
}

export const getContact = async () => {
  return await contact.find();
};
interface GetParams {
  id: string;
}
export const getContactId = async ({ id }: GetParams) => {
  return await contact.findById(id);
};

export const submitContact = async (contactData: IcontactService) => {
  try {
    const newContact = new contact(contactData);
    await newContact.save();
  } catch (error) {
    console.error("Error submitting contact:", error);
    throw new Error("Internal server error");
  }
};
