import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Check,
  X,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Package,
  Truck,
  MessageSquare,
  Send,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { resolveProductImage } from "../lib/resolveProductImage";
import Seo from "../components/Seo";

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

function parseMaybeJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getRawImageValue(imageLike) {
  if (!imageLike) return "";
  if (typeof imageLike === "string") return imageLike;
  return imageLike.imageUrl || imageLike.url || imageLike.src || "";
}

function getPrimaryRawImageValue(product) {
  if (!product) return "";

  if (Array.isArray(product.images) && product.images.length > 0) {
    const sorted = [...product.images].sort((a, b) => {
      const aPrimary = Number(Boolean(a?.isPrimary));
      const bPrimary = Number(Boolean(b?.isPrimary));
      const aOrder = Number(a?.sortOrder ?? 0);
      const bOrder = Number(b?.sortOrder ?? 0);

      return bPrimary - aPrimary || aOrder - bOrder;
    });

    const firstRaw = getRawImageValue(sorted[0]);
    if (firstRaw) return firstRaw;
  }

  return product.imageUrl || "";
}

function addToGuestCart(product, quantity = 1) {
  const items = loadGuestCart();
  const existing = items.find((x) => x.productId === product.id);

  if (existing) {
    const next = items.map((x) =>
      x.productId === product.id
        ? { ...x, quantity: (x.quantity || 1) + quantity }
        : x
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
      quantity,
      imageUrl: getPrimaryRawImageValue(product),
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
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30" />
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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function normalizeDate(dateValue) {
  if (!dateValue) return "—";

  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hasAdminRole(source) {
  const directRoles = Array.isArray(source?.roles) ? source.roles : [];
  if (directRoles.some((role) => String(role).trim().toLowerCase() === "admin")) {
    return true;
  }

  const roles = Array.isArray(source?.userRoles) ? source.userRoles : [];
  return roles.some((userRole) => {
    const roleName =
      userRole?.role?.name ||
      userRole?.name ||
      userRole?.roleName ||
      "";

    return String(roleName).trim().toLowerCase() === "admin";
  });
}

function getRatingDistribution(reviewsList) {
  const total = reviewsList.length;

  if (!total) {
    return [
      { stars: 5, percent: 0 },
      { stars: 4, percent: 0 },
      { stars: 3, percent: 0 },
      { stars: 2, percent: 0 },
      { stars: 1, percent: 0 },
    ];
  }

  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsList.filter((r) => Number(r.rating) === stars).length;

    return {
      stars,
      percent: Math.round((count / total) * 100),
    };
  });
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState(0);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState("");

  const [product, setProduct] = useState(null);

  const [wishlistIds, setWishlistIds] = useState(() => loadGuestWishlistIds());
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    content: "",
  });
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    question: "",
  });
  const [questionError, setQuestionError] = useState("");
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerForm, setAnswerForm] = useState({
    answer: "",
  });
  const [answerError, setAnswerError] = useState("");
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const fetchProduct = async () => {
    if (!id) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data || null);
      setSelectedImage(0);
      setQuantity(1);
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut încărca produsul.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const images = useMemo(() => {
    if (!product) return [];

    const rawImages = Array.isArray(product.images) ? product.images : [];
    const mapped = rawImages
      .map((img, idx) => {
        const raw = getRawImageValue(img);
        if (!raw) return null;

        return {
          key: img?.id || `${raw}-${idx}`,
          raw,
          src: resolveProductImage(raw),
          alt: img?.altText || img?.alt || product.name || `Imagine produs ${idx + 1}`,
          isPrimary: Boolean(img?.isPrimary),
          sortOrder: Number(img?.sortOrder ?? idx),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder
      );

    if (mapped.length > 0) {
      const seen = new Set();

      return mapped.filter((img) => {
        const key = img.raw;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const fallbackRaw = getPrimaryRawImageValue(product);
    if (!fallbackRaw) return [];

    return [
      {
        key: `main-${fallbackRaw}`,
        raw: fallbackRaw,
        src: resolveProductImage(fallbackRaw),
        alt: product.name || "Produs",
        isPrimary: true,
        sortOrder: 0,
      },
    ];
  }, [product]);

  useEffect(() => {
    if (selectedImage >= images.length) {
      setSelectedImage(0);
    }
  }, [images.length, selectedImage]);

  const reviewsList = useMemo(() => {
    const raw =
      (Array.isArray(product?.reviewsList) && product.reviewsList) ||
      (Array.isArray(product?.reviewItems) && product.reviewItems) ||
      (Array.isArray(product?.reviews) && product.reviews) ||
      [];

    return raw.map((review) => ({
      id: review.id,
      author:
        review.authorName ||
        review.author ||
        review.user?.name ||
        review.user?.email ||
        "Utilizator",
      verified: Boolean(review.verifiedPurchase ?? review.verified),
      rating: Number(review.rating || 0),
      title: review.title || "",
      content: review.content || "",
      date: review.createdAt || review.date || review.updatedAt || null,
    }));
  }, [product]);

  const questions = useMemo(() => {
    const raw =
      (Array.isArray(product?.questionsList) && product.questionsList) ||
      (Array.isArray(product?.questions) && product.questions) ||
      [];

    return raw.map((q) => ({
      id: q.id,
      author:
        q.authorName ||
        q.author ||
        q.user?.name ||
        q.user?.email ||
        "Utilizator",
      question: q.question || "",
      date: q.createdAt || q.date || q.updatedAt || null,
      answers: Array.isArray(q.answers)
        ? q.answers.map((answer) => ({
            id: answer.id,
            author:
              answer.authorName ||
              answer.author ||
              answer.user?.name ||
              answer.user?.email ||
              "Utilizator",
            answer: answer.answer || "",
            isOfficial: Boolean(answer.isOfficial),
            date: answer.createdAt || answer.date || answer.updatedAt || null,
          }))
        : [],
    }));
  }, [product]);

  const specificationEntries = useMemo(() => {
    if (Array.isArray(product?.specificationsList) && product.specificationsList.length > 0) {
      return product.specificationsList
        .map((spec) => [spec?.name, spec?.value])
        .filter(([key]) => Boolean(key));
    }

    if (Array.isArray(product?.specifications) && product.specifications.length > 0) {
      return product.specifications
        .map((spec) => [spec?.name, spec?.value])
        .filter(([key]) => Boolean(key));
    }

    if (
      product?.specifications &&
      typeof product.specifications === "object" &&
      !Array.isArray(product.specifications)
    ) {
      return Object.entries(product.specifications);
    }

    return [];
  }, [product]);

  const features = useMemo(
    () => parseMaybeJsonArray(product?.features),
    [product]
  );

  const pros = useMemo(() => parseMaybeJsonArray(product?.pros), [product]);
  const cons = useMemo(() => parseMaybeJsonArray(product?.cons), [product]);

  const ratingDistribution = useMemo(
    () => getRatingDistribution(reviewsList),
    [reviewsList]
  );

  const displayRating = Number(product?.rating || 0);
  const displayReviewCount = Math.max(
    Number(product?.reviewCount ?? product?.reviews ?? 0),
    reviewsList.length
  );

  const isWishlisted = product ? wishlistIds.has(product.id) : false;
  const hasReviews = reviewsList.length > 0;
  const hasQuestions = questions.length > 0;
  const hasSpecifications = specificationEntries.length > 0;
  const hasFeatures = features.length > 0;
  const hasPros = pros.length > 0;
  const hasCons = cons.length > 0;

  const warrantyValue = useMemo(() => {
    const entry = specificationEntries.find(([key]) =>
      /garan/i.test(String(key || ""))
    );

    return entry ? String(entry[1] ?? "") : null;
  }, [specificationEntries]);

  const isAdmin = useMemo(() => hasAdminRole(user), [user]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const ensureAuthenticated = () => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login");
      return false;
    }

    return true;
  };

  const openReviewModal = () => {
    if (!ensureAuthenticated()) return;

    setReviewError("");
    setReviewForm({
      rating: 5,
      title: "",
      content: "",
    });
    setShowReviewModal(true);
  };

  const openQuestionModal = () => {
    if (!ensureAuthenticated()) return;

    setQuestionError("");
    setQuestionForm({
      question: "",
    });
    setShowQuestionModal(true);
  };

  const openAnswerModal = (question) => {
    if (!ensureAuthenticated()) return;

    setSelectedQuestion(question || null);
    setAnswerError("");
    setAnswerForm({
      answer: "",
    });
    setShowAnswerModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");

    const content = reviewForm.content.trim();
    const title = reviewForm.title.trim();
    const rating = Number(reviewForm.rating);

    if (!content) {
      setReviewError("Scrie conținutul review-ului.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setReviewError("Rating-ul trebuie să fie între 1 și 5.");
      return;
    }

    setReviewSubmitting(true);

    try {
      const payload = {
        rating,
        content,
      };

      if (title) {
        payload.title = title;
      }

      const res = await api.post(`/products/${id}/reviews`, payload);

      setShowReviewModal(false);
      await fetchProduct();
      setActiveTab("reviews");
      showToast(
        res.data?.message ||
          "Review-ul a fost trimis și așteaptă aprobarea unui administrator ✅"
      );
    } catch (e2) {
      setReviewError(
        e2?.response?.data?.error ||
          e2?.response?.data?.message ||
          "Nu am putut trimite review-ul."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setQuestionError("");

    const question = questionForm.question.trim();

    if (!question) {
      setQuestionError("Scrie întrebarea.");
      return;
    }

    setQuestionSubmitting(true);

    try {
      const res = await api.post(`/products/${id}/questions`, {
        question,
      });

      setShowQuestionModal(false);
      await fetchProduct();
      setActiveTab("qa");
      showToast(
        res.data?.message ||
          "Întrebarea a fost trimisă și așteaptă aprobarea unui administrator ✅"
      );
    } catch (e2) {
      setQuestionError(
        e2?.response?.data?.error || "Nu am putut trimite întrebarea."
      );
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    setAnswerError("");

    const answer = answerForm.answer.trim();

    if (!selectedQuestion?.id) {
      setAnswerError("Întrebarea selectată nu este validă.");
      return;
    }

    if (answer.length < 10) {
      setAnswerError("Răspunsul trebuie să aibă minim 10 caractere.");
      return;
    }

    setAnswerSubmitting(true);

    try {
      const endpoint = isAdmin
        ? `/admin/questions/${selectedQuestion.id}/answers`
        : `/products/questions/${selectedQuestion.id}/answers`;

      const res = await api.post(endpoint, {
        answer,
      });

      setShowAnswerModal(false);
      setSelectedQuestion(null);
      setAnswerForm({
        answer: "",
      });

      await fetchProduct();
      setActiveTab("qa");

      showToast(
        res.data?.message ||
          (isAdmin
            ? "Răspunsul oficial a fost publicat ✅"
            : "Răspunsul a fost trimis și așteaptă aprobarea unui administrator ✅")
      );
    } catch (e2) {
      setAnswerError(
        e2?.response?.data?.error ||
          e2?.response?.data?.message ||
          "Nu am putut trimite răspunsul."
      );
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;

    try {
      if (!isAuthLoading && isAuthenticated) {
        await api.post("/cart/items", {
          productId: product.id,
          quantity,
        });
      } else {
        addToGuestCart(product, quantity);
      }

      window.dispatchEvent(new Event("cart:updated"));
      showToast("Produs adăugat în coș ✅");
    } catch (e) {
      showToast(e?.response?.data?.error || "Nu am putut adăuga în coș.");
    }
  };

  const toggleWishlist = async () => {
    if (!product || wishlistBusy) return;

    const prev = new Set(wishlistIds);
    const wasIn = prev.has(product.id);

    const next = new Set(prev);
    if (wasIn) next.delete(product.id);
    else next.add(product.id);

    setWishlistIds(next);

    if (!isAuthLoading && !isAuthenticated) {
      saveGuestWishlistIds(next);
      window.dispatchEvent(new Event("wishlist:updated"));
      showToast(
        wasIn ? "Produs scos din wishlist." : "Produs adăugat în wishlist ❤️"
      );
      return;
    }

    setWishlistBusy(true);

    try {
      if (wasIn) {
        await api.delete(`/wishlist/items/${product.id}`);
      } else {
        await api.post("/wishlist/items", { productId: product.id });
      }

      window.dispatchEvent(new Event("wishlist:updated"));
      showToast(
        wasIn ? "Produs scos din wishlist." : "Produs adăugat în wishlist ❤️"
      );
    } catch {
      setWishlistIds(prev);
      showToast("Nu am putut actualiza wishlist-ul.");
    } finally {
      setWishlistBusy(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: product?.name || "Produs",
          text: product?.shortDescription || "",
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast("Link copiat în clipboard 🔗");
        return;
      }

      showToast("Nu am putut copia link-ul.");
    } catch {
      showToast("Nu am putut distribui produsul.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 text-slate-300 sm:p-8">
            Se încarcă produsul...
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 text-center backdrop-blur-sm sm:p-10">
          <h1 className="mb-4 text-2xl font-bold text-white">Produs negăsit</h1>
          <p className="mb-6 text-slate-400">
            {errorMsg || "Acest produs nu există."}
          </p>
          <Button
            onClick={() => navigate("/components")}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
          >
            Înapoi la componente
          </Button>
        </div>
      </div>
    );
  }

  const currentImage =
    images[selectedImage]?.src ||
    resolveProductImage(getPrimaryRawImageValue(product));

  return (
    <>
      <Seo
        title={product.name || "Produs"}
        description={
          product.shortDescription ||
          product.description ||
          `Vezi detalii, specificații, preț și disponibilitate pentru ${product.name || "acest produs"} pe ConfigEXP.`
        }
        image={currentImage}
        type="product"
      />

      <div className="min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        {toast && (
          <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            {toast}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-xs text-slate-400 sm:mb-6 sm:gap-2 sm:text-sm"
        >
          <Link to="/" className="flex-shrink-0 hover:text-cyan-400">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          <Link to="/components" className="flex-shrink-0 hover:text-cyan-400">
            Componente
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          <Link
            to={`/components/${encodeURIComponent(product.category || "Toate")}`}
            className="max-w-[120px] flex-shrink-0 truncate hover:text-cyan-400 sm:max-w-none"
          >
            {product.category || "Categorie"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          <span className="min-w-0 truncate text-white">{product.name}</span>
        </motion.div>

        <div className="mb-10 grid gap-6 lg:mb-12 lg:grid-cols-2 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0 space-y-4"
          >
            <button
              type="button"
              onClick={() => setImagePreviewOpen(true)}
              className="group relative w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 text-left backdrop-blur-sm transition hover:border-cyan-500/40 sm:p-8"
              title="Mărește imaginea"
            >
              <ImageWithFallback
                src={currentImage}
                alt={product.name}
                className="h-[280px] w-full object-contain transition duration-300 group-hover:scale-[1.02] sm:h-96"
              />

            
            </button>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-3 sm:gap-4">
                {images.map((img, idx) => (
                  <button
                    key={`${img.key}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`overflow-hidden rounded-xl border-2 bg-slate-900/40 transition-all ${
                      selectedImage === idx
                        ? "border-cyan-500 ring-2 ring-cyan-500/30"
                        : "border-slate-700/50 hover:border-slate-600"
                    }`}
                  >
                    <ImageWithFallback
                      src={img.src}
                      alt={img.alt}
                      className="h-20 w-full object-contain p-2 sm:h-24"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0 space-y-5 sm:space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {product.brand && (
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  {product.brand}
                </Badge>
              )}

              {product.category && (
                <Badge className="border border-slate-600 bg-slate-900/50 text-slate-300">
                  {product.category}
                </Badge>
              )}

              {product.stock > 0 && product.stock < 10 && (
                <Badge className="bg-orange-500/20 text-orange-400">
                  Doar {product.stock} în stoc
                </Badge>
              )}

              {product.stock <= 0 && (
                <Badge className="bg-red-500/20 text-red-300">Stoc epuizat</Badge>
              )}
            </div>

            <h1 className="break-words bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl">
              {product.name}
            </h1>

            {displayReviewCount > 0 ? (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        i < Math.floor(displayRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-base font-semibold text-white sm:text-lg">
                  {displayRating.toFixed(1)}
                </span>

                <span className="text-sm text-slate-400 sm:text-base">
                  ({displayReviewCount} review-uri)
                </span>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Acest produs nu are review-uri încă.
              </div>
            )}

            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              {product.shortDescription || "Fără descriere scurtă momentan."}
            </p>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5 text-center sm:p-6 sm:text-left">
              <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-start sm:gap-3">
                <div className="flex flex-wrap items-baseline justify-center gap-2 sm:justify-start">
                  <span className="break-words bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold leading-none text-transparent sm:text-5xl">
                    {formatRon(grossFromNet(product.priceRon))}
                  </span>
                  <span className="text-xl text-cyan-400 sm:text-2xl">RON</span>
                </div>

                <span className="text-sm text-slate-400">
                  ({formatRon(product.priceRon)} RON fără TVA)
                </span>
              </div>
            </div>

            {hasFeatures && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <h3 className="mb-3 font-semibold text-white">
                  Caracteristici principale:
                </h3>
                <ul className="space-y-2">
                  {features.slice(0, 4).map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-slate-400"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                      <span>{String(feature)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
                <span className="text-sm font-medium text-slate-400">Cantitate</span>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-white transition-colors hover:border-cyan-500 hover:bg-cyan-500/10"
                  >
                    -
                  </button>

                  <span className="flex h-10 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/60 text-center text-lg font-semibold text-white">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(Math.max(1, product.stock || 1), q + 1)
                      )
                    }
                    disabled={product.stock <= 0}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-white transition-colors hover:border-cyan-500 hover:bg-cyan-500/10 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <Button
                  onClick={addToCart}
                  disabled={product.stock <= 0}
                  className="col-span-2 gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 sm:flex-1"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock > 0 ? "Adaugă în coș" : "Indisponibil"}
                </Button>

                <Button
                  onClick={toggleWishlist}
                  disabled={wishlistBusy}
                  className={`border ${
                    isWishlisted
                      ? "border-pink-500 bg-pink-500/10 text-pink-400"
                      : "border-slate-600 bg-transparent text-slate-300 hover:border-pink-500 hover:bg-pink-500/10 hover:text-pink-400"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </Button>

                <Button
                  onClick={handleShare}
                  className="border border-slate-600 bg-transparent text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {warrantyValue && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                  <Shield className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <span className="text-sm text-slate-300">
                    Garanție {warrantyValue}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                <Truck className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                <span className="text-sm text-slate-300">Livrare 24-48h</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                <Package className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                <span className="text-sm text-slate-300">Retur 14 zile</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                <Award className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                <span className="text-sm text-slate-300">Produs original</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6 grid w-full grid-cols-2 gap-1 rounded-xl border border-slate-700/50 bg-slate-900/50 p-1 backdrop-blur-sm sm:mb-8 md:grid-cols-4">
            {[
              { key: "description", label: "Descriere" },
              { key: "specifications", label: "Specificații" },
              {
                key: "reviews",
                label:
                  displayReviewCount > 0
                    ? `Review-uri (${displayReviewCount})`
                    : "Review-uri",
              },
              { key: "qa", label: "Întrebări & Răspuns" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-2 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
                    : "text-slate-300 hover:text-cyan-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-8">
                <h2 className="mb-4 break-words text-xl font-bold text-white sm:text-2xl">
                  Despre {product.name}
                </h2>

                <div className="space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {(product.description || "Descriere indisponibilă momentan.")
                    .split("\n\n")
                    .map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                </div>

                {hasFeatures && (
                  <div className="mt-8">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white sm:text-xl">
                      <Zap className="h-5 w-5 text-cyan-400 sm:h-6 sm:w-6" />
                      Caracteristici complete
                    </h3>

                    <ul className="grid gap-3 sm:grid-cols-2">
                      {features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 rounded-lg border border-slate-700/30 bg-slate-800/30 p-3"
                        >
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
                          <span className="text-slate-300">{String(feature)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(hasPros || hasCons) && (
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        Avantaje
                      </h3>

                      {hasPros ? (
                        <ul className="space-y-2">
                          {pros.map((pro, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-slate-300"
                            >
                              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                              <span>{String(pro)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Nu există avantaje adăugate.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                        <X className="h-5 w-5 text-orange-400" />
                        Dezavantaje
                      </h3>

                      {hasCons ? (
                        <ul className="space-y-2">
                          {cons.map((con, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-slate-300"
                            >
                              <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />
                              <span>{String(con)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Nu există dezavantaje adăugate.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">
                Specificații tehnice complete
              </h2>

              {hasSpecifications ? (
                <div className="space-y-2">
                  {specificationEntries.map(([key, value], idx) => (
                    <div
                      key={`${key}-${idx}`}
                      className={`grid gap-1 rounded-lg p-4 sm:grid-cols-2 sm:gap-4 ${
                        idx % 2 === 0 ? "bg-slate-800/30" : ""
                      }`}
                    >
                      <span className="font-medium text-slate-400">
                        {String(key ?? "")}
                      </span>
                      <span className="break-words text-white">{String(value ?? "")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">
                  Nu există specificații disponibile momentan.
                </p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-white">Review-uri</h2>
                <Button
                  onClick={openReviewModal}
                  className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 sm:w-auto"
                >
                  <MessageSquare className="h-4 w-4" />
                  Scrie un review
                </Button>
              </div>

              {hasReviews ? (
                <>
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-8">
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="text-center">
                        <div className="mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                          {displayRating.toFixed(1)}
                        </div>

                        <div className="mb-2 flex justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                i < Math.floor(displayRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-slate-400">
                          Bazat pe {displayReviewCount} review-uri
                        </p>
                      </div>

                      <div className="space-y-2">
                        {ratingDistribution.map((item) => (
                          <div key={item.stars} className="flex items-center gap-3">
                            <span className="w-12 text-sm text-slate-400">
                              {item.stars} <Star className="inline h-3 w-3" />
                            </span>

                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>

                            <span className="w-12 text-right text-sm text-slate-400">
                              {item.percent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {reviewsList.map((review, idx) => (
                    <motion.div
                      key={review.id || `${review.author}-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6"
                    >
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-white">
                              {review.author}
                            </span>

                            {review.verified && (
                              <Badge className="bg-green-500/20 text-green-400">
                                <Check className="mr-1 h-3 w-3" />
                                Verificat
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Number(review.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-600"
                                  }`}
                                />
                              ))}
                            </div>

                            <span className="text-sm text-slate-400">
                              {normalizeDate(review.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="mb-2 font-semibold text-white">
                          {review.title}
                        </h4>
                      )}

                      <p className="break-words text-slate-300">{review.content}</p>
                    </motion.div>
                  ))}
                </>
              ) : (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 text-center text-slate-400 backdrop-blur-sm">
                  Nu există review-uri momentan pentru acest produs.
                </div>
              )}
            </div>
          )}

          {activeTab === "qa" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Întrebări & Răspunsuri
                </h2>
                <Button
                  onClick={openQuestionModal}
                  className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  Pune o întrebare
                </Button>
              </div>

              {hasQuestions ? (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <motion.div
                      key={q.id || `${q.question}-${idx}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6"
                    >
                      <div className="mb-3">
                        <div className="mb-1 text-sm text-slate-400">
                          {q.author} • {normalizeDate(q.date)}
                        </div>
                        <h3 className="break-words font-semibold text-white">{q.question}</h3>
                      </div>

                      <div className="mb-4 flex justify-start sm:justify-end">
                        <Button
                          type="button"
                          onClick={() => openAnswerModal(q)}
                          className="w-full gap-2 border border-slate-600 bg-transparent text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400 sm:w-auto"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Răspunde
                        </Button>
                      </div>

                      {Array.isArray(q.answers) && q.answers.length > 0 ? (
                        <div className="space-y-3 border-t border-slate-700/50 pt-4">
                          {q.answers.map((answer, answerIdx) => (
                            <div
                              key={answer.id || `${answer.author}-${answerIdx}`}
                              className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-4"
                            >
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="font-medium text-white">
                                  {answer.author}
                                </span>

                                {answer.isOfficial && (
                                  <Badge className="bg-cyan-500/20 text-cyan-400">
                                    Oficial
                                  </Badge>
                                )}
                              </div>

                              <div className="mb-2 text-xs text-slate-500">
                                {normalizeDate(answer.date)}
                              </div>

                              <p className="break-words text-sm text-slate-300">
                                {answer.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Nu există răspunsuri încă.
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 text-center text-slate-400 backdrop-blur-sm">
                  Nu există întrebări momentan pentru acest produs.
                </div>
              )}
            </div>
          )}
        </motion.div>

        {imagePreviewOpen && (
          <div className="fixed inset-0 z-[100]">
            <button
              type="button"
              className="absolute inset-0 bg-black/80"
              onClick={() => setImagePreviewOpen(false)}
              aria-label="Închide imaginea mărită"
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <div className="pointer-events-auto relative w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                <button
                  type="button"
                  onClick={() => setImagePreviewOpen(false)}
                  className="absolute right-3 top-3 z-10 rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-slate-300 transition hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>

                <ImageWithFallback
                  src={currentImage}
                  alt={product.name}
                  className="max-h-[78vh] w-full object-contain"
                />

                {images.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={`preview-${img.key}-${idx}`}
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-slate-900 transition ${
                          selectedImage === idx
                            ? "border-cyan-500"
                            : "border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <ImageWithFallback
                          src={img.src}
                          alt={img.alt}
                          className="h-full w-full object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showReviewModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/70"
              onClick={() => setShowReviewModal(false)}
            />

            <div className="relative mx-auto flex min-h-full w-full max-w-2xl items-center px-4 py-6">
              <div className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Scrie un review</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Review-ul va deveni public după aprobarea unui administrator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {reviewError && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Rating *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewForm((prev) => ({ ...prev, rating: star }))
                          }
                          className="rounded-lg p-2 transition hover:bg-slate-800"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= reviewForm.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Titlu
                    </label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) =>
                        setReviewForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Ex: Foarte bun pentru gaming"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Conținut review *
                    </label>
                    <textarea
                      rows={6}
                      value={reviewForm.content}
                      onChange={(e) =>
                        setReviewForm((prev) => ({ ...prev, content: e.target.value }))
                      }
                      placeholder="Scrie experiența ta cu produsul..."
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </div>

                  <div className="grid gap-3 sm:flex sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="border border-slate-600 bg-transparent text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      Anulează
                    </Button>

                    <Button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                    >
                      {reviewSubmitting ? "Se trimite..." : "Trimite review"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showQuestionModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/70"
              onClick={() => setShowQuestionModal(false)}
            />

            <div className="relative mx-auto flex min-h-full w-full max-w-2xl items-center px-4 py-6">
              <div className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Pune o întrebare</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Întrebarea va deveni publică după aprobarea unui administrator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {questionError && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {questionError}
                  </div>
                )}

                <form onSubmit={handleQuestionSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Întrebarea ta *
                    </label>
                    <textarea
                      rows={6}
                      value={questionForm.question}
                      onChange={(e) =>
                        setQuestionForm({ question: e.target.value })
                      }
                      placeholder="Ex: Vine cu cooler inclus? Este compatibil cu AM5?"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </div>

                  <div className="grid gap-3 sm:flex sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => setShowQuestionModal(false)}
                      className="border border-slate-600 bg-transparent text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      Anulează
                    </Button>

                    <Button
                      type="submit"
                      disabled={questionSubmitting}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                    >
                      {questionSubmitting ? "Se trimite..." : "Trimite întrebarea"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showAnswerModal && selectedQuestion && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/70"
              onClick={() => {
                setShowAnswerModal(false);
                setSelectedQuestion(null);
              }}
            />

            <div className="relative mx-auto flex min-h-full w-full max-w-2xl items-center px-4 py-6">
              <div className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Răspunde la întrebare
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {isAdmin
                        ? "Răspunsul tău va fi publicat imediat ca răspuns oficial."
                        : "Răspunsul tău va deveni public după aprobarea unui administrator."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAnswerModal(false);
                      setSelectedQuestion(null);
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4 rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                    Întrebare
                  </div>
                  <p className="break-words text-sm text-slate-200">
                    {selectedQuestion.question}
                  </p>
                </div>

                {answerError && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {answerError}
                  </div>
                )}

                <form onSubmit={handleAnswerSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Răspunsul tău *
                    </label>
                    <textarea
                      rows={6}
                      value={answerForm.answer}
                      onChange={(e) =>
                        setAnswerForm({
                          answer: e.target.value,
                        })
                      }
                      placeholder="Scrie răspunsul aici..."
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </div>

                  <div className="grid gap-3 sm:flex sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAnswerModal(false);
                        setSelectedQuestion(null);
                      }}
                      className="border border-slate-600 bg-transparent text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      Anulează
                    </Button>

                    <Button
                      type="submit"
                      disabled={answerSubmitting}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                    >
                      {answerSubmitting
                        ? "Se trimite..."
                        : isAdmin
                        ? "Publică răspuns oficial"
                        : "Trimite răspuns"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
