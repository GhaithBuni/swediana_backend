import express from "express";

import validateJWT from "../middlewares/validateJWT";
import {
  getForetagstad,
  submitForetagstad,
} from "../services/foretagstadService";
import Foretagstad from "../models/foretagstadModel";
const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const {
      name,
      kvm,
      adress,
      postalcode,
      city,
      email,
      message,
      phone,
      subject,
    } = req.body;

    await submitForetagstad({
      name,
      kvm,
      adress,
      postalcode,
      city,
      email,
      message,
      phone,
      subject,
      createdAt: new Date(),
    });

    // ✅ Add success response
    res.status(201).json({
      message: "Företagsstädning request submitted successfully",
    });
  } catch (err) {
    console.error("Error submitting foretagstad:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const contacts = await getForetagstad();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    await Foretagstad.findByIdAndDelete(id);
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
