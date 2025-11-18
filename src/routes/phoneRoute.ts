import express from "express";
import { addPhoneRecord, getAllPhoneRecords } from "../services/phoneService";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { phone, service } = req.body;
    if (!phone || !service) {
      return res.status(400).json({ error: "Phone and service are required" });
    }
    const result = await addPhoneRecord(phone, service);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error handling phone route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const records = await getAllPhoneRecords();
    res.status(200).json(records);
  } catch (err) {
    console.error("Error fetching phone records:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
