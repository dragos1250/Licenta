import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Filter,
  SlidersHorizontal,
  Grid3x3,
  List,
  Star,
  ShoppingCart,
  Heart,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { resolveProductImage } from "../lib/resolveProductImage";

const GUEST_CART_KEY = "configexp_guest_cart_v1";
const GUEST_WISHLIST_KEY = "configexp_guest_wishlist_v1";
const VAT_RATE = 0.21;

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
      x.productId === product.id ? { ...x, quantity: x.quantity + 1 } : x
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

function loadGuestWishlistIds() {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return new Set();
    const ids = arr
      .map((x) => (typeof x === "string" ? x : x?.productId))
      .filter(Boolean);
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function saveGuestWishlistIds(setIds) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(Array.from(setIds)));
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

function normalizeProduct(product) {
  return {
    ...product,
    priceRon: Number(product?.priceRon ?? 0),
    originalPriceRon:
      product?.originalPriceRon !== null && product?.originalPriceRon !== undefined
        ? Number(product.originalPriceRon)
        : null,
    rating: Number(product?.rating ?? 0),
    reviews: Number(product?.reviews ?? 0),
    stock: Number(product?.stock ?? 0),
    inStock: Number(product?.stock ?? 0) > 0,
    badge: product?.badge || null,
  };
}

