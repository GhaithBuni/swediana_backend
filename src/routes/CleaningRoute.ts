import express from "express";
import {
  addCleaningBooking,
  deleteBooking,
  getCleaningBooking,
  getCleaningBookingid,
} from "../services/cleaningService";
import validateJWT from "../middlewares/validateJWT";
import CleaningBookingModel from "../models/cleaningBooking";
const router = express.Router();

router.get("/", validateJWT, async (req, res) => {
  const booking = await getCleaningBooking();
  res.status(200).send(booking);
});
router.get("/:id", validateJWT, async (req, res) => {
  const { id } = req.params;
  const booking = await getCleaningBookingid({ id });
  res.status(200).send(booking);
});

router.patch("/:id", validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const payload: any = {};

    if (req.body.date) {
      const when = new Date(req.body.date); // ISO with time
      if (isNaN(when.getTime()))
        return res.status(400).json({ message: "Invalid date" });
      payload.date = when;
    }
    if (req.body.time) payload.time = String(req.body.time).trim();

    if (typeof req.body.email === "string")
      payload.email = String(req.body.email).trim().toLowerCase();
    if (typeof req.body.phone === "string")
      payload.phone = String(req.body.phone).trim();
    if (typeof req.body.size !== "undefined")
      payload.size = Number(req.body.size);
    if (typeof req.body.addressStreet === "string")
      payload.addressStreet = String(req.body.addressStreet).trim();

    if (
      req.body.status &&
      ["pending", "confirmed", "cancelled"].includes(req.body.status)
    ) {
      payload.status = req.body.status;
    }
    if (req.body.priceDetails?.totals) {
      const t = req.body.priceDetails.totals;
      payload["priceDetails.totals"] = {
        base: Number(t.base ?? 0),
        extras: Number(t.extras ?? 0),
        grandTotal: Number(t.grandTotal ?? 0),
      };
    }

    const updated = await CleaningBookingModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();

    if (!updated)
      return res.status(404).json({ message: "Cleaning booking not found" });
    return res.status(200).json({ booking: updated });
  } catch (err) {
    console.error("Update cleaning booking error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await addCleaningBooking({
      size: req.body.size,
      // address (flat)
      postcode: req.body.addressPostnummer,
      homeType: req.body.addressHomeType,
      floor: req.body.addressFloor,
      Access: req.body.addressAccess,
      parkingDistance: req.body.addressParkingDistance,

      // extras
      Persienner: req.body.Persienner,
      badrum: req.body.badrum,
      toalett: req.body.toalett,
      Inglasadduschhörna: req.body.Inglasadduschhörna,

      // customer
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      date: req.body.date,
      personalNumber: req.body.personalNumber,
      message: req.body.message,
      addressStreet: req.body.addressStreet,

      // optional UI snapshot
      priceDetails: req.body.priceDetails,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error("Error creating cleaning booking:", err);
    return res.status(500).json({ error: "Could not create cleaning booking" });
  }
});

router.delete("/:id", validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteBooking({ id });
    return res.status(data.statusCode || 500).send({ message: data.message });
  } catch (err: any) {
    console.error("Delete booking error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
