const VAT_RATE = 0.21;

const REQUIRED_SLOT_KEYS = [
  "cpu",
  "gpu",
  "ram",
  "storage",
  "motherboard",
  "psu",
  "case",
];

const SLOT_ORDER = {
  cpu: 1,
  motherboard: 2,
  gpu: 3,
  ram: 4,
  storage: 5,
  psu: 6,
  case: 7,
  cooling: 8,
};

const SLOT_LABELS = {
  cpu: "Procesor",
  gpu: "Placă video",
  ram: "Memorie RAM",
  storage: "Stocare",
  motherboard: "Placă de bază",
  psu: "Sursă alimentare",
  case: "Carcasă",
  cooling: "Cooler",
};

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeName(name) {
  if (typeof name !== "string") return "";
  return name.trim().slice(0, 120);
}

function buildDefaultName() {
  const now = new Date();
  return `Build ${now.toLocaleString("ro-RO")}`;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && item.slotId && item.productId)
    .map((item) => ({
      slotId: String(item.slotId).trim(),
      slotLabel:
        typeof item.slotName === "string" && item.slotName.trim()
          ? item.slotName.trim()
          : SLOT_LABELS[item.slotId] || String(item.slotId).trim(),
      productId: String(item.productId).trim(),
    }));
}

function sortItemsBySlot(items) {
  return [...items].sort((a, b) => {
    const aOrder = SLOT_ORDER[a.slotKey] ?? 999;
    const bOrder = SLOT_ORDER[b.slotKey] ?? 999;
    return aOrder - bOrder;
  });
}

export class BuildsService {
  constructor(buildsRepository) {
    this.buildsRepository = buildsRepository;
  }

  async createBuild(userId, payload) {
    if (!userId) {
      throw createHttpError(401, "Utilizator neautentificat.");
    }

    const items = normalizeItems(payload?.items);

    if (!items.length) {
      throw createHttpError(400, "Nu există produse selectate pentru salvare.");
    }

    const uniqueSlotIds = new Set(items.map((item) => item.slotId));
    if (uniqueSlotIds.size !== items.length) {
      throw createHttpError(
        400,
        "Aceeași poziție din configurator nu poate fi salvată de două ori."
      );
    }

    const missingRequiredSlots = REQUIRED_SLOT_KEYS.filter(
      (slotKey) => !uniqueSlotIds.has(slotKey)
    );

    if (missingRequiredSlots.length > 0) {
      throw createHttpError(
        400,
        `Build-ul nu este complet. Lipsesc: ${missingRequiredSlots
          .map((slotKey) => SLOT_LABELS[slotKey] || slotKey)
          .join(", ")}.`
      );
    }

    const productIds = items.map((item) => item.productId);
    const products = await this.buildsRepository.findActiveProductsByIds(productIds);

    if (products.length !== productIds.length) {
      throw createHttpError(
        400,
        "Unele produse nu mai există sau nu mai sunt active."
      );
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const totalNetRon = items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.priceRon || 0);
    }, 0);

    const totalVatRon = Math.round(totalNetRon * VAT_RATE);
    const totalGrossRon = totalNetRon + totalVatRon;

    const compatibility = payload?.compatibility || {};

    const created = await this.buildsRepository.createBuild({
      userId,
      name: sanitizeName(payload?.name) || buildDefaultName(),
      totalNetRon,
      vatRate: VAT_RATE,
      totalVatRon,
      totalGrossRon,
      isCompatible: compatibility.isCompatible !== false,
      estimatedSystemPowerW: Number(compatibility.estimatedSystemPowerW || 0),
      recommendedPsuW: Number(compatibility.recommendedPsuW || 0),
      items: items.map((item) => {
        const product = productMap.get(item.productId);

        return {
          productId: product.id,
          slotKey: item.slotId,
          slotLabel: item.slotLabel,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          imageUrl: product.imageUrl || null,
          unitPriceRon: product.priceRon,
          quantity: 1,
        };
      }),
    });

    return {
      ...created,
      items: sortItemsBySlot(created.items),
    };
  }

  async getMyBuilds(userId) {
    if (!userId) {
      throw createHttpError(401, "Utilizator neautentificat.");
    }

    const rows = await this.buildsRepository.findManyByUserId(userId);

    return rows.map((row) => ({
      ...row,
      items: sortItemsBySlot(row.items),
    }));
  }

  async deleteBuild(userId, buildId) {
    if (!userId) {
      throw createHttpError(401, "Utilizator neautentificat.");
    }

    const existing = await this.buildsRepository.findByIdAndUserId(buildId, userId);

    if (!existing) {
      throw createHttpError(404, "Build-ul nu a fost găsit.");
    }

    await this.buildsRepository.deleteById(buildId);

    return { success: true };
  }
}