import { motion, AnimatePresence } from "motion/react";
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
  Search,
  X,
  ChevronDown,
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
      type="button"
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

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
  const pageSize = 9;

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
  }, [
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    onlyInStock,
    sort,
    brandFilters.join("|"),
  ]);

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

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      arr = arr.filter((p) => {
        const haystack = [
          p.name,
          p.brand,
          p.category,
          p.shortDescription,
          p.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });
    }

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
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return arr;
  }, [
    categoryBaseProducts,
    searchQuery,
    minPrice,
    maxPrice,
    brandFilters,
    onlyInStock,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageItems = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setBrandFilters([]);
    setMobileFiltersOpen(false);

    if (cat === "Toate") navigate("/components");
    else navigate(`/components/${encodeURIComponent(cat)}`);
  };

  const handleApplyPrice = () => {
    const min = minPriceDraft.trim() ? Number(minPriceDraft) : null;
    const max = maxPriceDraft.trim() ? Number(maxPriceDraft) : null;

    setMinPrice(Number.isFinite(min) ? min : null);
    setMaxPrice(Number.isFinite(max) ? max : null);
  };

  const clearPriceFilter = () => {
    setMinPriceDraft("");
    setMaxPriceDraft("");
    setMinPrice(null);
    setMaxPrice(null);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setMinPriceDraft("");
    setMaxPriceDraft("");
    setMinPrice(null);
    setMaxPrice(null);
    setBrandFilters([]);
    setOnlyInStock(false);
    setSort("relevance");
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

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (minPrice !== null || maxPrice !== null ? 1 : 0) +
    brandFilters.length +
    (onlyInStock ? 1 : 0);

  const renderFilters = ({ isMobile = false } = {}) => (
    <div className={isMobile ? "space-y-4" : "space-y-4 lg:space-y-6"}>
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-cyan-400" />
          <h3 className="font-semibold text-white">Categorii</h3>
        </div>

        <div className="max-h-[260px] space-y-1 overflow-auto pr-1 lg:max-h-none lg:overflow-visible lg:pr-0">
          {categories.map((c) => (
            <button
              key={c.category}
              type="button"
              onClick={() => handleCategoryClick(c.category)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                selectedCategory === c.category
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
              }`}
            >
              <span className="truncate">{c.category}</span>
              {typeof c.count === "number" && (
                <span className="shrink-0 text-xs text-slate-500">{c.count}</span>
              )}
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
          <div className="grid grid-cols-2 gap-2">
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

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleApplyPrice}
              className="border border-slate-600 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              Aplică
            </Button>

            <Button
              onClick={clearPriceFilter}
              className="border border-slate-700 text-slate-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
            >
              Șterge
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
        <h3 className="mb-4 font-semibold text-white">Producători</h3>
        <div className="max-h-[220px] space-y-2 overflow-auto pr-1 lg:max-h-[300px]">
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
                <span className="truncate">{b}</span>
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

      {activeFiltersCount > 0 && (
        <Button
          onClick={clearAllFilters}
          className="w-full border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
        >
          Resetează filtrele ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl lg:text-4xl">
            Componente PC
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg lg:text-base">
            Descoperă cele mai bune componente pentru build-ul tău
          </p>
        </motion.div>

        {toast && (
          <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            {toast}
          </div>
        )}

        <div className="mb-6 flex min-h-[46px] items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 backdrop-blur-sm transition focus-within:border-cyan-500/60">
          <Search className="h-5 w-5 shrink-0 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută după nume, brand sau categorie..."
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Șterge căutarea"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mb-6 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-left text-sm font-semibold text-slate-200 shadow-lg shadow-black/10 transition hover:border-cyan-500/40 hover:bg-slate-800/80"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
              Filtre
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </span>

            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition ${
                mobileFiltersOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4">{renderFilters({ isMobile: true })}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden w-64 flex-shrink-0 lg:block"
          >
            <div className="lg:sticky lg:top-24">{renderFilters()}</div>
          </motion.aside>

          <div className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-slate-400">
                {filteredProducts.length} produse găsite
                {searchQuery.trim() && (
                  <span className="ml-1 text-slate-500">
                    pentru „{searchQuery.trim()}”
                  </span>
                )}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-900/50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded p-2 transition-all ${
                      viewMode === "grid"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                    title="Grid"
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
                    title="Listă"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none sm:w-auto"
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
                    ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
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
                      className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/50 ${
                        viewMode === "list" ? "p-4 sm:flex sm:gap-6" : "p-4"
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
                            : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
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
                            ? "mb-4 h-48 w-full sm:mb-0 sm:h-32 sm:w-32 sm:flex-shrink-0"
                            : "mb-4 flex h-52 w-full items-center justify-center sm:h-56"
                        }`}
                      >
                        <ImageWithFallback
                          src={resolveProductImage(product.imageUrl)}
                          alt={product.name}
                          className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                            viewMode === "list"
                              ? "object-contain p-3 sm:object-cover sm:p-0"
                              : "object-contain p-3"
                          }`}
                        />
                      </div>

                      <div className={`min-w-0 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <p className="mb-1 truncate text-xs font-medium text-cyan-400">
                          {product.brand}
                        </p>

                        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] break-words font-semibold leading-snug text-white">
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
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="break-words text-2xl font-bold text-cyan-400">
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
                className="mt-12 flex flex-col items-center gap-3"
              >
                <div className="text-xs text-slate-500">
                  Pagina {page} din {totalPages}
                </div>

                {/* Mobile pagination: compact, no horizontal scroll */}
                <div className="flex w-full max-w-[320px] items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-900/50 p-2 backdrop-blur-sm sm:hidden">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={page === 1}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Înapoi
                  </button>

                  <div className="flex min-w-0 flex-1 items-center justify-center px-3">
                    <span className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/25">
                      {page} / {totalPages}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(current + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Înainte
                  </button>
                </div>

                {/* Tablet/Desktop pagination */}
                <div className="hidden max-w-full items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-2 backdrop-blur-sm sm:flex">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={page === 1}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Înapoi
                  </button>

                  {(() => {
                    const getPages = () => {
                      if (totalPages <= 5) {
                        return Array.from({ length: totalPages }, (_, i) => i + 1);
                      }

                      if (page <= 3) {
                        return [1, 2, 3, 4, "...", totalPages];
                      }

                      if (page >= totalPages - 2) {
                        return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                      }

                      return [1, "...", page - 1, page, page + 1, "...", totalPages];
                    };

                    return getPages().map((p, index) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="flex h-10 w-8 items-center justify-center text-sm text-slate-500"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition-all ${
                            p === page
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                              : "border border-slate-700 bg-slate-950/60 text-slate-400 hover:border-cyan-500 hover:bg-slate-800 hover:text-cyan-400"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(current + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="h-10 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Înainte
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
