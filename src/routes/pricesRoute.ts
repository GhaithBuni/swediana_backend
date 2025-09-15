import express from "express";
import {
  calculatePrice,
  calculatePriceCleaning,
  getPrices,
} from "../services/priceService";

const router = express.Router();

router.get("/", async (req, res) => {
  const prices = await getPrices();
  res.status(200).send(prices);
});

router.post("/", async (req, res) => {
  const { size, postNummer, postNummerTo } = req.body;
  const data = await calculatePrice({ size, postNummer, postNummerTo });
  res.status(data.statusCode).send(data);
});

router.post("/cleaning", async (req, res) => {
  const { size } = req.body;
  const data = await calculatePriceCleaning({ size });
  res.status(data.statusCode).send(data);
});
export default router;
