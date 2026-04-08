import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  MonitorCheck,
  Fan,
  Battery,
  Box,
  Disc,
  Check,
  AlertCircle,
  Info,
  Search,
  X,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { resolveProductImage } from "../lib/resolveProductImage";

const VAT_RATE = 0.21;
const GUEST_CART_KEY = "configexp_guest_cart_v1";

const toNumber = (value) => Number(value ?? 0);
const grossFromNet = (net) => toNumber(net) * (1 + VAT_RATE);
const formatRon = (n) =>
  toNumber(n).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function addToGuestCart(product) {
  const items = loadGuestCart();
  const existing = items.find((x) => x.productId === product.id);

  if (existing) {
    const next = items.map((x) =>
      x.productId === product.id ? { ...x, quantity: (x.quantity || 1) + 1 } : x
    );
    saveGuestCart(next);
    return;
  }

  const next = [
    ...items,
    {
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      unitPriceRon: product.priceRon,
      quantity: 1,
      imageUrl: product.imageUrl || "",
    },
  ];
  saveGuestCart(next);
}

function ImageWithFallback({ src, alt, className }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (!src || errored) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-800`}>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

const SLOT_CATEGORY = {
  cpu: "Procesoare",
  gpu: "Plăci video",
  ram: "Memorie RAM",
  storage: "Stocare",
  motherboard: "Plăci de bază",
  psu: "Surse",
  case: "Carcase",
  cooling: "Coolere",
};

export default function Configurator() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [slots, setSlots] = useState([
    { id: "cpu", name: "Procesor", icon: Cpu, required: true, selected: null },
    { id: "gpu", name: "Placă video", icon: MonitorCheck, required: true, selected: null },
    { id: "ram", name: "Memorie RAM", icon: MemoryStick, required: true, selected: null },
    { id: "storage", name: "Stocare", icon: HardDrive, required: true, selected: null },
    { id: "motherboard", name: "Placă de bază", icon: Disc, required: true, selected: null },
    { id: "psu", name: "Sursă alimentare", icon: Battery, required: true, selected: null },
    { id: "case", name: "Carcasă", icon: Box, required: true, selected: null },
    { id: "cooling", name: "Cooler", icon: Fan, required: false, selected: null },
  ]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState("");
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerProducts, setPickerProducts] = useState([]);

  const [compatibility, setCompatibility] = useState({
    isCompatible: true,
    errors: [],
    warnings: [],
    estimatedSystemPowerW: 0,
    recommendedPsuW: 0,
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const selectedMap = useMemo(() => {
    return {
      cpu: slots.find((s) => s.id === "cpu")?.selected?.id || null,
      gpu: slots.find((s) => s.id === "gpu")?.selected?.id || null,
      ram: slots.find((s) => s.id === "ram")?.selected?.id || null,
      storage: slots.find((s) => s.id === "storage")?.selected?.id || null,
      motherboard: slots.find((s) => s.id === "motherboard")?.selected?.id || null,
      psu: slots.find((s) => s.id === "psu")?.selected?.id || null,
      case: slots.find((s) => s.id === "case")?.selected?.id || null,
      cooling: slots.find((s) => s.id === "cooling")?.selected?.id || null,
    };
  }, [slots]);

  const requiredSlots = useMemo(() => slots.filter((s) => s.required), [slots]);
  const filledRequired = useMemo(
    () => requiredSlots.filter((s) => !!s.selected),
    [requiredSlots]
  );

  const completionPct = useMemo(() => {
    if (!requiredSlots.length) return 0;
    return Math.round((filledRequired.length / requiredSlots.length) * 100);
  }, [filledRequired.length, requiredSlots.length]);

  const totalNetPrice = useMemo(
    () => slots.reduce((sum, s) => sum + (s.selected?.priceRon || 0), 0),
    [slots]
  );

  const tva = useMemo(() => totalNetPrice * VAT_RATE, [totalNetPrice]);

  const totalGrossPrice = useMemo(
    () => totalNetPrice + tva,
    [totalNetPrice, tva]
  );

  const isCompatible = compatibility.isCompatible;

  useEffect(() => {
    const hasSelected = Object.values(selectedMap).some(Boolean);

    if (!hasSelected) {
      setCompatibility({
        isCompatible: true,
        errors: [],
        warnings: [],
        estimatedSystemPowerW: 0,
        recommendedPsuW: 0,
      });
      return;
    }

    let cancelled = false;

    async function checkCompatibility() {
      try {
        const res = await api.post("/configurator/compatibility", {
          selected: selectedMap,
        });

        if (!cancelled) {
          setCompatibility(
            res.data || {
              isCompatible: true,
              errors: [],
              warnings: [],
              estimatedSystemPowerW: 0,
              recommendedPsuW: 0,
            }
          );
        }
      } catch {
        if (!cancelled) {
          setCompatibility({
            isCompatible: true,
            errors: [],
            warnings: [],
            estimatedSystemPowerW: 0,
            recommendedPsuW: 0,
          });
        }
      }
    }

    checkCompatibility();

    return () => {
      cancelled = true;
    };
  }, [selectedMap]);

  useEffect(() => {
    setSaveError("");
    setSaveSuccess("");
  }, [slots]);

  const openPicker = async (slotId) => {
    setActiveSlotId(slotId);
    setPickerOpen(true);
    setPickerQuery("");
    setPickerError("");
    setPickerLoading(true);

    try {
      const res = await api.post(`/configurator/options/${slotId}`, {
        selected: selectedMap,
      });

      setPickerProducts(res.data || []);
    } catch (e) {
      setPickerError(
        e?.response?.data?.message || "Nu am putut încărca produsele."
      );
      setPickerProducts([]);
    } finally {
      setPickerLoading(false);
    }
  };

  const closePicker = () => {
    setPickerOpen(false);
    setActiveSlotId(null);
    setPickerProducts([]);
    setPickerQuery("");
    setPickerError("");
  };

  const selectProduct = (product) => {
    if (!activeSlotId) return;

    setSlots((prev) =>
      prev.map((s) => (s.id === activeSlotId ? { ...s, selected: product } : s))
    );

    closePicker();
  };

  const clearSlot = (slotId) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, selected: null } : s))
    );
  };

  const resetAll = () => {
    setSlots((prev) => prev.map((s) => ({ ...s, selected: null })));
  };

  const filteredPickerProducts = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return pickerProducts;

    return pickerProducts.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    );
  }, [pickerProducts, pickerQuery]);

  const addConfigToCart = async () => {
    const selected = slots.filter((s) => s.selected).map((s) => s.selected);

    if (!selected.length || !compatibility.isCompatible) return;

    try {
      if (!isAuthLoading && isAuthenticated) {
        for (const p of selected) {
          await api.post("/cart/items", { productId: p.id, quantity: 1 });
        }
      } else {
        for (const p of selected) addToGuestCart(p);
      }

      window.dispatchEvent(new Event("cart:updated"));
    } catch {
      // optional toast
    }
  };

  const buildSavePayload = () => ({
    name: `Build ${new Date().toLocaleString("ro-RO")}`,
    items: slots
      .filter((slot) => slot.selected)
      .map((slot) => ({
        slotId: slot.id,
        slotName: slot.name,
        productId: slot.selected.id,
      })),
    compatibility: {
      isCompatible: compatibility.isCompatible,
      estimatedSystemPowerW: compatibility.estimatedSystemPowerW,
      recommendedPsuW: compatibility.recommendedPsuW,
    },
  });

  const saveBuild = async () => {
    setSaveError("");
    setSaveSuccess("");

    if (isAuthLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (completionPct < 100) {
      setSaveError("Completează toate componentele obligatorii înainte să salvezi build-ul.");
      return;
    }

    if (!compatibility.isCompatible) {
      setSaveError("Rezolvă incompatibilitățile înainte să salvezi build-ul.");
      return;
    }

    try {
      setSaveLoading(true);

      await api.post("/builds", buildSavePayload());

      setSaveSuccess("Build-ul a fost salvat cu succes.");
      window.dispatchEvent(new Event("builds:updated"));
    } catch (e) {
      console.log("SAVE BUILD ERROR:", e?.response?.status, e?.response?.data);

      if (e?.response?.status === 401) {
        setSaveError("Ești autentificat în interfață, dar requestul către backend nu este autorizat.");
        return;
      }

      setSaveError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Nu am putut salva build-ul."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-5xl font-bold text-transparent">
            Configurator PC
          </h1>
          <p className="text-lg text-slate-400">
            Construiește pas cu pas sistemul tău perfect
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {slots.map((slot, index) => {
                const Icon = slot.icon;

                return (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 transition-all group-hover:bg-cyan-500/20">
                          <Icon className="h-6 w-6 text-cyan-400" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{slot.name}</h3>
                            {slot.required && (
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                                Obligatoriu
                              </span>
                            )}
                          </div>

                          {slot.selected ? (
                            <div className="mt-1">
                              <p className="text-sm font-medium text-cyan-400">
                                {slot.selected.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {slot.selected.brand} • {slot.selected.category}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-slate-500">
                              Nicio componentă selectată
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {slot.selected && (
                          <>
                            <div className="text-right">
                              <div className="font-semibold text-cyan-400">
                                {formatRon(grossFromNet(slot.selected.priceRon))} RON
                              </div>
                              <div className="text-xs text-slate-500">
                                ({formatRon(slot.selected.priceRon)} fără TVA)
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => clearSlot(slot.id)}
                              className="rounded-full bg-slate-800/70 p-2 text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
                              title="Elimină"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => openPicker(slot.id)}
                          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            slot.selected
                              ? "border border-slate-600 bg-slate-900/60 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                              : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                          }`}
                        >
                          {slot.selected ? "Schimbă" : "Alege"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Status configurare</h3>
                  <span className="text-sm font-bold text-cyan-400">{completionPct}%</span>
                </div>

                <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  />
                </div>

                <p className="text-sm text-slate-400">
                  {filledRequired.length} / {requiredSlots.length} componente obligatorii
                </p>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  {compatibility.isCompatible ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                  <h3 className="font-semibold text-white">Compatibilitate</h3>
                </div>

                {compatibility.isCompatible ? (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-green-500/10 p-3 ring-1 ring-green-500/20">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                    <p className="text-sm text-green-300">
                      Componentele selectate sunt compatibile între ele.
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-500/10 p-3 ring-1 ring-red-500/20">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                    <p className="text-sm text-red-300">
                      Există incompatibilități în configurația curentă.
                    </p>
                  </div>
                )}

                {compatibility.errors.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-2 text-sm font-semibold text-red-400">Erori</div>
                    <ul className="space-y-2">
                      {compatibility.errors.map((error, idx) => (
                        <li
                          key={idx}
                          className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-200"
                        >
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {compatibility.warnings.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-2 text-sm font-semibold text-orange-400">
                      Avertismente
                    </div>
                    <ul className="space-y-2">
                      {compatibility.warnings.map((warning, idx) => (
                        <li
                          key={idx}
                          className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-sm text-orange-200"
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 space-y-2 border-t border-slate-700 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consum estimat sistem</span>
                    <span className="font-medium text-slate-200">
                      {compatibility.estimatedSystemPowerW} W
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PSU recomandat minim</span>
                    <span className="font-medium text-cyan-400">
                      {compatibility.recommendedPsuW} W
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg shadow-cyan-500/10">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Preț total</h3>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                      {formatRon(totalGrossPrice)}
                    </div>
                    <div className="text-sm text-slate-400">RON cu TVA</div>
                  </div>
                </div>

                <div className="mb-4 space-y-2 border-t border-slate-700 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total fără TVA</span>
                    <span className="text-slate-300">{formatRon(totalNetPrice)} RON</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">TVA (21%)</span>
                    <span className="text-slate-300">{formatRon(tva)} RON</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Transport</span>
                    <span className="font-medium text-green-400">GRATUIT</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={
                      isAuthLoading ||
                      completionPct < 100 ||
                      !compatibility.isCompatible ||
                      saveLoading
                    }
                    onClick={saveBuild}
                    className="w-full rounded-lg border border-cyan-500/40 bg-slate-900/70 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saveLoading ? "Se salvează..." : "Salvează build-ul"}
                  </button>

                  <button
                    type="button"
                    disabled={completionPct < 100 || !compatibility.isCompatible}
                    onClick={addConfigToCart}
                    className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Adaugă în coș
                  </button>
                </div>

                {saveSuccess && (
                  <p className="mt-3 text-center text-xs text-green-400">{saveSuccess}</p>
                )}

                {saveError && (
                  <p className="mt-3 text-center text-xs text-red-400">{saveError}</p>
                )}

                {completionPct < 100 ? (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Completează toate componentele obligatorii
                  </p>
                ) : !compatibility.isCompatible ? (
                  <p className="mt-3 text-center text-xs text-red-400">
                    Rezolvă incompatibilitățile înainte de a salva build-ul sau de a-l adăuga în coș
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-red-400"
                >
                  Resetează
                </button>
              </div>
            </div>
          </div>
        </div>

        {pickerOpen && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/60" onClick={closePicker} />

            <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div>
                  <div className="text-sm text-slate-400">Selectează componentă</div>
                  <div className="text-lg font-semibold text-white">
                    {activeSlotId ? SLOT_CATEGORY[activeSlotId] : "Produse"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closePicker}
                  className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3">
                  <Search className="h-5 w-5 text-slate-500" />
                  <input
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    placeholder="Caută după produs sau brand..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {pickerError && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {pickerError}
                  </div>
                )}

                {pickerLoading ? (
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-slate-300">
                    Se încarcă produsele...
                  </div>
                ) : (
                  <div className="max-h-[60vh] space-y-3 overflow-auto pr-1">
                    {filteredPickerProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-cyan-500/30 hover:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-800">
                            <ImageWithFallback
                              src={resolveProductImage(p.imageUrl)}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div>
                            <div className="text-xs font-medium text-cyan-400">{p.brand}</div>
                            <div className="font-semibold text-white">{p.name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              Stoc:{" "}
                              <span className={p.stock > 0 ? "text-green-400" : "text-red-400"}>
                                {p.stock}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-cyan-400">
                            {formatRon(grossFromNet(p.priceRon))}{" "}
                            <span className="text-sm text-slate-400">RON</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            ({formatRon(p.priceRon)} fără TVA)
                          </div>

                          <button
                            disabled={p.stock <= 0}
                            onClick={() => selectProduct(p)}
                            className="mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Selectează
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredPickerProducts.length === 0 && (
                      <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-slate-300">
                        Niciun produs compatibil găsit.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}