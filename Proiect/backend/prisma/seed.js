// backend/prisma/seed.js
import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function chunkArray(arr, size = 200) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function stock(max = 30) {
  return Math.floor(Math.random() * max);
}

function rating(min = 4.2, max = 5.0) {
  return Number((Math.random() * (max - min) + min).toFixed(1));
}

function reviews(min = 15, max = 500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function originalPrice(price) {
  return Math.round(price * 1.12);
}

const IMG = {
  cpu: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=60",
  gpu: "https://images.unsplash.com/photo-1612198188060-c7c2a3b8840b?auto=format&fit=crop&w=1200&q=60",
  ram: "https://images.unsplash.com/photo-1587202372775-a3f1d9d066b1?auto=format&fit=crop&w=1200&q=60",
  storage: "https://images.unsplash.com/photo-1625834505597-1b0d9f7f0e2b?auto=format&fit=crop&w=1200&q=60",
  mb: "https://images.unsplash.com/photo-1612198188060-c7c2a3b8840b?auto=format&fit=crop&w=1200&q=60",
  psu: "https://images.unsplash.com/photo-1587202372775-a3f1d9d066b1?auto=format&fit=crop&w=1200&q=60",
  case: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=60",
  cooler: "https://images.unsplash.com/photo-1605648916361-9bc12ad27db5?auto=format&fit=crop&w=1200&q=60",
};

function makeProduct(data) {
  return {
    imageUrl: null,
    originalPriceRon: originalPrice(data.priceRon),
    rating: rating(),
    reviews: reviews(),
    badge: null,
    stock: stock(30),
    isActive: true,
    ...data,
  };
}

// =========================
// COMPATIBILITY INFERENCE
// =========================

function inferCpuCompatibility(name) {
  const n = name.toLowerCase();

  if (n.includes("ryzen 5 5600")) {
    return {
      socket: "AM4",
      cpuTdpW: 65,
      ramType: "DDR4",
      integratedGraphics: false,
    };
  }

  if (n.includes("ryzen 5 7600x")) {
    return {
      socket: "AM5",
      cpuTdpW: 105,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 5 7600")) {
    return {
      socket: "AM5",
      cpuTdpW: 65,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 7 7700x")) {
    return {
      socket: "AM5",
      cpuTdpW: 105,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 7 7700")) {
    return {
      socket: "AM5",
      cpuTdpW: 65,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 7 7800x3d")) {
    return {
      socket: "AM5",
      cpuTdpW: 120,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 5 9600x")) {
    return {
      socket: "AM5",
      cpuTdpW: 65,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 5 9600")) {
    return {
      socket: "AM5",
      cpuTdpW: 65,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 7 9700x")) {
    return {
      socket: "AM5",
      cpuTdpW: 65,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 9 9950x3d")) {
    return {
      socket: "AM5",
      cpuTdpW: 170,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 9 9900x3d")) {
    return {
      socket: "AM5",
      cpuTdpW: 120,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 9 9900x")) {
    return {
      socket: "AM5",
      cpuTdpW: 120,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 9 7900x")) {
    return {
      socket: "AM5",
      cpuTdpW: 170,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 9 7950x")) {
    return {
      socket: "AM5",
      cpuTdpW: 170,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("ryzen 9 9950x")) {
    return {
      socket: "AM5",
      cpuTdpW: 170,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("core ultra 9 285k")) {
    return {
      socket: "LGA1851",
      cpuTdpW: 250,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("core ultra 7 265k")) {
    return {
      socket: "LGA1851",
      cpuTdpW: 200,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("core ultra 5 245k")) {
    return {
      socket: "LGA1851",
      cpuTdpW: 159,
      ramType: "DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("i5-12400f")) {
    return {
      socket: "LGA1700",
      cpuTdpW: 117,
      ramType: "DDR4_DDR5",
      integratedGraphics: false,
    };
  }

  if (n.includes("i5-13600k")) {
    return {
      socket: "LGA1700",
      cpuTdpW: 181,
      ramType: "DDR4_DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("i5-14600k")) {
    return {
      socket: "LGA1700",
      cpuTdpW: 181,
      ramType: "DDR4_DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("i7-13700k")) {
    return {
      socket: "LGA1700",
      cpuTdpW: 253,
      ramType: "DDR4_DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("i7-14700k")) {
    return {
      socket: "LGA1700",
      cpuTdpW: 253,
      ramType: "DDR4_DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("i9-13900k")) {
    return {
      socket: "LGA1700",
      cpuTdpW: 253,
      ramType: "DDR4_DDR5",
      integratedGraphics: true,
    };
  }

  if (n.includes("i9-14900k")) {
    return {
      socket: "LGA1700",
      cpuTdpW: 253,
      ramType: "DDR4_DDR5",
      integratedGraphics: true,
    };
  }

  return null;
}

function inferMotherboardCompatibility(name) {
  const n = name.toLowerCase();

  const isMatx =
    n.includes("b650m") ||
    n.includes("b760m") ||
    n.includes("b860m") ||
    n.includes("m-a") ||
    n.includes("pro rs");

  if (n.includes("z890") || n.includes("b860")) {
    return {
      socket: "LGA1851",
      ramType: "DDR5",
      maxRamSpeedMHz: 8800,
      maxRamCapacityGb: 192,
      ramSlots: 4,
      formFactor: isMatx ? "mATX" : "ATX",
      m2Slots: 4,
      sataPorts: 4,
    };
  }

  if (n.includes("b650")) {
    return {
      socket: "AM5",
      ramType: "DDR5",
      maxRamSpeedMHz: 6400,
      maxRamCapacityGb: 128,
      ramSlots: 4,
      formFactor: isMatx ? "mATX" : "ATX",
      m2Slots: 3,
      sataPorts: 4,
    };
  }

  if (n.includes("b760") || n.includes("z790")) {
    return {
      socket: "LGA1700",
      ramType: "DDR5",
      maxRamSpeedMHz: 7200,
      maxRamCapacityGb: 128,
      ramSlots: 4,
      formFactor: isMatx ? "mATX" : "ATX",
      m2Slots: 3,
      sataPorts: 4,
    };
  }

  return null;
}

function inferRamCompatibility(name) {
  const n = name.toLowerCase();

  const ramType = n.includes("ddr5")
    ? "DDR5"
    : n.includes("ddr4")
    ? "DDR4"
    : null;

  const speedMatch = n.match(/(\d{4,5})\s?mhz/i);
  const speedMHz = speedMatch ? Number(speedMatch[1]) : null;

  const kitMatch = n.match(/(\d+)\s?gb\s*\((\d+)x(\d+)\)/i);
  if (kitMatch) {
    return {
      ramType,
      speedMHz,
      capacityGb: Number(kitMatch[1]),
      modules: Number(kitMatch[2]),
    };
  }

  const singleMatch = n.match(/(\d+)\s?gb/i);
  return {
    ramType,
    speedMHz,
    capacityGb: singleMatch ? Number(singleMatch[1]) : null,
    modules: 1,
  };
}

function inferGpuCompatibility(name) {
  const n = name.toLowerCase();

  if (n.includes("rtx 5090")) {
    return {
      gpuLengthMm: 340,
      gpuThicknessSlots: 4,
      gpuPowerW: 575,
      recommendedPsuW: 1000,
      powerConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 },
    };
  }

  if (n.includes("rtx 5080")) {
    return {
      gpuLengthMm: 320,
      gpuThicknessSlots: 3,
      gpuPowerW: 360,
      recommendedPsuW: 850,
      powerConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 },
    };
  }

  if (n.includes("rtx 5070 ti")) {
    return {
      gpuLengthMm: 310,
      gpuThicknessSlots: 3,
      gpuPowerW: 300,
      recommendedPsuW: 750,
      powerConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 },
    };
  }

  if (n.includes("rtx 5070")) {
    return {
      gpuLengthMm: 290,
      gpuThicknessSlots: 2,
      gpuPowerW: 250,
      recommendedPsuW: 650,
      powerConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 },
    };
  }

  if (n.includes("rtx 4060 ti")) {
    return {
      gpuLengthMm: 260,
      gpuThicknessSlots: 2,
      gpuPowerW: 160,
      recommendedPsuW: 550,
      powerConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rtx 4060")) {
    return {
      gpuLengthMm: 250,
      gpuThicknessSlots: 2,
      gpuPowerW: 115,
      recommendedPsuW: 550,
      powerConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rtx 4070 ti super")) {
    return {
      gpuLengthMm: 305,
      gpuThicknessSlots: 3,
      gpuPowerW: 285,
      recommendedPsuW: 750,
      powerConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 },
    };
  }

  if (n.includes("rtx 4070 super")) {
    return {
      gpuLengthMm: 300,
      gpuThicknessSlots: 3,
      gpuPowerW: 220,
      recommendedPsuW: 650,
      powerConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rtx 4070")) {
    return {
      gpuLengthMm: 285,
      gpuThicknessSlots: 2,
      gpuPowerW: 200,
      recommendedPsuW: 650,
      powerConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rtx 4080 super")) {
    return {
      gpuLengthMm: 320,
      gpuThicknessSlots: 3,
      gpuPowerW: 320,
      recommendedPsuW: 850,
      powerConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 },
    };
  }

  if (n.includes("rtx 4090")) {
    return {
      gpuLengthMm: 340,
      gpuThicknessSlots: 4,
      gpuPowerW: 450,
      recommendedPsuW: 1000,
      powerConnectors: { pin8: 0, pin6: 0, pin12vhpwr: 1 },
    };
  }

  if (n.includes("rx 9060 xt")) {
    return {
      gpuLengthMm: 255,
      gpuThicknessSlots: 2,
      gpuPowerW: 180,
      recommendedPsuW: 550,
      powerConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rx 9070 xt")) {
    return {
      gpuLengthMm: 300,
      gpuThicknessSlots: 3,
      gpuPowerW: 304,
      recommendedPsuW: 750,
      powerConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rx 9070")) {
    return {
      gpuLengthMm: 290,
      gpuThicknessSlots: 3,
      gpuPowerW: 220,
      recommendedPsuW: 650,
      powerConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rx 7600")) {
    return {
      gpuLengthMm: 250,
      gpuThicknessSlots: 2,
      gpuPowerW: 165,
      recommendedPsuW: 550,
      powerConnectors: { pin8: 1, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rx 7700 xt")) {
    return {
      gpuLengthMm: 300,
      gpuThicknessSlots: 3,
      gpuPowerW: 245,
      recommendedPsuW: 700,
      powerConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rx 7800 xt")) {
    return {
      gpuLengthMm: 305,
      gpuThicknessSlots: 3,
      gpuPowerW: 263,
      recommendedPsuW: 700,
      powerConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rx 7900 xtx")) {
    return {
      gpuLengthMm: 330,
      gpuThicknessSlots: 3,
      gpuPowerW: 355,
      recommendedPsuW: 850,
      powerConnectors: { pin8: 3, pin6: 0, pin12vhpwr: 0 },
    };
  }

  if (n.includes("rx 7900 xt")) {
    return {
      gpuLengthMm: 315,
      gpuThicknessSlots: 3,
      gpuPowerW: 315,
      recommendedPsuW: 750,
      powerConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 },
    };
  }

  return null;
}

function inferPsuCompatibility(name) {
  const n = name.toLowerCase();
  const wattMatch = n.match(/(\d{3,4})w/i);
  const wattage = wattMatch ? Number(wattMatch[1]) : null;

  return {
    wattage,
    efficiency: n.includes("gold")
      ? "80+ Gold"
      : n.includes("bronze")
      ? "80+ Bronze"
      : null,
    connectors: {
      pin8: wattage >= 1000 ? 4 : wattage >= 850 ? 3 : 2,
      pin6: 0,
      pin12vhpwr: wattage >= 750 ? 1 : 0,
      sata: wattage >= 850 ? 10 : 8,
    },
  };
}

function inferCaseCompatibility(name) {
  const n = name.toLowerCase();

  if (n.includes("o11 dynamic evo")) {
    return {
      supportedFormFactors: ["ATX", "mATX", "Mini-ITX"],
      maxGpuLengthMm: 426,
      maxGpuThicknessSlots: 4,
      maxCoolerHeightMm: 167,
      supportedRadiatorsMm: [240, 280, 360],
    };
  }

  if (n.includes("4000d airflow")) {
    return {
      supportedFormFactors: ["ATX", "mATX", "Mini-ITX"],
      maxGpuLengthMm: 360,
      maxGpuThicknessSlots: 4,
      maxCoolerHeightMm: 170,
      supportedRadiatorsMm: [240, 280, 360],
    };
  }

  if (n.includes("h7 flow")) {
    return {
      supportedFormFactors: ["ATX", "mATX", "Mini-ITX"],
      maxGpuLengthMm: 400,
      maxGpuThicknessSlots: 4,
      maxCoolerHeightMm: 185,
      supportedRadiatorsMm: [240, 280, 360],
    };
  }

  if (n.includes("meshify 2")) {
    return {
      supportedFormFactors: ["ATX", "mATX", "Mini-ITX"],
      maxGpuLengthMm: 430,
      maxGpuThicknessSlots: 4,
      maxCoolerHeightMm: 185,
      supportedRadiatorsMm: [240, 280, 360],
    };
  }

  return {
    supportedFormFactors: ["ATX", "mATX", "Mini-ITX"],
    maxGpuLengthMm: 340,
    maxGpuThicknessSlots: 3,
    maxCoolerHeightMm: 165,
    supportedRadiatorsMm: [240, 280, 360],
  };
}

function inferCoolerCompatibility(name) {
  const n = name.toLowerCase();

  if (n.includes("aio") || n.includes("kraken")) {
    const radiatorMatch = n.match(/(240|280|360)/);
    return {
      coolerType: "aio",
      supportedSockets: ["AM5", "AM4", "LGA1700", "LGA1851"],
      coolingTdpW: 280,
      radiatorSizeMm: radiatorMatch ? Number(radiatorMatch[1]) : 240,
    };
  }

  if (n.includes("nh-d15")) {
    return {
      coolerType: "air",
      supportedSockets: ["AM5", "AM4", "LGA1700", "LGA1851"],
      coolingTdpW: 220,
      coolerHeightMm: 165,
    };
  }

  if (n.includes("dark rock pro 4")) {
    return {
      coolerType: "air",
      supportedSockets: ["AM5", "AM4", "LGA1700", "LGA1851"],
      coolingTdpW: 250,
      coolerHeightMm: 163,
    };
  }

  if (n.includes("hyper 212")) {
    return {
      coolerType: "air",
      supportedSockets: ["AM5", "AM4", "LGA1700", "LGA1851"],
      coolingTdpW: 180,
      coolerHeightMm: 159,
    };
  }

  if (n.includes("ak620")) {
    return {
      coolerType: "air",
      supportedSockets: ["AM5", "AM4", "LGA1700", "LGA1851"],
      coolingTdpW: 260,
      coolerHeightMm: 160,
    };
  }

  return {
    coolerType: "air",
    supportedSockets: ["AM5", "AM4", "LGA1700", "LGA1851"],
    coolingTdpW: 200,
    coolerHeightMm: 160,
  };
}

function inferStorageCompatibility(name) {
  const n = name.toLowerCase();

  if (n.includes("nvme")) {
    return {
      storageType: "NVME",
      interface: "PCIe 4.0 x4",
    };
  }

  return {
    storageType: "SATA",
  };
}

function inferCompatibilityData(product) {
  switch (product.category) {
    case "Procesoare":
      return inferCpuCompatibility(product.name);
    case "Plăci video":
      return inferGpuCompatibility(product.name);
    case "Memorie RAM":
      return inferRamCompatibility(product.name);
    case "Stocare":
      return inferStorageCompatibility(product.name);
    case "Plăci de bază":
      return inferMotherboardCompatibility(product.name);
    case "Surse":
      return inferPsuCompatibility(product.name);
    case "Carcase":
      return inferCaseCompatibility(product.name);
    case "Coolere":
      return inferCoolerCompatibility(product.name);
    default:
      return null;
  }
}

const products = [
  // =========================
  // PROCESOARE
  // =========================
  makeProduct({ name: "AMD Ryzen 5 5600", brand: "AMD", category: "Procesoare", priceRon: 549, stock: stock(40), imageUrl: IMG.cpu, badge: "Best Value" }),
  makeProduct({ name: "AMD Ryzen 5 7600", brand: "AMD", category: "Procesoare", priceRon: 899, stock: stock(35), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 5 7600X", brand: "AMD", category: "Procesoare", priceRon: 999, stock: stock(30), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 7 7700", brand: "AMD", category: "Procesoare", priceRon: 1249, stock: stock(25), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 7 7700X", brand: "AMD", category: "Procesoare", priceRon: 1399, stock: stock(25), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 7 7800X3D", brand: "AMD", category: "Procesoare", priceRon: 1899, stock: stock(20), imageUrl: IMG.cpu, badge: "Gaming" }),
  makeProduct({ name: "AMD Ryzen 9 7900X", brand: "AMD", category: "Procesoare", priceRon: 2199, stock: stock(15), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 9 7950X", brand: "AMD", category: "Procesoare", priceRon: 3099, stock: stock(12), imageUrl: IMG.cpu, badge: "Flagship" }),

  makeProduct({ name: "AMD Ryzen 5 9600", brand: "AMD", category: "Procesoare", priceRon: 1199, stock: stock(18), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 5 9600X", brand: "AMD", category: "Procesoare", priceRon: 1399, stock: stock(18), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 7 9700X", brand: "AMD", category: "Procesoare", priceRon: 1899, stock: stock(16), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 9 9900X", brand: "AMD", category: "Procesoare", priceRon: 2599, stock: stock(12), imageUrl: IMG.cpu }),
  makeProduct({ name: "AMD Ryzen 9 9900X3D", brand: "AMD", category: "Procesoare", priceRon: 3199, stock: stock(10), imageUrl: IMG.cpu, badge: "Gaming" }),
  makeProduct({ name: "AMD Ryzen 9 9950X", brand: "AMD", category: "Procesoare", priceRon: 3499, stock: stock(10), imageUrl: IMG.cpu, badge: "Creator" }),
  makeProduct({ name: "AMD Ryzen 9 9950X3D", brand: "AMD", category: "Procesoare", priceRon: 3999, stock: stock(8), imageUrl: IMG.cpu, badge: "Ultimate" }),

  makeProduct({ name: "Intel Core i5-12400F", brand: "Intel", category: "Procesoare", priceRon: 649, stock: stock(40), imageUrl: IMG.cpu }),
  makeProduct({ name: "Intel Core i5-13600K", brand: "Intel", category: "Procesoare", priceRon: 1499, stock: stock(22), imageUrl: IMG.cpu }),
  makeProduct({ name: "Intel Core i5-14600K", brand: "Intel", category: "Procesoare", priceRon: 1599, stock: stock(20), imageUrl: IMG.cpu, badge: "Hot" }),
  makeProduct({ name: "Intel Core i7-13700K", brand: "Intel", category: "Procesoare", priceRon: 2199, stock: stock(15), imageUrl: IMG.cpu }),
  makeProduct({ name: "Intel Core i7-14700K", brand: "Intel", category: "Procesoare", priceRon: 2399, stock: stock(12), imageUrl: IMG.cpu }),
  makeProduct({ name: "Intel Core i9-13900K", brand: "Intel", category: "Procesoare", priceRon: 2899, stock: stock(10), imageUrl: IMG.cpu }),
  makeProduct({ name: "Intel Core i9-14900K", brand: "Intel", category: "Procesoare", priceRon: 3099, stock: stock(8), imageUrl: IMG.cpu, badge: "Top Tier" }),

  makeProduct({ name: "Intel Core Ultra 5 245K", brand: "Intel", category: "Procesoare", priceRon: 1699, stock: stock(14), imageUrl: IMG.cpu }),
  makeProduct({ name: "Intel Core Ultra 7 265K", brand: "Intel", category: "Procesoare", priceRon: 2399, stock: stock(10), imageUrl: IMG.cpu }),
  makeProduct({ name: "Intel Core Ultra 9 285K", brand: "Intel", category: "Procesoare", priceRon: 3299, stock: stock(8), imageUrl: IMG.cpu, badge: "AI Desktop" }),

  // =========================
  // PLĂCI VIDEO
  // =========================
  makeProduct({ name: "NVIDIA GeForce RTX 4060 8GB", brand: "NVIDIA", category: "Plăci video", priceRon: 1699, stock: stock(30), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 4060 Ti 16GB", brand: "NVIDIA", category: "Plăci video", priceRon: 2599, stock: stock(20), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 4070 12GB", brand: "NVIDIA", category: "Plăci video", priceRon: 3099, stock: stock(18), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 4070 SUPER 12GB", brand: "NVIDIA", category: "Plăci video", priceRon: 3499, stock: stock(15), imageUrl: IMG.gpu, badge: "1440p" }),
  makeProduct({ name: "NVIDIA GeForce RTX 4070 Ti SUPER 16GB", brand: "NVIDIA", category: "Plăci video", priceRon: 4699, stock: stock(10), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 4080 SUPER 16GB", brand: "NVIDIA", category: "Plăci video", priceRon: 5999, stock: stock(8), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 4090 24GB", brand: "NVIDIA", category: "Plăci video", priceRon: 8999, stock: stock(4), imageUrl: IMG.gpu, badge: "4K" }),

  makeProduct({ name: "NVIDIA GeForce RTX 5070 12GB", brand: "NVIDIA", category: "Plăci video", priceRon: 3999, stock: stock(10), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 5070 Ti 16GB", brand: "NVIDIA", category: "Plăci video", priceRon: 5399, stock: stock(8), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 5080 16GB", brand: "NVIDIA", category: "Plăci video", priceRon: 7699, stock: stock(6), imageUrl: IMG.gpu }),
  makeProduct({ name: "NVIDIA GeForce RTX 5090 32GB", brand: "NVIDIA", category: "Plăci video", priceRon: 12999, stock: stock(3), imageUrl: IMG.gpu, badge: "Ultimate" }),

  makeProduct({ name: "AMD Radeon RX 7600 8GB", brand: "AMD", category: "Plăci video", priceRon: 1499, stock: stock(28), imageUrl: IMG.gpu }),
  makeProduct({ name: "AMD Radeon RX 7700 XT 12GB", brand: "AMD", category: "Plăci video", priceRon: 2499, stock: stock(18), imageUrl: IMG.gpu }),
  makeProduct({ name: "AMD Radeon RX 7800 XT 16GB", brand: "AMD", category: "Plăci video", priceRon: 2899, stock: stock(15), imageUrl: IMG.gpu, badge: "Top Value" }),
  makeProduct({ name: "AMD Radeon RX 7900 XT 20GB", brand: "AMD", category: "Plăci video", priceRon: 3999, stock: stock(10), imageUrl: IMG.gpu }),
  makeProduct({ name: "AMD Radeon RX 7900 XTX 24GB", brand: "AMD", category: "Plăci video", priceRon: 4699, stock: stock(8), imageUrl: IMG.gpu }),

  makeProduct({ name: "AMD Radeon RX 9060 XT 16GB", brand: "AMD", category: "Plăci video", priceRon: 2399, stock: stock(10), imageUrl: IMG.gpu }),
  makeProduct({ name: "AMD Radeon RX 9070 16GB", brand: "AMD", category: "Plăci video", priceRon: 3699, stock: stock(8), imageUrl: IMG.gpu }),
  makeProduct({ name: "AMD Radeon RX 9070 XT 16GB", brand: "AMD", category: "Plăci video", priceRon: 4299, stock: stock(8), imageUrl: IMG.gpu, badge: "RDNA 4" }),

  // =========================
  // MEMORIE RAM
  // =========================
  makeProduct({ name: "Corsair Vengeance DDR5 32GB (2x16) 6000MHz", brand: "Corsair", category: "Memorie RAM", priceRon: 599, stock: stock(40), imageUrl: IMG.ram }),
  makeProduct({ name: "G.Skill Trident Z5 DDR5 32GB (2x16) 6400MHz", brand: "G.Skill", category: "Memorie RAM", priceRon: 699, stock: stock(30), imageUrl: IMG.ram }),
  makeProduct({ name: "Kingston Fury Beast DDR5 32GB (2x16) 6000MHz", brand: "Kingston", category: "Memorie RAM", priceRon: 579, stock: stock(35), imageUrl: IMG.ram }),
  makeProduct({ name: "Crucial DDR5 16GB (1x16) 5600MHz", brand: "Crucial", category: "Memorie RAM", priceRon: 269, stock: stock(45), imageUrl: IMG.ram }),
  makeProduct({ name: "Corsair Vengeance DDR5 64GB (2x32) 6000MHz", brand: "Corsair", category: "Memorie RAM", priceRon: 1099, stock: stock(18), imageUrl: IMG.ram }),
  makeProduct({ name: "G.Skill Ripjaws DDR4 32GB (2x16) 3600MHz", brand: "G.Skill", category: "Memorie RAM", priceRon: 399, stock: stock(40), imageUrl: IMG.ram }),
  makeProduct({ name: "Kingston Fury DDR4 16GB (2x8) 3200MHz", brand: "Kingston", category: "Memorie RAM", priceRon: 219, stock: stock(50), imageUrl: IMG.ram }),
  makeProduct({ name: "Corsair Dominator DDR5 32GB (2x16) 7200MHz", brand: "Corsair", category: "Memorie RAM", priceRon: 999, stock: stock(12), imageUrl: IMG.ram, badge: "Premium" }),

  // =========================
  // STOCARE
  // =========================
  makeProduct({ name: "Samsung 990 PRO 2TB NVMe", brand: "Samsung", category: "Stocare", priceRon: 799, stock: stock(30), imageUrl: IMG.storage }),
  makeProduct({ name: "Samsung 980 1TB NVMe", brand: "Samsung", category: "Stocare", priceRon: 329, stock: stock(40), imageUrl: IMG.storage }),
  makeProduct({ name: "WD Black SN850X 2TB NVMe", brand: "Western Digital", category: "Stocare", priceRon: 749, stock: stock(25), imageUrl: IMG.storage }),
  makeProduct({ name: "Crucial P5 Plus 1TB NVMe", brand: "Crucial", category: "Stocare", priceRon: 299, stock: stock(35), imageUrl: IMG.storage }),
  makeProduct({ name: "Kingston KC3000 2TB NVMe", brand: "Kingston", category: "Stocare", priceRon: 699, stock: stock(22), imageUrl: IMG.storage }),
  makeProduct({ name: "Seagate Barracuda 2TB HDD", brand: "Seagate", category: "Stocare", priceRon: 229, stock: stock(40), imageUrl: IMG.storage }),
  makeProduct({ name: "WD Blue 4TB HDD", brand: "Western Digital", category: "Stocare", priceRon: 399, stock: stock(18), imageUrl: IMG.storage }),
  makeProduct({ name: "Samsung 870 EVO 1TB SATA SSD", brand: "Samsung", category: "Stocare", priceRon: 349, stock: stock(30), imageUrl: IMG.storage }),

  // =========================
  // PLĂCI DE BAZĂ
  // =========================
  makeProduct({ name: "ASUS ROG STRIX B650E-F (AM5)", brand: "ASUS", category: "Plăci de bază", priceRon: 1299, stock: stock(18), imageUrl: IMG.mb }),
  makeProduct({ name: "MSI MAG B650 Tomahawk (AM5)", brand: "MSI", category: "Plăci de bază", priceRon: 1199, stock: stock(18), imageUrl: IMG.mb }),
  makeProduct({ name: "Gigabyte B650 AORUS Elite (AM5)", brand: "Gigabyte", category: "Plăci de bază", priceRon: 1099, stock: stock(20), imageUrl: IMG.mb }),
  makeProduct({ name: "ASRock B650M Pro RS (AM5)", brand: "ASRock", category: "Plăci de bază", priceRon: 799, stock: stock(25), imageUrl: IMG.mb }),

  makeProduct({ name: "ASUS TUF GAMING B760-PLUS (LGA1700)", brand: "ASUS", category: "Plăci de bază", priceRon: 899, stock: stock(22), imageUrl: IMG.mb }),
  makeProduct({ name: "MSI PRO B760M-A (LGA1700)", brand: "MSI", category: "Plăci de bază", priceRon: 699, stock: stock(28), imageUrl: IMG.mb }),
  makeProduct({ name: "Gigabyte Z790 AORUS Elite (LGA1700)", brand: "Gigabyte", category: "Plăci de bază", priceRon: 1499, stock: stock(10), imageUrl: IMG.mb }),
  makeProduct({ name: "ASRock Z790 Steel Legend (LGA1700)", brand: "ASRock", category: "Plăci de bază", priceRon: 1399, stock: stock(10), imageUrl: IMG.mb }),

  makeProduct({ name: "ASUS ROG STRIX Z890-E (LGA1851)", brand: "ASUS", category: "Plăci de bază", priceRon: 1999, stock: stock(10), imageUrl: IMG.mb }),
  makeProduct({ name: "MSI MAG Z890 Tomahawk (LGA1851)", brand: "MSI", category: "Plăci de bază", priceRon: 1699, stock: stock(10), imageUrl: IMG.mb }),
  makeProduct({ name: "Gigabyte Z890 AORUS Elite (LGA1851)", brand: "Gigabyte", category: "Plăci de bază", priceRon: 1799, stock: stock(10), imageUrl: IMG.mb }),
  makeProduct({ name: "ASRock B860M Pro RS (LGA1851)", brand: "ASRock", category: "Plăci de bază", priceRon: 1099, stock: stock(12), imageUrl: IMG.mb }),

  // =========================
  // SURSE
  // =========================
  makeProduct({ name: "Corsair RM750e 750W 80+ Gold", brand: "Corsair", category: "Surse", priceRon: 499, stock: stock(30), imageUrl: IMG.psu }),
  makeProduct({ name: "Seasonic Focus GX-850 850W 80+ Gold", brand: "Seasonic", category: "Surse", priceRon: 649, stock: stock(22), imageUrl: IMG.psu }),
  makeProduct({ name: "be quiet! Pure Power 12 M 750W 80+ Gold", brand: "be quiet!", category: "Surse", priceRon: 579, stock: stock(24), imageUrl: IMG.psu }),
  makeProduct({ name: "EVGA SuperNOVA 1000 G6 1000W 80+ Gold", brand: "EVGA", category: "Surse", priceRon: 899, stock: stock(10), imageUrl: IMG.psu }),
  makeProduct({ name: "Cooler Master MWE Gold 650W", brand: "Cooler Master", category: "Surse", priceRon: 399, stock: stock(28), imageUrl: IMG.psu }),
  makeProduct({ name: "Corsair RM1000x 1000W 80+ Gold", brand: "Corsair", category: "Surse", priceRon: 999, stock: stock(8), imageUrl: IMG.psu }),

  // =========================
  // CARCASE
  // =========================
  makeProduct({ name: "Lian Li O11 Dynamic EVO", brand: "Lian Li", category: "Carcase", priceRon: 649, stock: stock(18), imageUrl: IMG.case }),
  makeProduct({ name: "NZXT H7 Flow", brand: "NZXT", category: "Carcase", priceRon: 599, stock: stock(20), imageUrl: IMG.case }),
  makeProduct({ name: "Corsair 4000D Airflow", brand: "Corsair", category: "Carcase", priceRon: 449, stock: stock(25), imageUrl: IMG.case }),
  makeProduct({ name: "Fractal Design Meshify 2", brand: "Fractal", category: "Carcase", priceRon: 749, stock: stock(10), imageUrl: IMG.case }),
  makeProduct({ name: "be quiet! Pure Base 500DX", brand: "be quiet!", category: "Carcase", priceRon: 499, stock: stock(18), imageUrl: IMG.case }),
  makeProduct({ name: "Phanteks Eclipse P400A", brand: "Phanteks", category: "Carcase", priceRon: 429, stock: stock(22), imageUrl: IMG.case }),

  // =========================
  // COOLERE
  // =========================
  makeProduct({ name: "Noctua NH-D15", brand: "Noctua", category: "Coolere", priceRon: 499, stock: stock(18), imageUrl: IMG.cooler }),
  makeProduct({ name: "be quiet! Dark Rock Pro 4", brand: "be quiet!", category: "Coolere", priceRon: 449, stock: stock(18), imageUrl: IMG.cooler }),
  makeProduct({ name: "Cooler Master Hyper 212", brand: "Cooler Master", category: "Coolere", priceRon: 179, stock: stock(35), imageUrl: IMG.cooler }),
  makeProduct({ name: "Arctic Liquid Freezer II 240 AIO", brand: "Arctic", category: "Coolere", priceRon: 399, stock: stock(18), imageUrl: IMG.cooler }),
  makeProduct({ name: "NZXT Kraken 280 AIO", brand: "NZXT", category: "Coolere", priceRon: 799, stock: stock(10), imageUrl: IMG.cooler }),
  makeProduct({ name: "DeepCool AK620", brand: "DeepCool", category: "Coolere", priceRon: 299, stock: stock(22), imageUrl: IMG.cooler }),
];

async function safeDeleteMany(modelName) {
  if (!prisma[modelName]) return;
  await prisma[modelName].deleteMany();
}

async function main() {
  console.log("🌱 Seeding started...");

  const deleteOrder = [
    "orderItem",
    "order",
    "cartItem",
    "cart",
    "wishlistItem",
    "wishlist",
    "productAnswer",
    "productQuestion",
    "productReview",
    "productSpecification",
    "productImage",
    "product",
  ];

  for (const modelName of deleteOrder) {
    if (prisma[modelName]) {
      console.log(`🧹 Clearing ${modelName}...`);
      await safeDeleteMany(modelName);
    }
  }

  const productsWithCompatibility = products.map((product) => ({
    ...product,
    compatibilityData: inferCompatibilityData(product),
  }));

  const batches = chunkArray(productsWithCompatibility, 200);
  let inserted = 0;

  for (const batch of batches) {
    const result = await prisma.product.createMany({
      data: batch,
    });
    inserted += result.count || 0;
  }

  console.log(`✅ Seed done. Inserted products: ${inserted}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });