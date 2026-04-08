import { z } from "zod";

const VAT_RATE = 0.21;

// -------------------- validation --------------------

const CheckoutSchema = z
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

const GuestItemsSchema = z.array(
  z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
  })
);

// -------------------- helpers --------------------

function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const r = Math.floor(Math.random() * 90000) + 10000;
  return `CM-${y}-${r}`;
}

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
    vatRate: VAT_RATE,
    vatRon,
    shippingFeeRon,
    paymentFeeRon,
    totalRon,
  };
}

function buildOrderCreateData({ userId = null, checkout, items, totals }) {
  return {
    orderNumber: makeOrderNumber(),
    status: "PENDING",
    userId,

    customerName: checkout.customerName,
    customerEmail: checkout.customerEmail,
    customerPhone: checkout.customerPhone,

    shippingCounty: checkout.shippingCounty,
    shippingCity: checkout.shippingCity,
    shippingStreet:
      checkout.shippingMethod === "EASYBOX" ? null : checkout.shippingStreet,
    shippingPostalCode: checkout.shippingPostalCode,

    easyboxLockerId:
      checkout.shippingMethod === "EASYBOX" ? checkout.easyboxLockerId : null,
    easyboxLockerName:
      checkout.shippingMethod === "EASYBOX" ? checkout.easyboxLockerName : null,
    easyboxCity:
      checkout.shippingMethod === "EASYBOX" ? checkout.easyboxCity : null,

    shippingMethod: checkout.shippingMethod,
    shippingFeeRon: totals.shippingFeeRon,

    paymentMethod: checkout.paymentMethod,
    paymentFeeRon: totals.paymentFeeRon,

    subtotalRon: totals.subtotalRon,
    vatRate: totals.vatRate,
    vatRon: totals.vatRon,
    totalRon: totals.totalRon,

    items: {
      create: items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        brand: it.brand,
        category: it.category,
        unitPriceRon: it.unitPriceRon,
        quantity: it.quantity,
        lineTotalRon: it.lineTotalRon,
      })),
    },
  };
}

function normalizeUserCartItems(cart) {
  return (cart.items || []).map((it) => {
    if (!it.product) {
      throw new Error("Produs invalid în coș.");
    }

    return {
      productId: it.productId,
      productName: it.product.name,
      brand: it.product.brand,
      category: it.product.category,
      unitPriceRon: it.unitPriceRon,
      quantity: it.quantity,
      lineTotalRon: it.unitPriceRon * it.quantity,
      stock: it.product.stock,
    };
  });
}

function normalizeGuestItems(items, byId) {
  return items.map((it) => {
    const p = byId.get(it.productId);

    if (!p) {
      throw new Error(`Produs inexistent: ${it.productId}`);
    }

    return {
      productId: p.id,
      productName: p.name,
      brand: p.brand,
      category: p.category,
      unitPriceRon: p.priceRon,
      quantity: it.quantity,
      lineTotalRon: p.priceRon * it.quantity,
      stock: p.stock,
    };
  });
}

// -------------------- service --------------------

export class OrdersService {
  constructor(ordersRepo, prisma) {
    this.ordersRepo = ordersRepo;
    this.prisma = prisma;
  }

  // =========================================================
  // PREPARE METHODS
  // Acestea sunt pentru flow-ul Stripe:
  // validează + calculează totalul, DAR NU creează comanda.
  // =========================================================

  async prepareUserCartCheckout(userId, body) {
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error(
        parsed.error.issues?.[0]?.message || "Date checkout invalide."
      );
    }

    const cart = await this.ordersRepo.getCartForUser(userId);
    if (!cart || !cart.items?.length) {
      throw new Error("Coșul este gol.");
    }

    const normalizedItems = normalizeUserCartItems(cart);

    for (const it of normalizedItems) {
      if (it.stock < it.quantity) {
        throw new Error(`Stoc insuficient pentru: ${it.productName}`);
      }
    }

    const subtotalRon = normalizedItems.reduce(
      (sum, it) => sum + it.lineTotalRon,
      0
    );

    const totals = computeTotals(
      subtotalRon,
      parsed.data.shippingMethod,
      parsed.data.paymentMethod
    );

    return {
      checkout: parsed.data,
      cartId: cart.id,
      items: normalizedItems,
      ...totals,
    };
  }

  async prepareGuestCheckout(items, body) {
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error(
        parsed.error.issues?.[0]?.message || "Date checkout invalide."
      );
    }

    const itemsParsed = GuestItemsSchema.safeParse(items);
    if (!itemsParsed.success) {
      throw new Error("Items invalide.");
    }

    const ids = itemsParsed.data.map((x) => x.productId);
    const products = await this.ordersRepo.findProductsByIds(ids);
    const byId = new Map(products.map((p) => [p.id, p]));

    const normalizedItems = normalizeGuestItems(itemsParsed.data, byId);

    for (const it of normalizedItems) {
      if (it.stock < it.quantity) {
        throw new Error(`Stoc insuficient: ${it.productName}`);
      }
    }

    const subtotalRon = normalizedItems.reduce(
      (sum, it) => sum + it.lineTotalRon,
      0
    );

    const totals = computeTotals(
      subtotalRon,
      parsed.data.shippingMethod,
      parsed.data.paymentMethod
    );

    return {
      checkout: parsed.data,
      items: normalizedItems,
      ...totals,
    };
  }

  // =========================================================
  // FINALIZE METHODS
  // Acestea creează comanda efectiv și fac side effects.
  // Pentru CARD trebuie apelate DOAR după plata reușită.
  // =========================================================

  async checkoutFromUserCart(userId, body) {
    const prepared = await this.prepareUserCartCheckout(userId, body);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await this.ordersRepo.createOrder(
        {
          data: buildOrderCreateData({
            userId,
            checkout: prepared.checkout,
            items: prepared.items,
            totals: {
              subtotalRon: prepared.subtotalRon,
              vatRate: VAT_RATE,
              vatRon: prepared.vatRon,
              shippingFeeRon: prepared.shippingFeeRon,
              paymentFeeRon: prepared.paymentFeeRon,
              totalRon: prepared.totalRon,
            },
          }),
          include: { items: true },
        },
        tx
      );

      for (const it of prepared.items) {
        await this.ordersRepo.decrementProductStock(
          it.productId,
          it.quantity,
          tx
        );
      }

      await this.ordersRepo.clearCart(prepared.cartId, tx);

      return created;
    });

    return order;
  }

  async guestCheckout(items, body) {
    const prepared = await this.prepareGuestCheckout(items, body);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await this.ordersRepo.createOrder(
        {
          data: buildOrderCreateData({
            userId: null,
            checkout: prepared.checkout,
            items: prepared.items,
            totals: {
              subtotalRon: prepared.subtotalRon,
              vatRate: VAT_RATE,
              vatRon: prepared.vatRon,
              shippingFeeRon: prepared.shippingFeeRon,
              paymentFeeRon: prepared.paymentFeeRon,
              totalRon: prepared.totalRon,
            },
          }),
          include: { items: true },
        },
        tx
      );

      for (const it of prepared.items) {
        await this.ordersRepo.decrementProductStock(
          it.productId,
          it.quantity,
          tx
        );
      }

      return created;
    });

    return order;
  }

  // =========================================================
  // READ METHODS
  // =========================================================

  listMyOrders(userId) {
    return this.ordersRepo.listMyOrders(userId);
  }

  async getMyOrder(orderId, userId) {
    const order = await this.ordersRepo.getMyOrder(orderId, userId);
    if (!order) {
      throw new Error("Comanda nu există.");
    }
    return order;
  }
}