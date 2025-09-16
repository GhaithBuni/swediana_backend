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
  const {
    size,
    postnummer,
    postNummerTo,
    buildingType,
    floor,
    Access,
    parkingDistance,
    buildingTypeNew,
    floorNew,
    AccessNew,
    parkingDistanceNew,
    packaging,
    mounting,
    Disposal,
    cleaningOption,
    Storage,
    whatToMove,
    name,
    email,
    telefon,
    date,
    presonalNumber,
    apartmentKeys,
    message,
  } = req.body;

  const data = await addBooking({
    size,
    postnummer,
    postNummerTo,
    buildingType,
    floor,
    Access,
    parkingDistance,
    buildingTypeNew,
    floorNew,
    AccessNew,
    parkingDistanceNew,
    packaging,
    mounting,
    Disposal,
    cleaningOption,
    Storage,
    whatToMove,
    name,
    email,
    telefon,
    date,
    presonalNumber,
    apartmentKeys,
    message,
  });
  res.status(200).send(data);
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
