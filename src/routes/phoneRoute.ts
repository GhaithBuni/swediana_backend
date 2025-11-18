import express from "express";
import {
  addPhoneRecord,
  deletePhoneRecord,
  getAllPhoneRecords,
  updatePhoneStatus,
} from "../services/phoneService";
import validateJWT from "../middlewares/validateJWT";

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

router.get("/", validateJWT, async (req, res) => {
  try {
    const records = await getAllPhoneRecords();
    res.status(200).json(records);
  } catch (err) {
    console.error("Error fetching phone records:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["Har Ringt", "Ska ringa upp", "Ingen status"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedRecord = await updatePhoneStatus(id, status);

    if (!updatedRecord) {
      return res.status(404).json({ error: "Phone record not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedRecord,
    });
  } catch (err) {
    console.error("Error updating phone status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", validateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await deletePhoneRecord(id);

    if (!deletedRecord) {
      return res.status(404).json({ error: "Phone record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Phone record deleted successfully",
      data: deletedRecord,
    });
  } catch (err) {
    console.error("Error deleting phone record:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
