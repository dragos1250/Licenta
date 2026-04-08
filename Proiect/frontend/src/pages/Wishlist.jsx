import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, X, Share2, Sparkles } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { resolveProductImage } from "../lib/resolveProductImage";

const VAT_RATE = 0.21;

const toNumber = (value) => Number(value ?? 0);
const grossFromNet = (net) => toNumber(net) * (1 + VAT_RATE);

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Button({ children, className = "", disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
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
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 ring-1 ring-pink-500/30" />
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

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [data, setData] = useState({
    totalItems: 0,
    inStockCount: 0,
    totalValueRon: 0,
    items: [],
  });

  const formatRon = (n) =>
    Number(n ?? 0).toLocaleString("ro-RO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalValueGrossRon = useMemo(
    () => grossFromNet(data.totalValueRon),
    [data.totalValueRon]
  );

  const fetchWishlist = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await api.get("/wishlist");
      setData(res.data);
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.error || "Nu am putut încărca wishlist-ul."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      setData({ totalItems: 0, inStockCount: 0, totalValueRon: 0, items: [] });
      return;
    }
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading]);

  const removeItem = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/items/${productId}`);
      setData(res.data);
      window.dispatchEvent(new Event("wishlist:updated"));
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut șterge produsul.");
    }
  };

  const clearList = async () => {
    try {
      const res = await api.delete("/wishlist/clear");
      setData(res.data);
      window.dispatchEvent(new Event("wishlist:updated"));
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut goli lista.");
    }
  };

  const removeUnavailable = async () => {
    try {
      const res = await api.delete("/wishlist/unavailable");
      setData(res.data);
      window.dispatchEvent(new Event("wishlist:updated"));
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.error || "Nu am putut șterge indisponibilele."
      );
    }
  };

  const addOneToCart = async (productId) => {
    try {
      await api.post("/cart/items", { productId, quantity: 1 });
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut adăuga în coș.");
    }
  };

  const addAllToCart = async () => {
    try {
      for (const it of data.items) {
        await api.post("/cart/items", { productId: it.product.id, quantity: 1 });
      }
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.error ||
          "Nu am putut adăuga toate produsele în coș."
      );
    }
  };

  const categoriesCount = useMemo(() => {
    const set = new Set(data.items.map((i) => i.product.category));
    return set.size;
  }, [data.items]);

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-700/50 bg-slate-900/40 p-10 text-slate-300">
          Wishlist-ul este disponibil după autentificare.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 ring-1 ring-pink-500/30">
                <Heart className="h-6 w-6 fill-pink-500 text-pink-500" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-4xl font-bold text-transparent">
                  Lista mea de dorințe
                </h1>
                <p className="text-slate-400">{data.totalItems} produse salvate</p>
              </div>
            </div>

            <Button className="gap-2 border border-slate-600 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400">
              <Share2 className="h-4 w-4" />
              Partajează lista
            </Button>
          </div>
        </motion.div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 text-slate-300">
            Se încarcă wishlist-ul...
          </div>
        ) : data.items.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {data.items.map((it, index) => {
                const p = it.product;
                const inStock = p.stock > 0;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-pink-500/30 hover:bg-slate-800/50"
                  >
                    <button
                      type="button"
                      onClick={() => removeItem(p.id)}
                      className="absolute right-4 top-4 rounded-full bg-slate-800/80 p-2 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/20 group-hover:opacity-100"
                      title="Șterge"
                    >
                      <X className="h-4 w-4 text-slate-400 transition-colors hover:text-red-400" />
                    </button>

                    <div className="flex gap-6">
                      <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                        <ImageWithFallback
                          src={resolveProductImage(p.imageUrl)}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Badge className="mb-2 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                            {p.category}
                          </Badge>
                          <p className="mb-1 text-xs font-medium text-cyan-400">
                            {p.brand}
                          </p>
                          <h3 className="mb-2 font-semibold text-white">{p.name}</h3>

                          {inStock ? (
                            <span className="text-xs font-medium text-green-400">
                              ● În stoc
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-red-400">
                              ● Stoc epuizat
                            </span>
                          )}
                        </div>

                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-pink-400">
                                {formatRon(grossFromNet(p.priceRon))}
                              </span>
                              <span className="text-sm text-slate-400">RON</span>
                            </div>

                            <div className="text-xs text-slate-500">
                              ({formatRon(p.priceRon)} RON fără TVA)
                            </div>
                          </div>

                          <Button
                            disabled={!inStock}
                            onClick={() => addOneToCart(p.id)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Adaugă în coș
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-xl border border-pink-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg shadow-pink-500/10">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    Sumar listă dorințe
                  </h3>

                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total produse</span>
                      <span className="font-medium text-white">{data.totalItems}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Produse în stoc</span>
                      <span className="font-medium text-green-400">
                        {data.inStockCount}
                      </span>
                    </div>

                    <div className="border-t border-slate-700 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valoare totală</span>
                        <div className="text-right">
                          <div className="bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-2xl font-bold text-transparent">
                            {formatRon(totalValueGrossRon)}
                          </div>
                          <div className="text-xs text-slate-400">RON cu TVA</div>
                        </div>
                      </div>
                      <div className="mt-1 text-right text-xs text-slate-500">
                        ({formatRon(data.totalValueRon)} RON fără TVA)
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={addAllToCart}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Adaugă toate în coș
                  </Button>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                  <h4 className="mb-3 text-sm font-semibold text-white">
                    Acțiuni rapide
                  </h4>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={removeUnavailable}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-cyan-400"
                    >
                      Șterge indisponibile
                    </button>
                    <button
                      type="button"
                      onClick={clearList}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-red-400"
                    >
                      Golește lista
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                  <h4 className="mb-3 text-sm font-semibold text-white">
                    💡 Recomandare
                  </h4>
                  <p className="mb-3 text-sm text-slate-400">
                    Ai produse din {categoriesCount} categorii. Vrei să construiești
                    o configurație completă?
                  </p>
                  <Button
                    onClick={() => navigate("/configurator")}
                    className="w-full border border-slate-600 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                  >
                    Configurează PC complet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[60vh] flex-col items-center justify-center"
          >
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-slate-800/50">
              <Heart className="h-16 w-16 text-slate-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Lista ta este goală
            </h2>
            <p className="mb-8 text-slate-400">
              Adaugă produse la lista de dorințe pentru a le salva
            </p>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              Explorează produse
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}