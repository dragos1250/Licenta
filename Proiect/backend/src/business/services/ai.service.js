import OpenAI from "openai";

const VAT_RATE = 0.21;
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_USER_LIMIT = 10;
const DEFAULT_ADMIN_LIMIT = 100;

const CORE_BUILD_SLOTS = [
  "cpu",
  "motherboard",
  "gpu",
  "ram",
  "storage",
  "psu",
  "case",
];

const SLOT_LABELS = {
  cpu: "Procesor",
  motherboard: "Placă de bază",
  gpu: "Placă video",
  ram: "Memorie RAM",
  storage: "Stocare",
  psu: "Sursă",
  case: "Carcasă",
  cooler: "Cooler",
  monitor: "Monitor",
  keyboard: "Tastatură",
  mouse: "Mouse",
  headset: "Căști",
  microphone: "Microfon",
  webcam: "Webcam",
  other: "Produs",
};

const SLOT_BUDGET_SHARE = {
  cpu: 0.2,
  motherboard: 0.13,
  gpu: 0.42,
  ram: 0.1,
  storage: 0.1,
  psu: 0.08,
  case: 0.07,
  cooler: 0.06,
  monitor: 0.22,
  keyboard: 0.04,
  mouse: 0.03,
  headset: 0.04,
  microphone: 0.04,
  webcam: 0.04,
};

const OFF_TOPIC_REPLY =
  "Pot să te ajut doar cu subiecte legate de PC-uri, componente, periferice, monitoare, gaming pe PC, productivitate, upgrade-uri, compatibilitate sau configurarea unui sistem. Reformulează întrebarea în zona PC/hardware și te ajut cu plăcere.";

function parseEnvInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function hasAdminRole(auth) {
  const roles = Array.isArray(auth?.roles) ? auth.roles : [];
  return roles.some((role) => String(role).toUpperCase() === "ADMIN");
}

function normalizeModelName(value) {
  const raw = String(value || DEFAULT_MODEL).trim();

  const aliases = {
    "gpt-4.0-mini": "gpt-4o-mini",
    "gpt-4o mini": "gpt-4o-mini",
    "4o-mini": "gpt-4o-mini",
    "gpt-5 mini": "gpt-5-mini",
    "gpt-5.1 mini": "gpt-5.1-mini",
  };

  return aliases[raw.toLowerCase()] || raw;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function roundInt(value) {
  return Math.round(Number(value || 0));
}

function grossFromNet(net) {
  return roundInt(roundInt(net) * (1 + VAT_RATE));
}

function parseBudgetNumber(value) {
  const compact = String(value || "")
    .replace(/\s+/g, "")
    .replace(/[.,]/g, "");

  const parsed = Number(compact);

  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 100 || parsed > 1000000) return 0;

  return parsed;
}

function extractBudgetRon(message) {
  const text = normalizeText(message).replace(/\s+/g, " ");

  const rangeMatch = text.match(
    /(\d[\d\s.,]{2,})\s*[-–]\s*(\d[\d\s.,]{2,})\s*(?:de\s*)?(?:ron|lei)/i
  );

  if (rangeMatch?.[2]) return parseBudgetNumber(rangeMatch[2]);

  const patterns = [
    /(?:buget(?:ul)?|budget|maxim|max|pana la|sub|in limita|limita|plafon)\D{0,35}(\d[\d\s.,]{2,})\s*(?:de\s*)?(?:ron|lei)?/i,
    /(\d[\d\s.,]{2,})\s*(?:de\s*)?(?:ron|lei)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;

    const parsed = parseBudgetNumber(match[1]);
    if (parsed > 0) return parsed;
  }

  return 0;
}

