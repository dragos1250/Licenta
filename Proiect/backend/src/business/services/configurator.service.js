const SLOT_TO_CATEGORY = {
  cpu: "Procesoare",
  gpu: "Plăci video",
  ram: "Memorie RAM",
  storage: "Stocare",
  motherboard: "Plăci de bază",
  psu: "Surse",
  case: "Carcase",
  cooling: "Coolere",
};

const CATEGORY_TO_SLOT = {
  Procesoare: "cpu",
  "Plăci video": "gpu",
  "Memorie RAM": "ram",
  Stocare: "storage",
  "Plăci de bază": "motherboard",
  Surse: "psu",
  Carcase: "case",
  Coolere: "cooling",
};

export class ConfiguratorService {
  constructor(configuratorRepository) {
    this.configuratorRepository = configuratorRepository;
  }

  pushUnique(arr, message) {
    if (!message) return;
    if (!arr.includes(message)) arr.push(message);
  }

  getCompat(product) {
    if (!product?.compatibilityData || typeof product.compatibilityData !== "object") {
      return {};
    }
    return product.compatibilityData;
  }

  hasValue(value) {
    return value !== undefined && value !== null && value !== "";
  }

  roundUpTo50(n) {
    return Math.ceil(n / 50) * 50;
  }

  mapProductsToSlots(products) {
    const result = {
      cpu: null,
      gpu: null,
      ram: null,
      storage: null,
      motherboard: null,
      psu: null,
      case: null,
      cooling: null,
    };

    for (const product of products) {
      const slot = CATEGORY_TO_SLOT[product.category];
      if (slot) result[slot] = product;
    }

    return result;
  }

  supportsRamType(expected, actual) {
    if (!expected || !actual) return false;
    if (expected === "DDR4_DDR5") {
      return actual === "DDR4" || actual === "DDR5";
    }
    return expected === actual;
  }

  estimateSystemPower(selected) {
    let total = 0;

    const cpu = this.getCompat(selected.cpu);
    const gpu = this.getCompat(selected.gpu);
    const ram = this.getCompat(selected.ram);
    const storage = this.getCompat(selected.storage);
    const cooling = this.getCompat(selected.cooling);

    total += Number(cpu.cpuTdpW || 0);
    total += Number(gpu.gpuPowerW || 0);

    if (selected.motherboard) total += 50;
    if (selected.case) total += 10;

    if (selected.ram) {
      const modules = Number(ram.modules || 1);
      total += Math.max(6, modules * 4);
    }

    if (selected.storage) {
      total += storage.storageType === "SATA" ? 8 : 6;
    }

    if (selected.cooling) {
      total += cooling.coolerType === "aio" ? 15 : 8;
    }

    return total;
  }

  checkCpuMotherboard(selected, errors) {
    if (!selected.cpu || !selected.motherboard) return;

    const cpu = this.getCompat(selected.cpu);
    const mb = this.getCompat(selected.motherboard);

    if (!this.hasValue(cpu.socket)) {
      this.pushUnique(errors, "Procesorul selectat nu are socket definit pentru verificare.");
      return;
    }

    if (!this.hasValue(mb.socket)) {
      this.pushUnique(errors, "Placa de bază selectată nu are socket definit pentru verificare.");
      return;
    }

    if (cpu.socket !== mb.socket) {
      this.pushUnique(errors, "Procesorul și placa de bază au socket diferit.");
    }
  }

  checkRamCompatibility(selected, errors, warnings) {
    if (!selected.ram) return;

    const ram = this.getCompat(selected.ram);
    const mb = this.getCompat(selected.motherboard);
    const cpu = this.getCompat(selected.cpu);

    if (!this.hasValue(ram.ramType)) {
      this.pushUnique(errors, "Memoria RAM selectată nu are tipul de memorie definit.");
      return;
    }

    if (selected.cpu) {
      if (!this.hasValue(cpu.ramType)) {
        this.pushUnique(errors, "Procesorul selectat nu are tipul de memorie definit.");
      } else if (!this.supportsRamType(cpu.ramType, ram.ramType)) {
        this.pushUnique(errors, "Memoria RAM nu este compatibilă cu procesorul selectat.");
      }
    }

    if (selected.motherboard) {
      if (!this.hasValue(mb.ramType)) {
        this.pushUnique(errors, "Placa de bază selectată nu are tipul de memorie definit.");
      } else if (!this.supportsRamType(mb.ramType, ram.ramType)) {
        this.pushUnique(errors, "Memoria RAM nu este compatibilă cu placa de bază.");
      }

      if (
        this.hasValue(ram.speedMHz) &&
        this.hasValue(mb.maxRamSpeedMHz) &&
        Number(ram.speedMHz) > Number(mb.maxRamSpeedMHz)
      ) {
        this.pushUnique(
          warnings,
          "Frecvența memoriei RAM depășește limita declarată a plăcii de bază."
        );
      }

      if (
        this.hasValue(ram.capacityGb) &&
        this.hasValue(mb.maxRamCapacityGb) &&
        Number(ram.capacityGb) > Number(mb.maxRamCapacityGb)
      ) {
        this.pushUnique(errors, "Capacitatea memoriei RAM depășește limita plăcii de bază.");
      }

      if (
        this.hasValue(ram.modules) &&
        this.hasValue(mb.ramSlots) &&
        Number(ram.modules) > Number(mb.ramSlots)
      ) {
        this.pushUnique(errors, "Kitul RAM are mai multe module decât sloturile plăcii de bază.");
      }
    }
  }

