import express from "express";
import {
  calculatePrice,
  calculatePriceCleaning,
  getCleanPrices,
  getPrices,
  updateCleanPrice,
  updatePrice,
} from "../services/priceService";
import validateJWT from "../middlewares/validateJWT";

const router = express.Router();

router.get("/", validateJWT, async (req, res) => {
  const prices = await getPrices();
  res.status(200).send(prices);
});
router.get("/clean", validateJWT, async (req, res) => {
  const prices = await getCleanPrices();
  res.status(200).send(prices);
});

router.post("/", async (req, res) => {
  const { size, postNummer, postNummerTo } = req.body;
  const data = await calculatePrice({ size, postNummer, postNummerTo });
  res.status(data.statusCode).send(data);
});

router.patch("/", validateJWT, async (req, res) => {
  try {
    const body = req.body || {};
    // minimal validation
    for (const k of ["pricePerKvm", "travelFee", "fixedPrice"]) {
      if (typeof body[k] === "undefined") {
        return res.status(400).json({ message: `Saknar fält: ${k}` });
      }
    }
    const updated = await updatePrice(body);
    res.status(200).json(updated);
  } catch (e) {
    console.error("PATCH /price error:", e);
    res.status(500).json({ message: "Kunde inte uppdatera pris." });
  }
});

router.patch("/clean", validateJWT, async (req, res) => {
  try {
    const body = req.body || {};
    for (const k of ["pricePerKvm", "fixedPrice", "extraServices"]) {
      if (typeof body[k] === "undefined") {
        return res.status(400).json({ message: `Saknar fält: ${k}` });
      }
    }
    const updated = await updateCleanPrice(body);
    res.status(200).json(updated);
  } catch (e) {
    console.error("PATCH /clean-price error:", e);
    res.status(500).json({ message: "Kunde inte uppdatera städpriser." });
  }
});

router.post("/cleaning", async (req, res) => {
  const { size } = req.body;
  const data = await calculatePriceCleaning({ size });
  res.status(data.statusCode).send(data);
});

export default router;