function isPcRelatedMessage(message) {
  const text = normalizeText(message);

  const pcKeywords = [
    "pc",
    "calculator",
    "desktop",
    "laptop",
    "workstation",
    "configurator",
    "configexp",
    "componente",
    "componenta",
    "build",
    "sistem",
    "unitate",
    "gaming",
    "joc",
    "fps",
    "rezolutie",
    "1080p",
    "1440p",
    "4k",
    "procesor",
    "cpu",
    "placa video",
    "placi video",
    "gpu",
    "rtx",
    "gtx",
    "geforce",
    "radeon",
    "nvidia",
    "amd",
    "intel",
    "ryzen",
    "core i",
    "placa de baza",
    "motherboard",
    "am4",
    "am5",
    "lga",
    "ram",
    "ddr4",
    "ddr5",
    "ssd",
    "hdd",
    "nvme",
    "stocare",
    "sursa",
    "psu",
    "carcasa",
    "cooler",
    "racire",
    "aio",
    "ventilator",
    "monitor",
    "periferice",
    "tastatura",
    "keyboard",
    "mouse",
    "casti",
    "headset",
    "microfon",
    "webcam",
    "streaming",
    "editare video",
    "render",
    "blender",
    "premiere",
    "davinci",
    "photoshop",
    "programare",
    "coding",
    "upgrade",
    "compatibil",
    "compatibilitate",
    "bios",
    "driver",
    "windows",
    "linux",
    "wi-fi",
    "ethernet",
    "router",
    "nas",
    "server",
    "ray tracing",
    "path tracing",
    "dlss",
    "fsr",
    "g-sync",
    "freesync",
  ];

  return pcKeywords.some((keyword) => text.includes(keyword));
}

function normalizeRecentMessages(context = {}) {
  const recent = Array.isArray(context?.recentMessages) ? context.recentMessages : [];

  return recent
    .slice(-8)
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: String(entry.content || "").slice(0, 1400),
    }))
    .filter((entry) => entry.content);
}

function buildContextSearchText(message, context = {}) {
  const recent = normalizeRecentMessages(context)
    .map((entry) => entry.content)
    .join("\n");

  return `${recent}\n${message}`.trim();
}

function extractResponseText(response) {
  if (typeof response?.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const parts = [];

  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        parts.push(content.text);
      }

      if (typeof content?.refusal === "string" && content.refusal.trim()) {
        parts.push(content.refusal);
      }
    }
  }

  return parts.join("\n").trim();
}

function productText(product) {
  const specs = Array.isArray(product?.specifications)
    ? product.specifications
        .map((spec) => `${spec?.name || ""} ${spec?.value || ""}`)
        .join(" ")
    : "";

  return normalizeText(
    [
      product?.name,
      product?.brand,
      product?.category,
      product?.shortDescription,
      product?.description,
      product?.badge,
      specs,
    ].join(" ")
  );
}

function inferSlot(product) {
  const text = productText(product);

  if (/plac[ai] video|geforce|rtx|gtx|radeon|rx\s?\d|arc\s?[ab]\d|\bgpu\b/.test(text)) return "gpu";
  if (/procesor|\bcpu\b|ryzen|intel core|core i[3579]|threadripper/.test(text)) return "cpu";
  if (/plac[ai] de baza|placa de baza|motherboard|mainboard|mobo|\b(b450|b550|b650|b760|x570|x670|x870|h610|z690|z790|z890)\b|\bam4\b|\bam5\b|lga\s?1700|lga\s?1851/.test(text)) return "motherboard";
  if (/\bram\b|memorie|ddr4|ddr5|sodimm|dimm/.test(text)) return "ram";
  if (/ssd|hdd|nvme|m\.2|sata|stocare|storage/.test(text)) return "storage";
  if (/sursa|\bpsu\b|alimentare|80\+|gold|platinum|bronze/.test(text)) return "psu";
  if (/carcasa|case|mid tower|full tower|airflow/.test(text)) return "case";
  if (/cooler|racire|r[ăa]cire|aio|ventilator|water cooling/.test(text)) return "cooler";
  if (/monitor|display|ecran|oled|ips|va panel|144hz|165hz|180hz|240hz|qhd|uhd|4k|1440p/.test(text)) return "monitor";
  if (/tastatura|keyboard/.test(text)) return "keyboard";
  if (/mouse/.test(text)) return "mouse";
  if (/casti|headset|headphones/.test(text)) return "headset";
  if (/microfon|microphone/.test(text)) return "microphone";
  if (/webcam|camera/.test(text)) return "webcam";

  return "other";
}

