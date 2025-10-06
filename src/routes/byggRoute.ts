import express from "express";
import {
  addByggBooking,
  deleteBooking,
  getByggBooking,
} from "../services/byggService";
const router = express.Router();

router.get("/", async (req, res) => {
  const booking = await getByggBooking();
  res.status(200).send(booking);
});

router.post("/", async (req, res) => {
  try {
    const result = await addByggBooking({
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

export default router;
