require("dotenv").config(); // Load environment variables

import cleanPriceModel from "../models/cleaningPriceModel";
import priceModel from "../models/priceModel";
const axios = require("axios");
const originDistance = "75430";

export const getPrices = async () => {
  return await priceModel.find();
};
export const getCleanPrices = async () => {
  return await cleanPriceModel.find();
};
export const seedInitialPrices = async () => {
  const prices = [
    {
      pricePerKvm: 50,
      travelFee: 10,
      fixedPrice: 2500,
      extraServices: [
        { packagingAllRooms: 25, packagingKitchen: 10, mounting: 10 },
      ],
    },
  ];
  const Allprices = await getPrices();

  if (Allprices.length === 0) {
    await priceModel.insertMany(prices);
  }
};

export const seedInitialPricesCleaning = async () => {
  const prices = [
    {
      pricePerKvm: 43,

      fixedPrice: 2150,
      extraServices: [
        {
          Persinner: 100,
          ExtraBadrum: 300,
          ExtraToalett: 200,
          inglassadDusch: 200,
        },
      ],
    },
  ];
  const Allprices = await getCleanPrices();

  if (Allprices.length === 0) {
    await cleanPriceModel.insertMany(prices);
  }
};

interface PriceParams {
  size: number;
  postNummer: string;
  postNummerTo: string;
}
export const calculatePrice = async ({
  size,
  postNummer,
  postNummerTo,
}: PriceParams) => {
  try {
    console.log("Starting calculatePrice function");

    // constants
    const FREE_KM = 31;

    console.log("Fetching prices from database");
    const prices = await priceModel
      .findOne(
        {},
        { pricePerKvm: 1, travelFee: 1, fixedPrice: 1, extraServices: 1 }
      )
      .lean();

    if (!prices) {
      console.error("Prices not found in database");
      return { data: "Prisdata saknas", statusCode: 500 };
    }

    console.log("Prices fetched successfully", prices);

    console.log("Fetching distance between postNummer and postNummerTo");
    const distance = await getDistance({ postNummer, postNummerTo });
    console.log("Distance fetched successfully", distance);

    console.log("Fetching distance between originDistance and postNummer");
    const originDistanceValue = await getDistance({
      postNummer: originDistance,
      postNummerTo: postNummer,
    });
    console.log("Origin distance fetched successfully", originDistanceValue);

    if (
      distance == null ||
      Number.isNaN(distance) ||
      originDistanceValue == null ||
      Number.isNaN(originDistanceValue)
    ) {
      console.error("Invalid distances fetched", {
        distance,
        originDistanceValue,
      });
      return { data: "Kontrollera Postnummer", statusCode: 404 };
    }

    // charge only for km above threshold
    const extraKmOut = Math.max(0, distance - FREE_KM);
    const extraKmBack = Math.max(0, originDistanceValue - FREE_KM);
    const extraKmCost = (extraKmOut + extraKmBack) * prices.travelFee;

    console.log("Extra KM cost calculated", extraKmCost);

    let movingPrice: number;

    if (size <= 50) {
      movingPrice = prices.fixedPrice + extraKmCost;
    } else {
      movingPrice = prices.pricePerKvm * size + extraKmCost;
    }

    console.log("Moving price calculated", movingPrice);

    return {
      data: {
        movingPrice,
        extraServices: prices.extraServices ?? [],
        breakdown: {
          size,
          distanceOut: distance,
          distanceBack: originDistanceValue,
          chargedKm: extraKmOut + extraKmBack,
          kmRate: prices.travelFee,
          fixedPrice: size <= 50 ? prices.fixedPrice : 0,
          perKvm: size > 50 ? prices.pricePerKvm : 0,
          extraKmCost,
        },
      },
      statusCode: 200,
    };
  } catch (err) {
    console.error("Error in calculatePrice function", err);
    return { data: "Ett oväntat fel inträffade", statusCode: 500 };
  }
};

interface DistanceParams {
  postNummer: string;
  postNummerTo: string;
}

async function getDistance({ postNummer, postNummerTo }: DistanceParams) {
  if (!postNummer || !postNummerTo) {
    throw new Error("Postnummer och destination måste anges.");
  }

  const postalCodeRegex = /^\d{5}$/;
  if (
    !postalCodeRegex.test(postNummer) ||
    !postalCodeRegex.test(postNummerTo)
  ) {
    throw new Error(
      "Ogiltigt postnummerformat. Ange giltiga svenska postnummer."
    );
  }

  const apiKey = process.env.GOOGLE_API_KEY; // Use environment variable for API key
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${postNummer},Sweden&destinations=${postNummerTo}, Sweden&region=se&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log(response);

    if (response.data.rows[0].elements[0].status === "OK") {
      console.log(
        "Distance fetched successfully:",
        response.data.rows[0].elements[0].status
      );
      const distanceInMeters = response.data.rows[0].elements[0].distance.value;

      console.log("Distance in kilometers:", distanceInMeters / 1000);
      return distanceInMeters / 1000; // Convert meters to kilometers
    } else {
      console.error("Google API Error: Invalid response structure or status");
      throw new Error("Ogiltiga postnummer eller API-kvot överskriden.");
    }
  } catch (error) {
    console.error("Error fetching distance:", error);
    throw new Error("Kunde inte hämta avståndet. Kontrollera postnumren.");
  }
}

interface calculateCleaning {
  size: number;
}

export const calculatePriceCleaning = async ({ size }: calculateCleaning) => {
  try {
    const prices = await cleanPriceModel
      .findOne({}, { pricePerKvm: 1, fixedPrice: 1, extraServices: 1 })
      .lean();
    if (!prices) {
      return { data: "Prisdata saknas", statusCode: 500 };
    }
    let cleaningPrice = 0;
    console.log(size);

    if (size <= 50) {
      cleaningPrice = prices.fixedPrice;
    } else {
      cleaningPrice = prices.pricePerKvm * size;
    }

    return {
      data: { cleaningPrice, extraServices: prices.extraServices ?? [] },
      statusCode: 200,
    };
  } catch (err) {
    console.error("Error in calculatePrice function", err);
    return { data: "Ett oväntat fel inträffade", statusCode: 500 };
  }
};
