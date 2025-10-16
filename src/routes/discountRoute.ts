import express from "express";
import { validateDiscountCode } from "../services/discountService";
import DiscountCodeModel from "../models/DiscountCode";

const router = express.Router();

// Validate discount code
router.post("/validate-discount", async (req, res) => {
  try {
    const { code, amount, service } = req.body;

    if (!code || !amount || !service) {
      return res.status(400).json({
        valid: false,
        error: "Rabattkod, belopp och tjänst krävs",
      });
    }

    const result = await validateDiscountCode(code, amount, service);

    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        error: result.error,
      });
    }

    return res.json({
      valid: true,
      discountAmount: result.discountAmount,
      discountType: result.discount?.type,
      discountValue: result.discount?.value,
    });
  } catch (error) {
    console.error("Error validating discount:", error);
    return res.status(500).json({
      valid: false,
      error: "Något gick fel vid validering av rabattkod",
    });
  }
});

// Create new discount code
router.post("/create-discount", async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      isActive = true,
      validFrom,
      validUntil,
      maxUses,
      minPurchaseAmount,
      applicableServices,
    } = req.body;

    // Validation
    if (!code || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        error: "Kod, typ och värde krävs",
      });
    }

    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Typ måste vara 'percentage' eller 'fixed'",
      });
    }

    if (type === "percentage" && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        error: "Procentvärde måste vara mellan 0 och 100",
      });
    }

    if (value < 0) {
      return res.status(400).json({
        success: false,
        error: "Värde kan inte vara negativt",
      });
    }

    // Check if code already exists
    const existingCode = await DiscountCodeModel.findOne({
      code: code.toUpperCase(),
    });

    if (existingCode) {
      return res.status(409).json({
        success: false,
        error: "Rabattkoden finns redan",
      });
    }

    // Create new discount code
    const discountCode = new DiscountCodeModel({
      code: code.toUpperCase(),
      type,
      value,
      isActive,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      minPurchaseAmount: minPurchaseAmount
        ? Number(minPurchaseAmount)
        : undefined,
      applicableServices: applicableServices || ["cleaning"],
      usedCount: 0,
    });

    const saved = await discountCode.save();

    return res.status(201).json({
      success: true,
      data: saved,
      message: "Rabattkod skapad",
    });
  } catch (error: any) {
    console.error("Error creating discount code:", error);
    return res.status(500).json({
      success: false,
      error: "Något gick fel vid skapande av rabattkod",
      details: error.message,
    });
  }
});

// Get all discount codes
router.get("/", async (req, res) => {
  try {
    const discounts = await DiscountCodeModel.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: discounts,
    });
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    return res.status(500).json({
      success: false,
      error: "Något gick fel vid hämtning av rabattkoder",
    });
  }
});

// Get single discount code
router.get("/discounts/:code", async (req, res) => {
  try {
    const discount = await DiscountCodeModel.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        error: "Rabattkoden finns inte",
      });
    }

    return res.json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error("Error fetching discount code:", error);
    return res.status(500).json({
      success: false,
      error: "Något gick fel",
    });
  }
});

// Update discount code
router.put("/discounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating usedCount manually
    delete updateData.usedCount;

    const updated = await DiscountCodeModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Rabattkoden finns inte",
      });
    }

    return res.json({
      success: true,
      data: updated,
      message: "Rabattkod uppdaterad",
    });
  } catch (error) {
    console.error("Error updating discount code:", error);
    return res.status(500).json({
      success: false,
      error: "Något gick fel vid uppdatering",
    });
  }
});

// Delete discount code
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DiscountCodeModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Rabattkoden finns inte",
      });
    }

    return res.json({
      success: true,
      message: "Rabattkod raderad",
    });
  } catch (error) {
    console.error("Error deleting discount code:", error);
    return res.status(500).json({
      success: false,
      error: "Något gick fel vid radering",
    });
  }
});

export default router;