function getRequestedSlots(message) {
  const text = normalizeText(message);
  const slots = [];

  const add = (slot) => {
    if (!slots.includes(slot)) slots.push(slot);
  };

  if (/plac[ai] video|placa video|placi video|\bgpu\b|rtx|radeon|geforce/.test(text)) add("gpu");
  if (/procesor|\bcpu\b|ryzen|intel core|core i[3579]/.test(text)) add("cpu");
  if (/plac[ai] de baza|placa de baza|motherboard|mainboard|mobo|\bam4\b|\bam5\b|lga/.test(text)) add("motherboard");
  if (/\bram\b|memorie|ddr4|ddr5/.test(text)) add("ram");
  if (/ssd|hdd|nvme|stocare|storage/.test(text)) add("storage");
  if (/sursa|\bpsu\b|alimentare|80\+|gold|platinum/.test(text)) add("psu");
  if (/carcasa|case|airflow/.test(text)) add("case");
  if (/cooler|racire|r[ăa]cire|aio|ventilator/.test(text)) add("cooler");
  if (/monitor|display|ecran|oled|144hz|165hz|180hz|240hz|4k|1440p|1080p/.test(text)) add("monitor");
  if (/tastatura|keyboard/.test(text)) add("keyboard");
  if (/mouse/.test(text)) add("mouse");
  if (/casti|headset/.test(text)) add("headset");
  if (/microfon|microphone/.test(text)) add("microphone");
  if (/webcam|camera/.test(text)) add("webcam");

  return slots;
}

function isBuildRequest(message) {
  const text = normalizeText(message);
  return /build|pc|sistem|configuratie|configurație|unitate|calculator|desktop|setup complet/.test(text);
}

function wantsMonitor(message) {
  const text = normalizeText(message);
  return /monitor|display|ecran|144hz|165hz|180hz|240hz|oled|qhd|uhd|4k|1440p|1080p/.test(text);
}

function wantsPeripherals(message) {
  const text = normalizeText(message);
  return /periferice|tastatura|keyboard|mouse|casti|headset|microfon|webcam|camera|setup complet/.test(text);
}

function wantsOnlyUnit(message) {
  const text = normalizeText(message);
  return /fara monitor|fara periferice|doar unitate|doar pc|doar sistem|unitatea/.test(text);
}

function wantsRayTracing(message) {
  const text = normalizeText(message);
  return /ray tracing|path tracing|pathtracing|rtx|dlss|metro|cyberpunk|alan wake|resident evil/.test(text);
}

function detectMode(message) {
  return isBuildRequest(message) ? "build" : "product";
}

function getRelevantSlots(message) {
  const requested = getRequestedSlots(message);

  if (isBuildRequest(message)) {
    const slots = [...CORE_BUILD_SLOTS];

    if (!wantsOnlyUnit(message) && wantsMonitor(message)) {
      slots.push("monitor");
    }

    if (!wantsOnlyUnit(message) && wantsPeripherals(message)) {
      slots.push("keyboard", "mouse", "headset", "microphone", "webcam");
    }

    return [...new Set(slots)];
  }

  if (requested.length > 0) return requested;

  return [
    "cpu",
    "motherboard",
    "gpu",
    "ram",
    "storage",
    "psu",
    "case",
    "cooler",
    "monitor",
    "keyboard",
    "mouse",
    "headset",
  ];
}

function normalizeProduct(product) {
  const slotKey = inferSlot(product);
  const netPriceRon = roundInt(product?.priceRon || 0);

  return {
    id: product.id,
    slotKey,
    slotLabel: SLOT_LABELS[slotKey] || "Produs",
    name: product.name,
    brand: product.brand,
    category: product.category,
    netPriceRon,
    grossPriceRon: grossFromNet(netPriceRon),
    stock: Number(product.stock || 0),
    shortDescription: product.shortDescription || "",
    specifications: Array.isArray(product.specifications)
      ? product.specifications.slice(0, 4).map((spec) => ({
          name: String(spec?.name || "").slice(0, 60),
          value: String(spec?.value || "").slice(0, 120),
        }))
      : [],
  };
}

