import { z } from "zod";
import stripe from "../../lib/stripe.js";
import { prisma } from "../../data/prismaClient.js";

const VAT_RATE = 0.21;

const BaseCheckoutSchema = z
  .object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),

    shippingCounty: z.string().min(2),
    shippingCity: z.string().min(2),

    shippingStreet: z.string().optional(),
    shippingPostalCode: z.string().optional(),

    shippingMethod: z
      .enum(["COURIER_STANDARD", "COURIER_EXPRESS", "EASYBOX"])
      .default("COURIER_STANDARD"),

    easyboxLockerId: z.string().optional(),
    easyboxLockerName: z.string().optional(),
    easyboxCity: z.string().optional(),

    paymentMethod: z.enum(["CARD", "CASH_ON_DELIVERY"]).default("CARD"),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === "EASYBOX") {
      if (!data.easyboxLockerId) {
        ctx.addIssue({
          code: "custom",
          message: "Lipsește easyboxLockerId.",
        });
      }

      if (!data.easyboxLockerName) {
        ctx.addIssue({
          code: "custom",
          message: "Lipsește easyboxLockerName.",
        });
      }

      if (!data.easyboxCity) {
        ctx.addIssue({
          code: "custom",
          message: "Lipsește easyboxCity.",
        });
      }

      return;
    }

    if (!data.shippingStreet || data.shippingStreet.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Lipsește adresa (strada) pentru curier.",
      });
    }
  });

const GuestCheckoutSchema = BaseCheckoutSchema.extend({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ),
});

function computeShippingFee(subtotalRon, shippingMethod) {
  if (subtotalRon >= 500) return 0;
  if (shippingMethod === "EASYBOX") return 15;
  if (shippingMethod === "COURIER_EXPRESS") return 45;
  return 30;
}

function computePaymentFee(paymentMethod) {
  return paymentMethod === "CASH_ON_DELIVERY" ? 15 : 0;
}

function computeTotals(subtotalRon, shippingMethod, paymentMethod) {
  const vatRon = Math.round(subtotalRon * VAT_RATE);
  const shippingFeeRon = computeShippingFee(subtotalRon, shippingMethod);
  const paymentFeeRon = computePaymentFee(paymentMethod);
  const totalRon = subtotalRon + vatRon + shippingFeeRon + paymentFeeRon;

  return {
    subtotalRon,
    vatRon,
    shippingFeeRon,
    paymentFeeRon,
    totalRon,
  };
}

async function calculateAuthCheckout(userId, checkout) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || !cart.items?.length) {
    throw new Error("Coșul este gol.");
  }

  let subtotalRon = 0;
  let itemsCount = 0;

  for (const it of cart.items) {
    if (!it.product) {
      throw new Error("Produs invalid în coș.");
    }

    if (it.product.stock < it.quantity) {
      throw new Error(`Stoc insuficient pentru: ${it.product.name}`);
    }

    subtotalRon += it.unitPriceRon * it.quantity;
    itemsCount += it.quantity;
  }

  return {
    itemsCount,
    ...computeTotals(
      subtotalRon,
      checkout.shippingMethod,
      checkout.paymentMethod
    ),
  };
}

async function calculateGuestCheckout(checkout) {
  if (!Array.isArray(checkout.items) || !checkout.items.length) {
    throw new Error("Items sunt obligatorii pentru guest checkout.");
  }

  const productIds = checkout.items.map((it) => it.productId);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));

  let subtotalRon = 0;
  let itemsCount = 0;

  for (const it of checkout.items) {
    const product = byId.get(it.productId);

    if (!product) {
      throw new Error(`Produs inexistent: ${it.productId}`);
    }

    if (product.stock < it.quantity) {
      throw new Error(`Stoc insuficient pentru: ${product.name}`);
    }

    subtotalRon += product.priceRon * it.quantity;
    itemsCount += it.quantity;
  }

  return {
    itemsCount,
    ...computeTotals(
      subtotalRon,
      checkout.shippingMethod,
      checkout.paymentMethod
    ),
  };
}

async function createIntentResponse({ checkout, totals, metadata }) {
  if (checkout.paymentMethod !== "CARD") {
    throw new Error("PaymentIntent se creează doar pentru plata cu cardul.");
  }

  if (!Number.isInteger(totals.totalRon) || totals.totalRon <= 0) {
    throw new Error("Total comandă invalid.");
  }

  // Stripe cere suma în cea mai mică unitate monetară.
  // Pentru RON: lei -> bani.
  const amount = totals.totalRon * 100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "ron",
    automatic_payment_methods: {
      enabled: true,
    },
    receipt_email: checkout.customerEmail,
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amountRon: totals.totalRon,
    breakdown: totals,
  };
}

export async function createPaymentIntentAuth(req, res) {
  try {
    const parsed = BaseCheckoutSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues?.[0]?.message || "Date checkout invalide.",
      });
    }

    if (!req.auth?.userId) {
      return res.status(401).json({
        error: "Utilizator neautentificat.",
      });
    }

    const totals = await calculateAuthCheckout(req.auth.userId, parsed.data);

    const result = await createIntentResponse({
      checkout: parsed.data,
      totals,
      metadata: {
        checkoutType: "AUTH",
        userId: req.auth.userId,
        shippingMethod: parsed.data.shippingMethod,
        itemsCount: String(totals.itemsCount),
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("createPaymentIntentAuth error:", error);
    return res.status(400).json({
      error: error.message || "Nu s-a putut crea PaymentIntent.",
    });
  }
}

export async function createPaymentIntentGuest(req, res) {
  try {
    const parsed = GuestCheckoutSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues?.[0]?.message || "Date checkout invalide.",
      });
    }

    const totals = await calculateGuestCheckout(parsed.data);

    const result = await createIntentResponse({
      checkout: parsed.data,
      totals,
      metadata: {
        checkoutType: "GUEST",
        userId: "",
        shippingMethod: parsed.data.shippingMethod,
        itemsCount: String(totals.itemsCount),
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("createPaymentIntentGuest error:", error);
    return res.status(400).json({
      error: error.message || "Nu s-a putut crea PaymentIntent.",
    });
  }
}