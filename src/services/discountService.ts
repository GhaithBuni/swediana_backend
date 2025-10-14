// server/services/discountService.ts
import DiscountCodeModel from "../models/DiscountCode";

export async function validateDiscountCode(
  code: string,
  orderAmount: number,
  service: string
) {
  const discount = await DiscountCodeModel.findOne({
    code: code.toUpperCase(),
  });

  if (!discount) {
    return { valid: false, error: "Rabattkoden finns inte" };
  }

  if (!discount.isActive) {
    return { valid: false, error: "Rabattkoden är inte aktiv" };
  }

  const now = new Date();
  if (discount.validFrom && now < discount.validFrom) {
    return { valid: false, error: "Rabattkoden är inte giltig ännu" };
  }

  if (discount.validUntil && now > discount.validUntil) {
    return { valid: false, error: "Rabattkoden har utgått" };
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return {
      valid: false,
      error: "Rabattkoden har använts maximalt antal gånger",
    };
  }

  if (discount.minPurchaseAmount && orderAmount < discount.minPurchaseAmount) {
    return {
      valid: false,
      error: `Minsta ordervärde är ${discount.minPurchaseAmount} kr`,
    };
  }

  if (
    discount.applicableServices?.length &&
    !discount.applicableServices.includes(service)
  ) {
    return {
      valid: false,
      error: "Rabattkoden är inte giltig för denna tjänst",
    };
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = Math.round((orderAmount * discount.value) / 100);
  } else {
    discountAmount = Math.min(discount.value, orderAmount);
  }

  return {
    valid: true,
    discount,
    discountAmount,
  };
}

export async function applyDiscountCode(discountCodeId: string) {
  await DiscountCodeModel.findByIdAndUpdate(discountCodeId, {
    $inc: { usedCount: 1 },
  });
}