function productScore(product, message, budgetRon = 0, mode = "product") {
  const text = normalizeText(message);
  const combined = normalizeText(
    `${product.name} ${product.brand} ${product.category} ${product.shortDescription}`
  );

  let score = 0;

  for (const token of text.split(/\s+/).filter((word) => word.length >= 3)) {
    if (combined.includes(token)) score += 3;
  }

  if (product.stock > 0) score += 20;

  if (wantsRayTracing(message) && product.slotKey === "gpu") {
    if (/nvidia|geforce|rtx/i.test(`${product.brand} ${product.name}`)) score += 60;
    if (/radeon|amd/i.test(`${product.brand} ${product.name}`)) score -= 25;
  }

  if (budgetRon > 0) {
    const maxGross =
      mode === "build"
        ? budgetRon * (SLOT_BUDGET_SHARE[product.slotKey] || 1)
        : budgetRon;

    if (product.grossPriceRon <= maxGross) score += 25;
    else score -= Math.min(50, Math.round((product.grossPriceRon - maxGross) / 120));
  }

  if (/x3d|7800x3d|9800x3d/i.test(product.name) && /gaming|joc|fps/.test(text)) score += 14;
  if (/4070|4070 super|4070 ti|4080|4090|5070|5080|5090/i.test(product.name) && /4k|1440p|ray|path|metro|cyberpunk/.test(text)) score += 18;
  if (/32gb|64gb/i.test(product.name) && /editare|video|4k|render|blender/.test(text)) score += 12;
  if (/2tb|4tb/i.test(product.name) && /editare|video|4k|stocare/.test(text)) score += 8;

  score += Math.min(10, Math.max(0, 10 - product.grossPriceRon / 2500));

  return score;
}

function gpuPerformanceRank(product) {
  const name = normalizeText(`${product.brand || ""} ${product.name || ""}`);

  const patterns = [
    [/rtx\s*5090|5090/, 990],
    [/rtx\s*5080|5080/, 940],
    [/rtx\s*4090|4090/, 920],
    [/rtx\s*4080\s*super|4080\s*super/, 880],
    [/rtx\s*4080|4080/, 860],
    [/rtx\s*5070\s*ti|5070\s*ti/, 830],
    [/rtx\s*4070\s*ti\s*super|4070\s*ti\s*super/, 810],
    [/rtx\s*4070\s*ti|4070\s*ti/, 790],
    [/rtx\s*5070|5070/, 760],
    [/rtx\s*4070\s*super|4070\s*super/, 740],
    [/rtx\s*4070|4070/, 700],
    [/rtx\s*4060\s*ti|4060\s*ti/, 620],
    [/rtx\s*4060|4060/, 580],
    [/rx\s*7900\s*xtx|7900\s*xtx/, 760],
    [/rx\s*7900\s*xt|7900\s*xt/, 720],
    [/rx\s*7800\s*xt|7800\s*xt/, 650],
    [/rx\s*7700\s*xt|7700\s*xt/, 600],
    [/rx\s*7600|7600/, 520],
  ];

  for (const [pattern, rank] of patterns) {
    if (pattern.test(name)) return rank;
  }

  if (/rtx/.test(name)) return 560;
  if (/geforce/.test(name)) return 520;
  if (/radeon|rx/.test(name)) return 500;

  return 0;
}

function compareByPriceDesc(a, b) {
  const priceDiff = b.grossPriceRon - a.grossPriceRon;
  if (priceDiff !== 0) return priceDiff;

  return compareProductsStable(a, b);
}

function compareGpuForRecommendation(a, b, message, budgetRon, mode) {
  const rankDiff = gpuPerformanceRank(b) - gpuPerformanceRank(a);
  const text = normalizeText(message);

  // Dacă userul cere ray/path tracing și nu a dat buget în mesajul curent,
  // vrem să vadă întâi vârful listei, nu doar plăcile mid-range.
  if (budgetRon <= 0 && (/ray|path|rtx|resident evil|metro|cyberpunk|alan wake/.test(text))) {
    if (rankDiff !== 0) return rankDiff;
    return compareByPriceDesc(a, b);
  }

  const scoreDiff =
    productScore(b, message, budgetRon, mode) -
    productScore(a, message, budgetRon, mode);

  if (Math.abs(scoreDiff) > 8) return scoreDiff;

  if (rankDiff !== 0) return rankDiff;

  return budgetRon > 0 ? compareProductsStable(a, b) : compareByPriceDesc(a, b);
}

