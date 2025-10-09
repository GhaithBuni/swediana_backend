import express from "express";
import {
  addBooking,
  deleteBooking,
  getMovingBooking,
  getMovingBookingid,
} from "../services/movingService";
import validateJWT from "../middlewares/validateJWT";
import MovingBookingModel from "../models/movingBooking";
import { sendConfirmationEmailMoving } from "../services/confiramtionServiceMoving";
const router = express.Router();

router.get("/", validateJWT, async (req, res) => {
  const booking = await getMovingBooking();
  res.status(200).send(booking);
});

router.get("/:id", validateJWT, async (req, res) => {
  const { id } = req.params;
  const booking = await getMovingBookingid({ id });
  res.status(200).send(booking);
});

// routes/moving.ts
router.patch("/:id", validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const payload: any = {};

    const $set: any = {};

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
    if (
      req.body.status &&
      ["pending", "confirmed", "cancelled"].includes(req.body.status)
    ) {
      payload.status = req.body.status;
    }

    if (req.body.priceDetails?.totals) {
      const t = req.body.priceDetails.totals;
      payload["priceDetails.totals"] = {
        movingBase: Number(t.movingBase ?? 0),
        movingExtras: Number(t.movingExtras ?? 0),
        cleaningBaseAfterDiscount: Number(t.cleaningBaseAfterDiscount ?? 0),
        cleaningExtras: Number(t.cleaningExtras ?? 0),
        grandTotal: Number(t.grandTotal ?? 0),
      };
    }
    const updated = await MovingBookingModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();

    if (!updated)
      return res.status(404).json({ message: "Moving booking not found" });
    res.status(200).json({ booking: updated });
  } catch (err) {
    console.error("Update extras error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    // If your addBooking expects flat fields (fromPostnummer, etc.), pass req.body as-is.
    const result = await addBooking({
      size: req.body.size,
      postnummer: req.body.fromPostnummer,
      postNummerTo: req.body.toPostnummer,
      buildingType: req.body.fromHomeType,
      floor: req.body.fromFloor,
      Access: req.body.fromAccess,
      parkingDistance: req.body.fromParkingDistance,
      buildingTypeNew: req.body.toHomeType,
      floorNew: req.body.toFloor,
      AccessNew: req.body.toAccess,
      parkingDistanceNew: req.body.toParkingDistance,
      priceDetails: req.body.priceDetails,

      // extras (map names to what addBooking expects)
      packaging: req.body.packa,
      mounting: req.body.montera,
      cleaningOption: req.body.flyttstad,
      packaKitchen: req.body.packaKitchen,

      whatToMove: req.body.whatToMove,
      name: req.body.name,
      email: req.body.email,
      telefon: req.body.phone,
      date: req.body.date, // you can convert to Date inside helper
      presonalNumber: req.body.personalNumber, // keep spelling if helper expects it
      apartmentKeys: req.body.apartmentKeys,
      message: req.body.message,
      addressStreet: req.body.addressStreet,
    });

    if (!result?.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    console.error("Error creating booking:", err);
    return res.status(500).json({ error: "Could not create booking" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteBooking({ id });
    return res.status(data.statusCode || 500).send({ message: data.message });
  } catch (err: any) {
    console.error("Delete booking error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/send-confirmation/:id", async (req, res) => {
  const { id } = req.params;
  const data = await sendConfirmationEmailMoving({ id });
  return res.status(data.statusCode || 500).send({ message: data.message });
});

export default router;