  checkMotherboardCase(selected, errors) {
    if (!selected.motherboard || !selected.case) return;

    const mb = this.getCompat(selected.motherboard);
    const pcCase = this.getCompat(selected.case);
    const supported = pcCase.supportedFormFactors || [];

    if (!this.hasValue(mb.formFactor)) {
      this.pushUnique(errors, "Placa de bază selectată nu are form factor definit.");
      return;
    }

    if (!Array.isArray(supported) || supported.length === 0) {
      this.pushUnique(errors, "Carcasa selectată nu are form factor-ele suportate definite.");
      return;
    }

    if (!supported.includes(mb.formFactor)) {
      this.pushUnique(errors, "Placa de bază nu este compatibilă cu carcasa selectată.");
    }
  }

  checkGpuCase(selected, errors) {
    if (!selected.gpu || !selected.case) return;

    const gpu = this.getCompat(selected.gpu);
    const pcCase = this.getCompat(selected.case);

    if (
      this.hasValue(gpu.gpuLengthMm) &&
      this.hasValue(pcCase.maxGpuLengthMm) &&
      Number(gpu.gpuLengthMm) > Number(pcCase.maxGpuLengthMm)
    ) {
      this.pushUnique(errors, "Placa video este prea lungă pentru carcasa selectată.");
    }

    if (
      this.hasValue(gpu.gpuThicknessSlots) &&
      this.hasValue(pcCase.maxGpuThicknessSlots) &&
      Number(gpu.gpuThicknessSlots) > Number(pcCase.maxGpuThicknessSlots)
    ) {
      this.pushUnique(errors, "Placa video este prea groasă pentru carcasa selectată.");
    }
  }

  checkCoolerCompatibility(selected, errors, warnings) {
    if (!selected.cooling || !selected.cpu) return;

    const cooler = this.getCompat(selected.cooling);
    const cpu = this.getCompat(selected.cpu);
    const pcCase = this.getCompat(selected.case);

    const supportedSockets = cooler.supportedSockets || [];

    if (!this.hasValue(cpu.socket)) {
      this.pushUnique(errors, "Procesorul selectat nu are socket definit pentru cooler.");
      return;
    }

    if (!Array.isArray(supportedSockets) || supportedSockets.length === 0) {
      this.pushUnique(errors, "Coolerul selectat nu are socket-urile suportate definite.");
      return;
    }

    if (!supportedSockets.includes(cpu.socket)) {
      this.pushUnique(errors, "Coolerul nu suportă socket-ul procesorului.");
    }

    if (this.hasValue(cooler.coolingTdpW) && this.hasValue(cpu.cpuTdpW)) {
      if (Number(cooler.coolingTdpW) < Number(cpu.cpuTdpW)) {
        this.pushUnique(
          errors,
          "Coolerul selectat nu este suficient de puternic pentru TDP-ul procesorului."
        );
      } else if (Number(cooler.coolingTdpW) < Number(cpu.cpuTdpW) * 1.15) {
        this.pushUnique(
          warnings,
          "Coolerul este compatibil, dar este aproape de limita recomandată pentru procesor."
        );
      }
    }

    if (!selected.case) return;

    if (
      cooler.coolerType === "air" &&
      this.hasValue(cooler.coolerHeightMm) &&
      this.hasValue(pcCase.maxCoolerHeightMm) &&
      Number(cooler.coolerHeightMm) > Number(pcCase.maxCoolerHeightMm)
    ) {
      this.pushUnique(errors, "Coolerul pe aer nu încape în carcasa selectată.");
    }

    if (
      cooler.coolerType === "aio" &&
      this.hasValue(cooler.radiatorSizeMm) &&
      Array.isArray(pcCase.supportedRadiatorsMm) &&
      pcCase.supportedRadiatorsMm.length > 0 &&
      !pcCase.supportedRadiatorsMm.includes(Number(cooler.radiatorSizeMm))
    ) {
      this.pushUnique(errors, "Radiatorul AIO nu este suportat de carcasa selectată.");
    }
  }