function compareProductsStable(a, b) {
  const priceDiff = a.grossPriceRon - b.grossPriceRon;
  if (priceDiff !== 0) return priceDiff;

  const brandDiff = String(a.brand || "").localeCompare(String(b.brand || ""), "ro");
  if (brandDiff !== 0) return brandDiff;

  return String(a.name || "").localeCompare(String(b.name || ""), "ro");
}

function selectCatalogProducts(products, searchText, currentMessage = searchText) {
  const mode = detectMode(searchText);

  // Bugetul se ia DOAR din mesajul curent, nu din istoricul conversației.
  // Altfel un buget vechi, exemplu sau mesaj anterior poate filtra greșit recomandarea curentă.
  const budgetRon = extractBudgetRon(currentMessage);

  const slots = getRelevantSlots(searchText);

  const buildPerSlotLimit = parseEnvInt("AI_CATALOG_BUILD_PER_SLOT_LIMIT", 8);
  const productPerSlotLimit = parseEnvInt("AI_CATALOG_PRODUCT_PER_SLOT_LIMIT", 24);
  const totalLimit = parseEnvInt(
    "AI_CATALOG_TOTAL_LIMIT",
    mode === "build" ? 70 : 36
  );

  const normalized = (Array.isArray(products) ? products : [])
    .map(normalizeProduct)
    .filter(
      (product) =>
        product.id &&
        product.name &&
        product.stock > 0 &&
        product.slotKey !== "other"
    );

  const selected = [];

  for (const slotKey of slots) {
    const bySlot = normalized.filter((product) => product.slotKey === slotKey);

    if (mode === "product") {
      selected.push(
        ...bySlot
          .sort((a, b) => {
            if (slotKey === "gpu") {
              return compareGpuForRecommendation(a, b, searchText, budgetRon, mode);
            }

            const scoreDiff =
              productScore(b, searchText, budgetRon, mode) -
              productScore(a, searchText, budgetRon, mode);

            if (Math.abs(scoreDiff) > 8) return scoreDiff;

            // Fără buget explicit, pentru recomandări de categorie arătăm și variantele superioare.
            return budgetRon > 0 ? compareProductsStable(a, b) : compareByPriceDesc(a, b);
          })
          .slice(0, productPerSlotLimit)
      );

      continue;
    }

    selected.push(
      ...bySlot
        .sort((a, b) => {
          const scoreDiff =
            productScore(b, searchText, budgetRon, mode) -
            productScore(a, searchText, budgetRon, mode);

          if (Math.abs(scoreDiff) > 8) return scoreDiff;

          // La build cu buget, preferăm să nu alegem automat cele mai scumpe piese.
          if (budgetRon > 0) return compareProductsStable(a, b);

          if (slotKey === "gpu") {
            return compareGpuForRecommendation(a, b, searchText, budgetRon, mode);
          }

          return compareByPriceDesc(a, b);
        })
        .slice(0, buildPerSlotLimit)
    );
  }

  const unique = Array.from(
    new Map(selected.map((product) => [product.id, product])).values()
  );

  return {
    mode,
    budgetRon,
    slots,
    products: unique.slice(0, totalLimit),
    catalogLimits: {
      buildPerSlotLimit,
      productPerSlotLimit,
      totalLimit,
    },
    availableCountsBySlot: slots.reduce((acc, slotKey) => {
      acc[slotKey] = normalized.filter((product) => product.slotKey === slotKey).length;
      return acc;
    }, {}),
  };
}