export default function Components() {
  const navigate = useNavigate();
  const { category: categoryParam } = useParams();
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [viewMode, setViewMode] = useState("grid");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ category: "Toate", count: 0 }]);

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam ? decodeURIComponent(categoryParam) : "Toate"
  );

  const [minPriceDraft, setMinPriceDraft] = useState("");
  const [maxPriceDraft, setMaxPriceDraft] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const [brandFilters, setBrandFilters] = useState([]);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const [sort, setSort] = useState("relevance");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [wishlistIds, setWishlistIds] = useState(() => loadGuestWishlistIds());
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const fetchData = async () => {
    setLoading(true);

    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/products"),
        api.get("/products/categories"),
      ]);

      const rawProducts = Array.isArray(pRes.data) ? pRes.data : [];
      const realProducts = rawProducts.map(normalizeProduct);
      setProducts(realProducts);

      const cats = Array.isArray(cRes.data) ? cRes.data : [];
      setCategories([{ category: "Toate", count: realProducts.length }, ...cats]);
    } catch {
      setProducts([]);
      setCategories([{ category: "Toate", count: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      setWishlistIds(loadGuestWishlistIds());
      return;
    }

    (async () => {
      try {
        const res = await api.get("/wishlist");
        const ids = new Set(
          (res.data?.items || [])
            .map((it) => it.product?.id)
            .filter(Boolean)
        );
        setWishlistIds(ids);
      } catch {
        setWishlistIds(new Set());
      }
    })();
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    } else {
      setSelectedCategory("Toate");
    }
  }, [categoryParam]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, minPrice, maxPrice, onlyInStock, sort, brandFilters.join("|")]);

  const categoryBaseProducts = useMemo(() => {
    if (selectedCategory === "Toate") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const availableBrands = useMemo(() => {
    const set = new Set(categoryBaseProducts.map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categoryBaseProducts]);

  const filteredProducts = useMemo(() => {
    let arr = [...categoryBaseProducts];

    if (minPrice !== null) {
      arr = arr.filter((p) => grossFromNet(p.priceRon) >= minPrice);
    }

    if (maxPrice !== null) {
      arr = arr.filter((p) => grossFromNet(p.priceRon) <= maxPrice);
    }

    if (brandFilters.length > 0) {
      arr = arr.filter((p) => brandFilters.includes(p.brand));
    }

    if (onlyInStock) {
      arr = arr.filter((p) => p.inStock);
    }

    if (sort === "priceAsc") {
      arr.sort((a, b) => a.priceRon - b.priceRon);
    } else if (sort === "priceDesc") {
      arr.sort((a, b) => b.priceRon - a.priceRon);
    } else if (sort === "rating") {
      arr.sort((a, b) => b.rating - a.rating);
    } else if (sort === "newest") {
      arr.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return arr;
  }, [categoryBaseProducts, minPrice, maxPrice, brandFilters, onlyInStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageItems = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === "Toate") navigate("/components");
    else navigate(`/components/${encodeURIComponent(cat)}`);
  };

  const handleApplyPrice = () => {
    const min = minPriceDraft.trim() ? Number(minPriceDraft) : null;
    const max = maxPriceDraft.trim() ? Number(maxPriceDraft) : null;

    setMinPrice(Number.isFinite(min) ? min : null);
    setMaxPrice(Number.isFinite(max) ? max : null);
  };

  const toggleBrand = (brand) => {
    setBrandFilters((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const openProductDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  const addToCart = async (product) => {
    try {
      if (!isAuthLoading && isAuthenticated) {
        await api.post("/cart/items", { productId: product.id, quantity: 1 });
        setToast("Produs adăugat în coș ✅");
        window.dispatchEvent(new Event("cart:updated"));
      } else {
        addToGuestCart(product);
        setToast("Produs adăugat în coș (guest) ✅");
        window.dispatchEvent(new Event("cart:updated"));
      }

      setTimeout(() => setToast(""), 1800);
    } catch (e) {
      setToast(e?.response?.data?.error || "Nu am putut adăuga în coș.");
      setTimeout(() => setToast(""), 2200);
    }
  };

  const toggleWishlist = async (productId) => {
    if (wishlistBusy) return;

    const prev = new Set(wishlistIds);
    const wasIn = prev.has(productId);

    const next = new Set(prev);
    if (wasIn) next.delete(productId);
    else next.add(productId);
    setWishlistIds(next);

    if (!isAuthLoading && !isAuthenticated) {
      saveGuestWishlistIds(next);
      window.dispatchEvent(new Event("wishlist:updated"));
      return;
    }

    setWishlistBusy(true);
    try {
      if (wasIn) {
        await api.delete(`/wishlist/items/${productId}`);
      } else {
        await api.post("/wishlist/items", { productId });
      }
      window.dispatchEvent(new Event("wishlist:updated"));
    } catch {
      setWishlistIds(prev);
    } finally {
      setWishlistBusy(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
            Componente PC
          </h1>
          <p className="text-slate-400">
            Descoperă cele mai bune componente pentru build-ul tău
          </p>
        </motion.div>

        {toast && (
          <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            {toast}
          </div>
        )}

        <div className="flex gap-8">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0"
          >
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-semibold text-white">Categorii</h3>
                </div>

                <div className="space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c.category}
                      type="button"
                      onClick={() => handleCategoryClick(c.category)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                        selectedCategory === c.category
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                      }`}
                    >
                      {c.category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-semibold text-white">Preț</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceDraft}
                      onChange={(e) => setMinPriceDraft(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceDraft}
                      onChange={(e) => setMaxPriceDraft(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <Button
                    onClick={handleApplyPrice}
                    className="w-full border border-slate-600 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                  >
                    Aplică
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                <h3 className="mb-4 font-semibold text-white">Producători</h3>
                <div className="space-y-2">
                  {availableBrands.length === 0 ? (
                    <div className="text-sm text-slate-500">—</div>
                  ) : (
                    availableBrands.map((b) => (
                      <label
                        key={b}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={brandFilters.includes(b)}
                          onChange={() => toggleBrand(b)}
                          className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                        />
                        {b}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                  />
                  Doar produse în stoc
                </label>
              </div>
            </div>
          </motion.div>

          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between"
            >
              <p className="text-sm text-slate-400">
                {filteredProducts.length} produse găsite
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-900/50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded p-2 transition-all ${
                      viewMode === "grid"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`rounded p-2 transition-all ${
                      viewMode === "list"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="relevance">Cele mai relevante</option>
                  <option value="priceAsc">Preț crescător</option>
                  <option value="priceDesc">Preț descrescător</option>
                  <option value="rating">Cele mai bine votate</option>
                  <option value="newest">Cele mai noi</option>
                </select>
              </div>
            </motion.div>

            {loading ? (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 text-slate-300">
                Se încarcă produsele...
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-4"
                }
              >
                {pageItems.map((product, index) => {
                  const isWishlisted = wishlistIds.has(product.id);
                  const hasReviews = Number(product.reviews || 0) > 0;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => openProductDetail(product.id)}
                      className={`group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/50 ${
                        viewMode === "list" ? "flex gap-6 p-4" : "p-4"
                      }`}
                    >
                      {product.badge && (
                        <Badge className="absolute left-4 top-4 z-10 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                          {product.badge}
                        </Badge>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        disabled={wishlistBusy}
                        className={`absolute right-4 top-4 z-10 rounded-full bg-slate-900/80 p-2 backdrop-blur-sm transition-all hover:bg-cyan-500/20 ${
                          isWishlisted
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                        title={
                          isWishlisted
                            ? "Scoate din wishlist"
                            : "Adaugă în wishlist"
                        }
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            isWishlisted
                              ? "text-pink-400"
                              : "text-slate-300 hover:text-cyan-400"
                          }`}
                          fill={isWishlisted ? "currentColor" : "none"}
                        />
                      </button>

                      <div
                        className={`overflow-hidden rounded-lg bg-slate-800 ${
                          viewMode === "list"
                            ? "h-32 w-32 flex-shrink-0"
                            : "mb-4 flex h-56 w-full items-center justify-center"
                        }`}
                      >
                        <ImageWithFallback
                          src={resolveProductImage(product.imageUrl)}
                          alt={product.name}
                          className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                            viewMode === "list" ? "object-cover" : "object-contain p-3"
                          }`}
                        />
                      </div>

                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <p className="mb-1 text-xs font-medium text-cyan-400">
                          {product.brand}
                        </p>

                        <h3 className="mb-2 line-clamp-2 font-semibold text-white">
                          {product.name}
                        </h3>

                        {hasReviews ? (
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-white">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              ({product.reviews})
                            </span>
                          </div>
                        ) : (
                          <div className="mb-3 text-xs text-slate-500">
                            Fără review-uri
                          </div>
                        )}

                        <div className="mb-3">
                          {product.inStock ? (
                            <span className="text-xs font-medium text-green-400">
                              ● În stoc
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-red-400">
                              ● Stoc epuizat
                            </span>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-cyan-400">
                              {formatRon(grossFromNet(product.priceRon))}
                            </span>
                            <span className="text-sm text-slate-400">RON</span>
                          </div>

                          <div className="text-xs text-slate-500">
                            ({formatRon(product.priceRon)} RON fără TVA)
                          </div>
                        </div>

                        <Button
                          disabled={!product.inStock}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {product.inStock ? "Adaugă în coș" : "Indisponibil"}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 text-center text-slate-300">
                Nu există produse care să corespundă filtrelor selectate.
              </div>
            )}

            {!loading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-12 flex justify-center gap-2"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-10 w-10 rounded-lg transition-all ${
                      p === page
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                        : "border border-slate-700 bg-slate-900/50 text-slate-400 hover:border-cyan-500 hover:bg-slate-800 hover:text-cyan-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}