  checkStorageMotherboard(selected, errors) {
    if (!selected.storage || !selected.motherboard) return;

    const storage = this.getCompat(selected.storage);
    const mb = this.getCompat(selected.motherboard);

    if (storage.storageType === "NVME") {
      if (!this.hasValue(mb.m2Slots)) {
        this.pushUnique(errors, "Placa de bază nu are numărul de sloturi M.2 definit.");
      } else if (Number(mb.m2Slots) < 1) {
        this.pushUnique(errors, "Placa de bază nu are slot M.2 pentru stocarea NVMe.");
      }
    }

    if (storage.storageType === "SATA") {
      if (!this.hasValue(mb.sataPorts)) {
        this.pushUnique(errors, "Placa de bază nu are numărul de porturi SATA definit.");
      } else if (Number(mb.sataPorts) < 1) {
        this.pushUnique(errors, "Placa de bază nu are port SATA disponibil.");
      }
    }
  }

  checkPsuCompatibility(selected, errors, warnings) {
    const estimatedSystemPowerW = this.estimateSystemPower(selected);

    if (!selected.psu) {
      return {
        estimatedSystemPowerW,
        recommendedPsuW: this.roundUpTo50(estimatedSystemPowerW * 1.25),
      };
    }

    const psu = this.getCompat(selected.psu);
    const gpu = this.getCompat(selected.gpu);

    const recommendedFromGpu = Number(gpu.recommendedPsuW || 0);
    const recommendedPsuW = this.roundUpTo50(
      Math.max(estimatedSystemPowerW * 1.25, recommendedFromGpu)
    );

    if (!this.hasValue(psu.wattage)) {
      this.pushUnique(errors, "Sursa selectată nu are puterea definită.");
      return {
        estimatedSystemPowerW,
        recommendedPsuW,
      };
    }

    if (Number(psu.wattage) < Number(estimatedSystemPowerW)) {
      this.pushUnique(
        errors,
        `Sursa nu poate susține consumul estimat al sistemului (${estimatedSystemPowerW}W).`
      );
    } else if (Number(psu.wattage) < Number(recommendedPsuW)) {
      this.pushUnique(
        warnings,
        `Sursa este funcțională, dar sub recomandarea de siguranță (${recommendedPsuW}W).`
      );
    }

    const gpuConnectors = gpu.powerConnectors || {};
    const psuConnectors = psu.connectors || {};

    const required8 = Number(gpuConnectors.pin8 || 0);
    const required6 = Number(gpuConnectors.pin6 || 0);
    const required12 = Number(gpuConnectors.pin12vhpwr || 0);

    const available8 = Number(psuConnectors.pin8 || 0);
    const available6 = Number(psuConnectors.pin6 || 0);
    const available12 = Number(psuConnectors.pin12vhpwr || 0);

    if (required8 > available8) {
      this.pushUnique(errors, "Sursa nu are suficienți conectori PCIe 8-pin pentru placa video.");
    }

    if (required6 > available6) {
      this.pushUnique(errors, "Sursa nu are suficienți conectori PCIe 6-pin pentru placa video.");
    }

    if (required12 > available12) {
      this.pushUnique(errors, "Sursa nu are conector 12VHPWR pentru placa video selectată.");
    }

    return {
      estimatedSystemPowerW,
      recommendedPsuW,
    };
  }

  evaluateCompatibility(selected) {
    const errors = [];
    const warnings = [];

    this.checkCpuMotherboard(selected, errors);
    this.checkRamCompatibility(selected, errors, warnings);
    this.checkMotherboardCase(selected, errors);
    this.checkGpuCase(selected, errors);
    this.checkCoolerCompatibility(selected, errors, warnings);
    this.checkStorageMotherboard(selected, errors);

    const power = this.checkPsuCompatibility(selected, errors, warnings);

    return {
      isCompatible: errors.length === 0,
      errors,
      warnings,
      estimatedSystemPowerW: power.estimatedSystemPowerW,
      recommendedPsuW: power.recommendedPsuW,
    };
  }

  async validateConfiguration(selectedMap) {
    const ids = Object.values(selectedMap || {}).filter(Boolean);

    if (!ids.length) {
      return {
        isCompatible: true,
        errors: [],
        warnings: [],
        estimatedSystemPowerW: 0,
        recommendedPsuW: 0,
      };
    }

    const products = await this.configuratorRepository.findProductsByIds(ids);
    const selected = this.mapProductsToSlots(products);

    return this.evaluateCompatibility(selected);
  }

  async getCompatibleProductsForSlot(slotId, selectedMap) {
    const category = SLOT_TO_CATEGORY[slotId];
    if (!category) return [];

    const selectedIds = Object.entries(selectedMap || {})
      .filter(([key, value]) => key !== slotId && !!value)
      .map(([, value]) => value);

    const alreadySelectedProducts =
      await this.configuratorRepository.findProductsByIds(selectedIds);

    const fixedSelected = this.mapProductsToSlots(alreadySelectedProducts);
    const candidates = await this.configuratorRepository.findProductsByCategory(category);

    const hasOtherSelections = Object.entries(selectedMap || {}).some(
      ([key, value]) => key !== slotId && !!value
    );

    if (!hasOtherSelections) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      const selected = {
        ...fixedSelected,
        [slotId]: candidate,
      };

      const result = this.evaluateCompatibility(selected);
      return result.errors.length === 0;
    });
  }
}