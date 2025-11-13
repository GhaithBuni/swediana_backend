import express from "express";
const router = express.Router();
import validateJWT from "../middlewares/validateJWT";
import { getContact, submitContact } from "../services/ContactService";
import Contact from "../models/ContactModel";

router.post("/submit", async (req, res) => {
  const { name, email, message, phone, subject } = req.body;

  try {
    await submitContact({
      name,
      email,
      message,
      phone,
      subject,
    });
    res.status(201).json({ message: "Contact submitted successfully" });
  } catch (error) {
    console.error("Error submitting contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", validateJWT, async (req, res) => {
  try {
    const contacts = await getContact();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