function productCatalogLine(product) {
  const specs = product.specifications
    .map((spec) => `${spec.name}: ${spec.value}`)
    .join("; ");

  return [
    `ID: ${product.id}`,
    `Slot: ${product.slotLabel}`,
    `Nume exact: ${product.name}`,
    `Brand: ${product.brand}`,
    `Categorie DB: ${product.category}`,
    `Preț cu TVA: ${product.grossPriceRon} RON`,
    `Stoc: ${product.stock}`,
    product.shortDescription
      ? `Descriere: ${String(product.shortDescription).slice(0, 140)}`
      : "",
    specs ? `Specificații: ${specs}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function shrinkCatalog(catalog, totalLimit = 18) {
  const grouped = new Map();

  for (const product of catalog.products || []) {
    const key = product.slotKey || "other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(product);
  }

  const products = [];

  for (const slotKey of catalog.slots || []) {
    const bySlot = grouped.get(slotKey) || [];
    const limitPerSlot = catalog.mode === "build" ? 4 : 12;
    products.push(...bySlot.slice(0, limitPerSlot));
  }

  return {
    ...catalog,
    products: products.slice(0, totalLimit),
    catalogLimits: {
      ...(catalog.catalogLimits || {}),
      totalLimit,
      retryShrunk: true,
    },
  };
}

function buildProductCatalogText(catalog) {
  if (!catalog.products.length) {
    return "Nu există produse candidate relevante în baza de date pentru cererea curentă.";
  }

  const grouped = new Map();

  for (const product of catalog.products) {
    const key = product.slotKey || "other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(product);
  }

  return Array.from(grouped.entries())
    .map(([slotKey, products]) => {
      const label = SLOT_LABELS[slotKey] || slotKey;
      const lines = products.map(productCatalogLine).join("\n");
      return `SLOT DISPONIBIL: ${label} (${products.length} produse)\n${lines}`;
    })
    .join("\n\n");
}

function buildConversationInput({ message, context = {}, catalog }) {
  const recentMessages = normalizeRecentMessages(context);

  const history = recentMessages.length
    ? recentMessages
        .map((entry) => {
          const label = entry.role === "assistant" ? "AI ConfigEXP" : "Utilizator";
          return `${label}: ${entry.content}`;
        })
        .join("\n\n")
    : "Nu există istoric relevant.";

  return `
Istoric conversație:
${history}

Mesaj nou de la utilizator:
${message}

Mod detectat: ${catalog.mode === "build" ? "build complet / configurație" : "recomandare produs sau categorie"}
Buget detectat cu TVA din mesajul curent: ${catalog.budgetRon || "nespecificat"} RON
Categorii/sloturi relevante: ${catalog.slots.map((slot) => SLOT_LABELS[slot] || slot).join(", ")}

Sloturi care au produse candidate disponibile:
${Array.from(new Set(catalog.products.map((product) => product.slotKey)))
  .map((slot) => SLOT_LABELS[slot] || slot)
  .join(", ") || "niciun slot"}

Număr total produse disponibile în DB pentru sloturile relevante:
${Object.entries(catalog.availableCountsBySlot || {})
  .map(([slot, count]) => `${SLOT_LABELS[slot] || slot}: ${count}`)
  .join(", ") || "necunoscut"}

Produse trimise către AI în acest răspuns:
${catalog.products.length} produse, limită totală ${catalog.catalogLimits?.totalLimit || "n/a"}.

PRODUSE DISPONIBILE ÎN BAZA DE DATE:
${buildProductCatalogText(catalog)}
`.trim();
}

export class AiService {
  constructor(aiRepository, options = {}) {
    this.aiRepository = aiRepository;
    this.openai =
      options.openai ||
      new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
  }

  getDailyLimit(auth) {
    if (hasAdminRole(auth)) {
      return parseEnvInt("AI_DAILY_LIMIT_ADMIN", DEFAULT_ADMIN_LIMIT);
    }

    return parseEnvInt("AI_DAILY_LIMIT_USER", DEFAULT_USER_LIMIT);
  }

  async getUsageStatus(auth) {
    const userId = auth?.userId;

    if (!userId) {
      const error = new Error("Neautentificat.");
      error.status = 401;
      throw error;
    }

    const dateKey = this.aiRepository.getDateKey();
    const usage = await this.aiRepository.getUsageForDate(userId, dateKey);
    const limit = this.getDailyLimit(auth);
    const used = Number(usage?.count || 0);

    return {
      dateKey,
      used,
      limit,
      remaining: Math.max(limit - used, 0),
      isAdmin: hasAdminRole(auth),
    };
  }

  async assertAndIncrementUsage(auth) {
    const status = await this.getUsageStatus(auth);

    if (status.used >= status.limit) {
      const error = new Error(
        `Ai atins limita zilnică pentru asistentul AI (${status.limit} cereri/zi).`
      );
      error.status = 429;
      error.usage = status;
      throw error;
    }

    const usage = await this.aiRepository.incrementUsageForDate(
      auth.userId,
      status.dateKey
    );

    return {
      ...status,
      used: Number(usage.count || 0),
      remaining: Math.max(status.limit - Number(usage.count || 0), 0),
    };
  }

  buildInstructions() {
    return `
Ești AI ConfigEXP, asistent consultativ pentru un magazin online de componente PC din România.

Scop:
- Răspunzi doar la subiecte legate de PC-uri, componente, periferice, monitoare, gaming pe PC, productivitate, upgrade-uri, compatibilitate sau configurarea unui sistem.
- Dacă utilizatorul întreabă ceva complet în afara zonei PC/hardware, refuzi politicos și îl rogi să reformuleze în zona PC.
- Răspunzi ca un consultant uman.
- Recomanzi orientativ componente, build-uri sau criterii de alegere.
- Nu creezi carduri de produse.
- Nu adaugi produse în coș.
- Nu salvezi build-uri.
- Nu promiți că ai verificat automat compatibilitatea perfectă.

REGULĂ CRITICĂ DESPRE PRODUSE:
- Recomandă cu nume concret DOAR produse care apar în secțiunea „PRODUSE DISPONIBILE ÎN BAZA DE DATE”.
- Nu inventa modele, prețuri sau branduri care nu apar în listă.
- Dacă produsul ideal nu există în listă, spune: „Nu pare să fie disponibil exact acel model în magazin”, apoi oferă cele mai apropiate alternative DOAR din lista primită.
- Lista primită este catalogul permis pentru răspunsul curent. Chiar dacă există mai multe produse în DB, recomandă nominal doar din lista primită.
- Dacă vezi că există multe produse disponibile pentru un slot, dar lista trimisă e limitată, poți spune „din lista primită pentru acest răspuns”.
- Dacă lista de produse candidate este insuficientă, explică ce criterii ar trebui căutate în magazin, dar nu da nume de produse inexistente.
- Când menționezi un produs din listă, folosește numele exact și prețul cu TVA din listă.
- Dacă recomanzi un build, alege componentele doar din lista de produse disponibile în baza de date.
- NU spune că lipsește o categorie dacă există secțiune „SLOT DISPONIBIL” pentru acea categorie.
- Dacă există „SLOT DISPONIBIL: Placă video”, trebuie să propui o placă video din acea secțiune pentru build, chiar dacă bugetul cere compromis.
- Dacă bugetul nu ajunge pentru toate componentele, spune că depășește sau propune o variantă mai ieftină, dar nu pretinde că nu există produs.
- Dacă lipsește cu adevărat o categorie pentru build, spune clar ce lipsește în baza de date.

Cum răspunzi:
- Răspunde direct la întrebarea utilizatorului.
- Folosește română naturală.
- Pentru build-uri, NU te opri după introducere. Listează efectiv componentele recomandate.
- Pentru build complet, include obligatoriu: CPU, placă de bază, placă video, RAM, stocare, sursă, carcasă. Include cooler/monitor/periferice doar dacă sunt cerute și există în listă.
- Pentru ray tracing/path tracing/DLSS sau jocuri grele precum Metro, Cyberpunk, Alan Wake sau Resident Evil, prioritizează NVIDIA GeForce RTX dacă există în listă.
- Dacă bugetul este prea mic pentru tot ce cere, spune clar ce compromisuri ai face.
- Nu folosi Markdown cu **bold**, heading-uri ### sau tabele. Folosește text simplu și bullets clare.
- Pentru recomandări de categorie, recomandă maximum 5 produse, nu enumera toată lista primită.
- Dacă utilizatorul nu a dat buget în mesajul curent, include și variantele high-end / cele mai performante din lista primită, nu te opri doar la opțiuni mid-range.
- Pentru plăci video și ray tracing/path tracing, prezintă recomandările pe niveluri: high-end, echilibrat, buget.
- Pentru build-uri, recomandă o singură configurație clară, nu mai multe variante. Include toate sloturile relevante, nu te opri după 3-4 componente.
- Răspunsul trebuie să fie complet. Pentru build-uri ai voie până la 900-1200 de cuvinte dacă este nevoie ca să incluzi toate componentele. Pentru recomandări de categorie, rămâi mai scurt.
- Nu repeta toate produsele din catalog. Alege doar cele mai potrivite.
- La final, adaugă o frază scurtă: „Apoi poți selecta manual piesele în Configurator sau în pagina Componente.”
`.trim();
  }

  async createTextResponse({ model, message, context, catalog }) {
    return this.openai.responses.create({
      model,
      instructions: this.buildInstructions(),
      input: buildConversationInput({
        message,
        context,
        catalog,
      }),
      max_output_tokens: parseEnvInt("AI_MAX_OUTPUT_TOKENS", 3500),
    });
  }

  async buildAssistant({ auth, message, context = {} }) {
    if (!process.env.OPENAI_API_KEY) {
      const error = new Error("OPENAI_API_KEY lipsește din .env.");
      error.status = 500;
      throw error;
    }

    const searchText = buildContextSearchText(message, context);

    if (!isPcRelatedMessage(searchText)) {
      return {
        usage: await this.getUsageStatus(auth),
        result: {
          reply: OFF_TOPIC_REPLY,
          detectedNeeds: {
            budgetRon: 0,
            useCase: "off-topic",
            games: [],
            targetResolution: "",
            includesMonitor: false,
            needsFollowUp: false,
            mode: "chat",
          },
          recommendedBuild: {
            totalNetRon: 0,
            totalVatRon: 0,
            totalGrossRon: 0,
            items: [],
          },
          compatibilityNotes: [],
          missingCategories: [],
          followUpQuestions: [],
          warnings: [],
        },
        debug:
          process.env.AI_DEBUG === "true"
            ? {
                blockedByTopicGuard: true,
              }
            : undefined,
      };
    }

    const usage = await this.assertAndIncrementUsage(auth);
    const model = normalizeModelName(process.env.OPENAI_MODEL || DEFAULT_MODEL);

    const products = await this.aiRepository.findActiveProductsForAssistant();
    const catalog = selectCatalogProducts(products, searchText, message);

    let response = await this.createTextResponse({
      model,
      message,
      context,
      catalog,
    });

    let reply = extractResponseText(response);

    if (!reply && response?.incomplete_details?.reason === "max_output_tokens") {
      const compactCatalog = shrinkCatalog(catalog, catalog.mode === "build" ? 48 : 18);

      response = await this.createTextResponse({
        model,
        message: `${message}

Răspunde complet, dar fără introduceri lungi. Pentru recomandări, alege maximum 5 produse. Pentru build-uri, include toate componentele esențiale. Nu enumera tot catalogul.`,
        context,
        catalog: compactCatalog,
      });

      reply = extractResponseText(response);
    }

    if (!reply) {
      const error = new Error(
        `OpenAI nu a returnat text. Status: ${response?.status || "necunoscut"}. Motiv: ${
          response?.incomplete_details?.reason || "necunoscut"
        }.`
      );
      error.status = 502;
      throw error;
    }

    return {
      usage,
      result: {
        reply,
        detectedNeeds: {
          budgetRon: catalog.budgetRon,
          useCase: "consultativ",
          games: [],
          targetResolution: "",
          includesMonitor: catalog.slots.includes("monitor"),
          needsFollowUp: false,
          mode: catalog.mode,
        },
        recommendedBuild: {
          totalNetRon: 0,
          totalVatRon: 0,
          totalGrossRon: 0,
          items: [],
        },
        compatibilityNotes: [],
        missingCategories: [],
        followUpQuestions: [],
        warnings: [],
      },
      debug:
        process.env.AI_DEBUG === "true"
          ? {
              model,
              responseId: response?.id,
              responseStatus: response?.status,
              incompleteReason: response?.incomplete_details?.reason || null,
              catalogProductCount: catalog.products.length,
              catalogProductIds: catalog.products.map((product) => product.id),
              catalogSlots: Array.from(new Set(catalog.products.map((product) => product.slotKey))),
              catalogLimits: catalog.catalogLimits,
              availableCountsBySlot: catalog.availableCountsBySlot,
            }
          : undefined,
    };
  }
}
