import express from "express";
import mongoose from "mongoose";
import {
  seedInitialPrices,
  seedInitialPricesCleaning,
} from "./services/priceService";
import pricesRoute from "./routes/pricesRoute";
import movingRoute from "./routes/movingRoute";
import cleaningRoute from "./routes/CleaningRoute";
import byggRoute from "./routes/byggRoute";
import adminRoute from "./routes/adminRoute";
import discountRoute from "./routes/discountRoute";
import cors from "cors";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/swediana")
  .then(() => {
    console.log("Connected ");
  })
  .catch((err) => {
    console.log("Failed To connect!", err);
  });

app.use("/prices", pricesRoute);
app.use("/moving", movingRoute);
app.use("/cleaning", cleaningRoute);
app.use("/bygg", byggRoute);
app.use("/admin", adminRoute);
app.use("/discount", discountRoute);
seedInitialPrices();
seedInitialPricesCleaning();

app.listen(port, () => {
  console.log(`server is running at: https://localhost:${port} `);
});
