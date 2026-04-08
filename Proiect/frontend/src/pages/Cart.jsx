import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Trash2,
  Tag,
  Shield,
  Truck,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { resolveProductImage } from "../lib/resolveProductImage";

const GUEST_CART_KEY = "configexp_guest_cart_v1";
const VAT_RATE = 0.21;

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

function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

function roundMoney(n) {
  return Math.round((Number(n ?? 0) + Number.EPSILON) * 100) / 100;
}

function formatRon(n) {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n ?? 0));
}

function ImageWithFallback({ src, alt, className }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (!src || errored) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-800`}
        aria-label={alt}
      >
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

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [promoCode, setPromoCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [loadingDb, setLoadingDb] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState({});
  const [dbCart, setDbCart] = useState({
    items: [],
    subtotalRon: 0,
    tvaRon: 0,
    shippingRon: 0,
    totalRon: 0,
  });

  const [guestItems, setGuestItems] = useState(() => loadGuestCart());

  const uiCart = useMemo(() => {
    if (isAuthenticated) {
      const items = (dbCart.items || []).map((it) => {
        const quantity = Number(it.quantity) || 1;
        const unitPriceRon = Number(it.unitPriceRon ?? it.product?.priceRon ?? 0);
        const lineTotalRon =
          it.lineTotalRon != null
            ? roundMoney(it.lineTotalRon)
            : roundMoney(unitPriceRon * quantity);

        return {
          id: it.id,
          quantity,
          unitPriceRon,
          lineTotalRon,
          product: {
            id: it.product?.id ?? it.productId,
            name: it.product?.name || "Produs",
            brand: it.product?.brand || "Brand",
            category: it.product?.category || "Categorie",
            imageUrl: it.product?.imageUrl,
            priceRon: unitPriceRon,
          },
        };
      });

      const subtotal = roundMoney(
        items.reduce((sum, item) => sum + item.lineTotalRon, 0)
      );
      const tva = roundMoney(subtotal * VAT_RATE);
      const shipping = roundMoney(dbCart.shippingRon ?? 0);
      const total = roundMoney(subtotal + tva + shipping);

      return {
        items,
        subtotalRon: subtotal,
        tvaRon: tva,
        shippingRon: shipping,
        totalRon: total,
      };
    }

    const items = guestItems.map((gi) => {
      const quantity = Number(gi.quantity) || 1;
      const unitPriceRon = Number(gi.unitPriceRon) || 0;
      const lineTotalRon = roundMoney(unitPriceRon * quantity);

      return {
        id: gi.id,
        quantity,
        unitPriceRon,
        lineTotalRon,
        product: {
          id: gi.productId,
          name: gi.name,
          brand: gi.brand,
          category: gi.category,
          imageUrl: gi.imageUrl,
          priceRon: unitPriceRon,
        },
      };
    });

    const subtotal = roundMoney(
      items.reduce((sum, item) => sum + item.lineTotalRon, 0)
    );
    const tva = roundMoney(subtotal * VAT_RATE);
    const shipping = 0;
    const total = roundMoney(subtotal + tva + shipping);

    return {
      items,
      subtotalRon: subtotal,
      tvaRon: tva,
      shippingRon: shipping,
      totalRon: total,
    };
  }, [isAuthenticated, dbCart, guestItems]);

  const itemsCount = uiCart.items.length;
  const hasItems = itemsCount > 0;

  const fetchDbCart = async () => {
    setErrorMsg("");
    setLoadingDb(true);

    try {
      const res = await api.get("/cart");
      setDbCart(res.data);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Nu am putut încărca coșul.");
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      fetchDbCart();
    } else {
      const items = loadGuestCart();
      setGuestItems(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading]);

  const guestUpdateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;

    const next = guestItems.map((it) =>
      it.id === itemId ? { ...it, quantity: newQty } : it
    );

    setGuestItems(next);
    saveGuestCart(next);
    window.dispatchEvent(new Event("cart:updated"));
  };

  const guestRemoveItem = (itemId) => {
    const next = guestItems.filter((it) => it.id !== itemId);
    setGuestItems(next);
    saveGuestCart(next);
    window.dispatchEvent(new Event("cart:updated"));
  };

  const guestClear = () => {
    setGuestItems([]);
    clearGuestCart();
    window.dispatchEvent(new Event("cart:updated"));
  };

  const dbUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;

    setErrorMsg("");
    setItemLoading((prev) => ({ ...prev, [itemId]: true }));

    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity: newQty });
      setDbCart(res.data);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error || "Nu am putut actualiza cantitatea."
      );
    } finally {
      setItemLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const dbRemoveItem = async (itemId) => {
    setErrorMsg("");
    setItemLoading((prev) => ({ ...prev, [itemId]: true }));

    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setDbCart(res.data);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Nu am putut șterge produsul.");
    } finally {
      setItemLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const dbClear = async () => {
    setErrorMsg("");
    setActionLoading(true);

    try {
      const res = await api.delete("/cart");
      setDbCart(res.data);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Nu am putut goli coșul.");
    } finally {
      setActionLoading(false);
    }
  };

  const checkout = () => {
    setErrorMsg("");

    if (!hasItems) return;

    navigate("/checkout");
  };

  const updateQuantity = (itemId, newQty) => {
    if (isAuthenticated) return dbUpdateQuantity(itemId, newQty);
    return guestUpdateQuantity(itemId, newQty);
  };

  const removeItem = (itemId) => {
    if (isAuthenticated) return dbRemoveItem(itemId);
    return guestRemoveItem(itemId);
  };

  const clearCart = () => {
    if (isAuthenticated) return dbClear();
    return guestClear();
  };

  const pageLoading = isAuthLoading || (isAuthenticated && loadingDb);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
              <ShoppingCart className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
                Coșul meu
              </h1>
              <p className="text-slate-400">
                {itemsCount} {itemsCount === 1 ? "produs" : "produse"} în coș
                {!isAuthenticated && !isAuthLoading && (
                  <span className="ml-2 text-xs text-slate-500">(guest)</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {pageLoading ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 text-slate-300">
            Se încarcă...
          </div>
        ) : hasItems ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {uiCart.items.map((item, index) => {
                const p = item.product || {};
                const isBusy = !!itemLoading[item.id] || actionLoading;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-800/50"
                  >
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isBusy}
                      className="absolute right-4 top-4 rounded-full bg-slate-800/80 p-2 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/20 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Șterge produs"
                    >
                      <X className="h-4 w-4 text-slate-400 transition-colors hover:text-red-400" />
                    </button>

                    <div className="flex gap-6">
                      <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                        <ImageWithFallback
                          src={resolveProductImage(p.imageUrl)}
                          alt={p.name || "Produs"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <span className="mb-2 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                            {p.category || "Categorie"}
                          </span>
                          <p className="mb-1 text-xs font-medium text-cyan-400">
                            {p.brand || "Brand"}
                          </p>
                          <h3 className="mb-2 text-lg font-semibold text-white">
                            {p.name || "Produs"}
                          </h3>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400">
                              Cantitate:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={isBusy || item.quantity <= 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-all hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <span className="flex h-8 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 font-medium text-white">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={isBusy}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-all hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-baseline justify-end gap-2">
                              <span className="text-2xl font-bold text-cyan-400">
                                {formatRon(item.lineTotalRon)}
                              </span>
                              <span className="text-sm text-slate-400">RON</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatRon(item.unitPriceRon)} RON / buc
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <button
                type="button"
                onClick={clearCart}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Golește coșul
              </button>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                className="sticky top-24 space-y-6"
              >
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-cyan-400" />
                    <h3 className="font-semibold text-white">Cod promoțional</h3>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Introdu codul"
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      Aplică
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg shadow-cyan-500/10">
                  <h3 className="mb-4 font-semibold text-white">Sumar comandă</h3>

                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-medium text-white">
                        {formatRon(uiCart.subtotalRon)} RON
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">TVA (21%)</span>
                      <span className="font-medium text-white">
                        {formatRon(uiCart.tvaRon)} RON
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Transport</span>
                      {uiCart.shippingRon === 0 ? (
                        <span className="font-medium text-green-400">GRATUIT</span>
                      ) : (
                        <span className="font-medium text-white">
                          {formatRon(uiCart.shippingRon)} RON
                        </span>
                      )}
                    </div>

                    <div className="border-t border-slate-700 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg text-white">Total</span>
                        <div className="text-right">
                          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                            {formatRon(uiCart.totalRon)}
                          </div>
                          <div className="text-xs text-slate-400">RON</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={checkout}
                    disabled={actionLoading || !hasItems}
                    className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionLoading ? "Se procesează..." : "Finalizează comanda"}
                    {!actionLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </button>

                  {!isAuthenticated && (
                    <p className="mt-3 text-center text-xs text-slate-500">
                      Pentru finalizare, este necesar să te autentifici.
                    </p>
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Truck className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-white">
                        Transport rapid
                      </h4>
                      <p className="text-xs text-slate-400">Livrare în 24-48h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Shield className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-white">
                        Garanție extinsă
                      </h4>
                      <p className="text-xs text-slate-400">2-3 ani</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                      <CreditCard className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-white">
                        Plată flexibilă
                      </h4>
                      <p className="text-xs text-slate-400">Stripe ulterior</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[60vh] flex-col items-center justify-center"
          >
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-slate-800/50">
              <ShoppingCart className="h-16 w-16 text-slate-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Coșul tău este gol
            </h2>
            <p className="mb-8 text-slate-400">
              Adaugă produse în coș pentru a continua
            </p>
            <button
              type="button"
              onClick={() => navigate("/components")}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
            >
              Explorează produse
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}