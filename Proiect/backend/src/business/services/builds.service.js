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

function normalizeSlotKey(value) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["cpu", "procesor", "procesoare"].includes(normalized)) return "cpu";
  if (["gpu", "placa video", "placi video"].includes(normalized)) return "gpu";
  if (["ram", "memorie ram"].includes(normalized)) return "ram";
  if (["storage", "stocare", "ssd", "hdd"].includes(normalized)) return "storage";

  if (
    ["motherboard", "placa de baza", "placi de baza"].includes(normalized)
  ) {
    return "motherboard";
  }

  if (["psu", "sursa", "surse", "sursa alimentare"].includes(normalized)) {
    return "psu";
  }

  if (["case", "carcasa", "carcase"].includes(normalized)) return "case";
  if (["cooling", "cooler", "coolere"].includes(normalized)) return "cooling";

  return raw;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && (item.slotId || item.slotKey) && item.productId)
    .map((item) => {
      const slotId = normalizeSlotKey(item.slotId || item.slotKey);

      return {
        slotId,
        slotLabel:
          typeof item.slotName === "string" && item.slotName.trim()
            ? item.slotName.trim()
            : typeof item.slotLabel === "string" && item.slotLabel.trim()
            ? item.slotLabel.trim()
            : SLOT_LABELS[slotId] || slotId,
        productId: String(item.productId).trim(),
        quantity: Math.max(1, Number(item.quantity || 1)),
      };
    });
}

function normalizeExistingBuildItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && item.productId && item.slotKey)
    .map((item) => ({
      slotId: normalizeSlotKey(item.slotKey),
      slotLabel: item.slotLabel || SLOT_LABELS[item.slotKey] || item.slotKey,
      productId: item.productId,
      quantity: Math.max(1, Number(item.quantity || 1)),
    }));
}

function validateUniqueSlots(items) {
  const uniqueSlotIds = new Set(items.map((item) => item.slotId));

  if (uniqueSlotIds.size !== items.length) {
    throw createHttpError(
      400,
      "Aceeași poziție din configurator nu poate fi salvată de două ori."
    );
  }

  return uniqueSlotIds;
}

function validateRequiredSlots(uniqueSlotIds) {
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
}

function sortItemsBySlot(items) {
  return [...items].sort((a, b) => {
    const aOrder = SLOT_ORDER[a.slotKey] ?? 999;
    const bOrder = SLOT_ORDER[b.slotKey] ?? 999;
    return aOrder - bOrder;
  });
}

function buildSelectedMap(items) {
  return items.reduce((acc, item) => {
    acc[item.slotId] = item.productId;
    return acc;
  }, {});
}

export class BuildsService {
  constructor(buildsRepository, configuratorService = null) {
    this.buildsRepository = buildsRepository;
    this.configuratorService = configuratorService;
  }

  async buildCompatibility(items, fallbackCompatibility = {}) {
    if (!this.configuratorService) {
      return fallbackCompatibility || {};
    }

    return this.configuratorService.validateConfiguration(buildSelectedMap(items));
  }

  async createBuild(userId, payload) {
    if (!userId) {
      throw createHttpError(401, "Utilizator neautentificat.");
    }

    const items = normalizeItems(payload?.items);

    if (!items.length) {
      throw createHttpError(400, "Nu există produse selectate pentru salvare.");
    }

    const uniqueSlotIds = validateUniqueSlots(items);
    validateRequiredSlots(uniqueSlotIds);

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
      return sum + Number(product?.priceRon || 0) * Number(item.quantity || 1);
    }, 0);

    const totalVatRon = Math.round(totalNetRon * VAT_RATE);
    const totalGrossRon = Math.round(totalNetRon + totalVatRon);

    const compatibility = await this.buildCompatibility(
      items,
      payload?.compatibility || {}
    );

    const created = await this.buildsRepository.createBuild({
      userId,
      name: sanitizeName(payload?.name) || buildDefaultName(),
      totalNetRon: Math.round(totalNetRon),
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
          quantity: item.quantity,
        };
      }),
    });

    return {
      ...created,
      items: sortItemsBySlot(created.items),
    };
  }

  async updateBuild(userId, buildId, payload) {
    if (!userId) {
      throw createHttpError(401, "Utilizator neautentificat.");
    }

    const existing = await this.buildsRepository.findByIdAndUserIdWithItems(
      buildId,
      userId
    );

    if (!existing) {
      throw createHttpError(404, "Build-ul nu a fost găsit.");
    }

    const name = sanitizeName(payload?.name) || existing.name;
    const items = Array.isArray(payload?.items)
      ? normalizeItems(payload.items)
      : normalizeExistingBuildItems(existing.items);

    if (!items.length) {
      throw createHttpError(400, "Nu există produse selectate pentru salvare.");
    }

    const uniqueSlotIds = validateUniqueSlots(items);
    validateRequiredSlots(uniqueSlotIds);

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
      return sum + Number(product?.priceRon || 0) * Number(item.quantity || 1);
    }, 0);

    const totalVatRon = Math.round(totalNetRon * VAT_RATE);
    const totalGrossRon = Math.round(totalNetRon + totalVatRon);

    const compatibility = await this.buildCompatibility(items, {
      isCompatible: existing.isCompatible,
      estimatedSystemPowerW: existing.estimatedSystemPowerW,
      recommendedPsuW: existing.recommendedPsuW,
    });

    const updated = await this.buildsRepository.updateBuild({
      buildId,
      name,
      totalNetRon: Math.round(totalNetRon),
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
          quantity: item.quantity,
        };
      }),
    });

    return {
      ...updated,
      items: sortItemsBySlot(updated.items),
      compatibility,
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
