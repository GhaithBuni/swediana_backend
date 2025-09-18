// types/CleaningBookingParams.ts
export type YesNo = "JA" | "NEJ";

export interface CleaningBookingParams {
  // base inputs
  size: number; // m²

  // address (flat, like your moving flow)
  postnummer: string;
  buildingType: "lagenhet" | "Hus" | "forrad" | "kontor";
  floor: string; // "1".."10+"
  Access: "stairs" | "elevator" | "large-elevator";
  parkingDistance: number;

  // extras (fixed/qty mixed)
  Persienner?: number; // quantity (0..N)
  badrum?: YesNo; // "JA" | "NEJ"
  toalett?: YesNo; // "JA" | "NEJ"
  Inglasadduschhörna?: YesNo; // "JA" | "NEJ"

  // customer
  name: string;
  email: string;
  telefon?: string;
  date: string; // parse to Date in helper
  presonalNumber?: string;
  message?: string;

  // price snapshot from UI (optional)
  priceDetails?: {
    lines: { key: string; label: string; amount: number; meta?: string }[];
    totals: {
      base: number;
      extras: number;
      grandTotal: number;
      currency?: "SEK";
    };
  };
}
