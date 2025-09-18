import express from "express";
import {
  addBooking,
  deleteBooking,
  getMovingBooking,
} from "../services/movingService";
const router = express.Router();

router.get("/", async (req, res) => {
  const booking = await getMovingBooking();
  res.status(200).send(booking);
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

export default router;
