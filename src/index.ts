import express from "express";
import mongoose from "mongoose";
import {
  seedInitialPrices,
  seedInitialPricesCleaning,
} from "./services/priceService";
import pricesRoute from "./routes/pricesRoute";

const app = express();
const port = 4000;

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/swediana")
  .then(() => {
    console.log("Connected ");
  })
  .catch((err) => {
    console.log("Failed To connect!", err);
  });

app.use("/prices", pricesRoute);

seedInitialPrices();
seedInitialPricesCleaning();

app.listen(port, () => {
  console.log(`server is running at: https://localhost:${port} `);
});
