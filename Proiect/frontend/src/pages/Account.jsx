import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Settings,
  Shield,
  History,
  Heart,
  LogOut,
  Cpu,
  ShoppingCart,
  Trash2,
  Edit,
  Plus,
  X,
  Check,
  ReceiptText,
  CalendarDays,
  Truck,
  PackageOpen,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

function Badge({ className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Button({
  variant = "solid",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg transition font-semibold disabled:cursor-not-allowed disabled:opacity-60";
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const variants = {
    solid:
      "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50",
    outline:
      "border border-slate-600 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400",
    danger:
      "border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Modal({
  children,
  onClose,
  maxWidth = "max-w-2xl",
  disableScroll = false,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div
        className={`relative max-h-[90vh] w-full ${maxWidth} ${
          disableScroll ? "overflow-hidden" : "overflow-y-auto"
        } rounded-2xl border border-slate-700/60 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6">
      <label className="mb-2 block text-sm font-medium text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-slate-500" />}
        {children}
      </div>
    </div>
  );
}

function statusBadgeClass(status) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-500/20 text-green-400";
    case "SHIPPED":
    case "PROCESSING":
    case "PAID":
      return "bg-blue-500/20 text-blue-400";
    case "CANCELED":
      return "bg-red-500/20 text-red-400";
    case "PENDING":
    default:
      return "bg-slate-500/20 text-slate-300";
  }
}

function statusLabel(status) {
  switch (status) {
    case "DELIVERED":
      return "Livrat";
    case "SHIPPED":
      return "Expediat";
    case "PROCESSING":
      return "Procesare";
    case "PAID":
      return "Plătit";
    case "CANCELED":
      return "Anulat";
    case "PENDING":
    default:
      return "În așteptare";
  }
}

function shippingMethodLabel(method) {
  switch (method) {
    case "COURIER_STANDARD":
      return "Curier standard";
    case "COURIER_EXPRESS":
      return "Curier expres";
    case "EASYBOX":
      return "EasyBox";
    default:
      return "—";
  }
}

function paymentMethodLabel(method) {
  switch (method) {
    case "CARD":
      return "Card";
    case "CASH_ON_DELIVERY":
      return "Ramburs";
    default:
      return "—";
  }
}

function formatRon(value) {
  return Number(value || 0).toLocaleString("ro-RO");
}

function formatDateRo(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeWishlistResponse(data) {
  if (data && typeof data === "object" && Array.isArray(data.items)) {
    return { listsCount: 1, totalItems: data.items.length };
  }

  if (Array.isArray(data) && (data.length === 0 || !data[0]?.items)) {
    return { listsCount: 1, totalItems: data.length };
  }

  if (Array.isArray(data) && data[0]?.items && Array.isArray(data[0].items)) {
    const listsCount = data.length;
    const totalItems = data.reduce(
      (s, wl) => s + (Array.isArray(wl.items) ? wl.items.length : 0),
      0
    );
    return { listsCount, totalItems };
  }

  if (data && typeof data === "object" && Array.isArray(data.wishlists)) {
    const listsCount = data.wishlists.length;
    const totalItems = data.wishlists.reduce(
      (s, wl) => s + (Array.isArray(wl.items) ? wl.items.length : 0),
      0
    );
    return { listsCount, totalItems };
  }

  return { listsCount: 0, totalItems: 0 };
}

function hasAdminRole(source) {
  const roles = Array.isArray(source?.userRoles) ? source.userRoles : [];

  return roles.some((userRole) => {
    const roleName =
      userRole?.role?.name || userRole?.name || userRole?.roleName || "";

    return String(roleName).trim().toLowerCase() === "admin";
  });
}

const emptyAddressForm = {
  label: "",
  recipientName: "",
  phone: "",
  country: "RO",
  county: "",
  city: "",
  street: "",
  postalCode: "",
  isDefault: false,
};

const VAT_RATE = 0.21;

function grossFromNet(net) {
  return Number(net || 0) * (1 + VAT_RATE);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeSlotKey(slotKey, fallbackLabel = "") {
  const raw = normalizeText(slotKey || fallbackLabel);

  if (["cpu", "procesor", "procesoare"].includes(raw)) return "cpu";
  if (["gpu", "placa video", "placi video"].includes(raw)) return "gpu";
  if (["ram", "memorie ram"].includes(raw)) return "ram";
  if (["storage", "stocare", "ssd", "hdd"].includes(raw)) return "storage";
  if (["motherboard", "placa de baza", "placi de baza"].includes(raw)) {
    return "motherboard";
  }
  if (["psu", "sursa", "surse", "sursa alimentare"].includes(raw)) return "psu";
  if (["case", "carcasa", "carcase"].includes(raw)) return "case";
  if (["cooling", "cooler", "coolere"].includes(raw)) return "cooling";

  return raw || "";
}

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState("orders");

  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [orders, setOrders] = useState([]);
  const [orderDetailsLoadingId, setOrderDetailsLoadingId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalError, setOrderModalError] = useState("");

  const [buildsLoading, setBuildsLoading] = useState(true);
  const [buildsError, setBuildsError] = useState("");
  const [builds, setBuilds] = useState([]);
  const [buildCartLoadingId, setBuildCartLoadingId] = useState("");
  const [buildDeleteLoadingId, setBuildDeleteLoadingId] = useState("");
  const [showBuildEditModal, setShowBuildEditModal] = useState(false);
  const [selectedBuildForEdit, setSelectedBuildForEdit] = useState(null);
  const [buildDraftItems, setBuildDraftItems] = useState([]);
  const [buildEditName, setBuildEditName] = useState("");
  const [buildEditError, setBuildEditError] = useState("");
  const [buildEditSuccess, setBuildEditSuccess] = useState("");
  const [buildEditSaveLoading, setBuildEditSaveLoading] = useState(false);
  const [buildPickerOpen, setBuildPickerOpen] = useState(false);
  const [buildPickerSlot, setBuildPickerSlot] = useState(null);
  const [buildPickerProducts, setBuildPickerProducts] = useState([]);
  const [buildPickerQuery, setBuildPickerQuery] = useState("");
  const [buildPickerLoading, setBuildPickerLoading] = useState(false);
  const [buildPickerError, setBuildPickerError] = useState("");
  const [buildEditCompatibility, setBuildEditCompatibility] = useState(null);
  const [buildEditCompatibilityLoading, setBuildEditCompatibilityLoading] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState("");
  const [wishlistStats, setWishlistStats] = useState({
    listsCount: 0,
    totalItems: 0,
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });
  const [profileRoles, setProfileRoles] = useState([]);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountForm, setDeleteAccountForm] = useState({
    confirmationText: "",
    currentPassword: "",
  });
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [addressSaveLoading, setAddressSaveLoading] = useState(false);
  const [addressSaveSuccess, setAddressSaveSuccess] = useState("");
  const [addressDeleteLoadingId, setAddressDeleteLoadingId] = useState("");
  const [defaultAddressLoadingId, setDefaultAddressLoadingId] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);

  const displayName = profileForm.name || user?.name || "Utilizator";
  const displayEmail = profileForm.email || user?.email || "—";

  const initials = (displayName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  const isAdmin = useMemo(() => {
    if (profileRoles.length) {
      return hasAdminRole({ userRoles: profileRoles });
    }
    return hasAdminRole(user);
  }, [profileRoles, user]);

  const buildEditNetTotal = useMemo(
    () =>
      buildDraftItems.reduce(
        (sum, item) =>
          sum + Number(item.unitPriceRon || 0) * Number(item.quantity || 1),
        0
      ),
    [buildDraftItems]
  );

  const buildEditGrossTotal = useMemo(
    () => grossFromNet(buildEditNetTotal),
    [buildEditNetTotal]
  );

  const buildEditSnapshot = useMemo(() => {
    if (!selectedBuildForEdit) return null;

    return {
      ...selectedBuildForEdit,
      name: buildEditName.trim() || selectedBuildForEdit.name,
      items: buildDraftItems,
      totalNetRon: Math.round(buildEditNetTotal),
      totalVatRon: Math.round(buildEditGrossTotal - buildEditNetTotal),
      totalGrossRon: Math.round(buildEditGrossTotal),
      isCompatible: buildEditCompatibility?.isCompatible ?? selectedBuildForEdit.isCompatible,
      estimatedSystemPowerW:
        buildEditCompatibility?.estimatedSystemPowerW ??
        selectedBuildForEdit.estimatedSystemPowerW,
      recommendedPsuW:
        buildEditCompatibility?.recommendedPsuW ??
        selectedBuildForEdit.recommendedPsuW,
    };
  }, [
    selectedBuildForEdit,
    buildEditName,
    buildDraftItems,
    buildEditNetTotal,
    buildEditGrossTotal,
  ]);

  const buildPickerSelectedMap = useMemo(() => {
    return buildDraftItems.reduce((acc, item) => {
      const slotKey = normalizeSlotKey(item.slotKey, item.slotLabel || item.category);
      if (slotKey && item.productId) {
        acc[slotKey] = item.productId;
      }
      return acc;
    }, {});
  }, [buildDraftItems]);

  const filteredBuildPickerProducts = useMemo(() => {
    const q = normalizeText(buildPickerQuery);
    if (!q) return buildPickerProducts;

    return buildPickerProducts.filter((product) => {
      const haystack = normalizeText(
        `${product.name || ""} ${product.brand || ""} ${product.category || ""}`
      );
      return haystack.includes(q);
    });
  }, [buildPickerProducts, buildPickerQuery]);

  const activeBuildCompatibility = useMemo(() => {
    return {
      isCompatible:
        buildEditCompatibility?.isCompatible ??
        selectedBuildForEdit?.isCompatible ??
        true,
      errors: Array.isArray(buildEditCompatibility?.errors)
        ? buildEditCompatibility.errors
        : [],
      warnings: Array.isArray(buildEditCompatibility?.warnings)
        ? buildEditCompatibility.warnings
        : [],
      estimatedSystemPowerW:
        buildEditCompatibility?.estimatedSystemPowerW ??
        selectedBuildForEdit?.estimatedSystemPowerW ??
        0,
      recommendedPsuW:
        buildEditCompatibility?.recommendedPsuW ??
        selectedBuildForEdit?.recommendedPsuW ??
        0,
    };
  }, [buildEditCompatibility, selectedBuildForEdit]);

  const TabButton = ({ value, icon: Icon, children }) => {
    const active = tab === value;
    return (
      <button
        type="button"
        onClick={() => setTab(value)}
        className={`flex shrink-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${
          active
            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
            : "text-slate-300 hover:text-cyan-300"
        }`}
      >
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </button>
    );
  };

  const fetchMyOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const res = await api.get("/orders/my");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setOrdersError(
        e?.response?.data?.error || "Nu am putut încărca comenzile."
      );
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      setOrderModalError("");
      setOrderDetailsLoadingId(orderId);

      const res = await api.get(`/orders/my/${orderId}`);
      setSelectedOrder(res.data || null);
      setShowOrderModal(true);
    } catch (e) {
      setOrderModalError(
        e?.response?.data?.error || "Nu am putut încărca detaliile comenzii."
      );
    } finally {
      setOrderDetailsLoadingId("");
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setOrderModalError("");
  };

  const fetchMyBuilds = async () => {
    setBuildsLoading(true);
    setBuildsError("");

    try {
      const res = await api.get("/builds/me");
      setBuilds(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setBuildsError(
        e?.response?.data?.error || "Nu am putut încărca build-urile."
      );
      setBuilds([]);
    } finally {
      setBuildsLoading(false);
    }
  };

  const fetchWishlistStats = async () => {
    setWishlistLoading(true);
    setWishlistError("");

    try {
      let data;
      try {
        const res = await api.get("/wishlist");
        data = res.data;
      } catch {
        const res = await api.get("/wishlist/items");
        data = res.data;
      }

      setWishlistStats(normalizeWishlistResponse(data));
    } catch (e) {
      setWishlistError(
        e?.response?.data?.error || "Nu am putut încărca wishlist-ul."
      );
      setWishlistStats({ listsCount: 0, totalItems: 0 });
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const res = await api.get("/users/me/profile");
      const data = res.data || {};

      setProfileForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth || "",
      });

      setProfileRoles(Array.isArray(data.userRoles) ? data.userRoles : []);
    } catch (e) {
      setProfileError(
        e?.response?.data?.error || "Nu am putut încărca profilul."
      );
      setProfileForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        dateOfBirth: "",
      });
      setProfileRoles(Array.isArray(user?.userRoles) ? user.userRoles : []);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchMyAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError("");

    try {
      const res = await api.get("/users/me/addresses");
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setAddressesError(
        e?.response?.data?.error || "Nu am putut încărca adresele."
      );
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const addBuildToCart = async (build) => {
    const validItems = (build?.items || []).filter((item) => item.productId);

    if (!validItems.length) {
      alert("Acest build nu are produse valide pentru coș.");
      return;
    }

    try {
      setBuildCartLoadingId(build.id);

      for (const item of validItems) {
        await api.post("/cart/items", {
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
        });
      }

      window.dispatchEvent(new Event("cart:updated"));
      alert(`Build-ul "${build.name}" a fost adăugat în coș! 🛒`);
      navigate("/cart");
    } catch (e) {
      alert(
        e?.response?.data?.error || "Nu am putut adăuga build-ul în coș."
      );
    } finally {
      setBuildCartLoadingId("");
    }
  };

  const deleteBuild = async (buildId) => {
    const confirmed = window.confirm(
      "Sigur vrei să ștergi acest build? Această acțiune este permanentă."
    );

    if (!confirmed) return;

    try {
      setBuildDeleteLoadingId(buildId);
      await api.delete(`/builds/${buildId}`);
      setBuilds((prev) => prev.filter((build) => build.id !== buildId));
      window.dispatchEvent(new Event("builds:updated"));
    } catch (e) {
      alert(e?.response?.data?.error || "Nu am putut șterge build-ul.");
    } finally {
      setBuildDeleteLoadingId("");
    }
  };

  const openEditBuildModal = (build) => {
    setSelectedBuildForEdit(build || null);
    setBuildDraftItems(Array.isArray(build?.items) ? build.items : []);
    setBuildEditName(build?.name || "");
    setBuildEditError("");
    setBuildEditSuccess("");
    setBuildPickerOpen(false);
    setBuildPickerSlot(null);
    setBuildPickerProducts([]);
    setBuildPickerQuery("");
    setBuildPickerError("");
    setBuildEditCompatibility({
      isCompatible: build?.isCompatible !== false,
      errors: [],
      warnings: [],
      estimatedSystemPowerW: Number(build?.estimatedSystemPowerW || 0),
      recommendedPsuW: Number(build?.recommendedPsuW || 0),
    });
    setShowBuildEditModal(true);
  };

  const closeEditBuildModal = () => {
    setShowBuildEditModal(false);
    setSelectedBuildForEdit(null);
    setBuildDraftItems([]);
    setBuildEditName("");
    setBuildEditError("");
    setBuildEditSuccess("");
    setBuildPickerOpen(false);
    setBuildPickerSlot(null);
    setBuildPickerProducts([]);
    setBuildPickerQuery("");
    setBuildPickerError("");
    setBuildEditCompatibility(null);
    setBuildEditCompatibilityLoading(false);
  };

  const openBuildPicker = async (component) => {
    const slotKey = normalizeSlotKey(
      component?.slotKey,
      component?.slotLabel || component?.category
    );

    setBuildEditError("");
    setBuildEditSuccess("");
    setBuildPickerError("");
    setBuildPickerQuery("");
    setBuildPickerProducts([]);
    setBuildPickerSlot({ ...component, normalizedSlotKey: slotKey });
    setBuildPickerOpen(true);

    if (!slotKey) {
      setBuildPickerError("Nu pot identifica slotul acestei componente.");
      return;
    }

    try {
      setBuildPickerLoading(true);

      // Important:
      // În editorul de build-uri salvate afișăm toate produsele din aceeași categorie,
      // nu doar produsele filtrate de compatibilitatea din Configurator.
      // Altfel, aceeași placă video poate apărea într-un build și dispărea în altul
      // din cauza PSU-ului, carcasei sau altor reguli de compatibilitate.
      const res = await api.get("/products");
      const allProducts = Array.isArray(res.data) ? res.data : [];

      const categoryNeedle = normalizeText(component?.category || component?.slotLabel);
      const slotNeedle = normalizeText(component?.slotLabel || component?.slotKey);

      const matchingProducts = allProducts
        .filter((product) => {
          const productCategory = normalizeText(product.category);

          return (
            productCategory === categoryNeedle ||
            productCategory === slotNeedle ||
            productCategory.includes(categoryNeedle) ||
            categoryNeedle.includes(productCategory) ||
            productCategory.includes(slotNeedle) ||
            slotNeedle.includes(productCategory)
          );
        })
        .sort((a, b) => {
          const stockA = Number(a.stock || 0) > 0 ? 1 : 0;
          const stockB = Number(b.stock || 0) > 0 ? 1 : 0;

          if (stockA !== stockB) return stockB - stockA;

          return Number(b.priceRon || 0) - Number(a.priceRon || 0);
        });

      setBuildPickerProducts(matchingProducts);
    } catch (e) {
      setBuildPickerError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Nu am putut încărca produsele pentru acest slot."
      );
      setBuildPickerProducts([]);
    } finally {
      setBuildPickerLoading(false);
    }
  };

  const closeBuildPicker = () => {
    setBuildPickerOpen(false);
    setBuildPickerSlot(null);
    setBuildPickerProducts([]);
    setBuildPickerQuery("");
    setBuildPickerError("");
  };

  const selectBuildReplacementProduct = (product) => {
    if (!buildPickerSlot || !product?.id) return;

    const pickerSlotKey = normalizeSlotKey(
      buildPickerSlot.slotKey || buildPickerSlot.normalizedSlotKey,
      buildPickerSlot.slotLabel || buildPickerSlot.category
    );

    setBuildDraftItems((prev) =>
      prev.map((item) => {
        const itemSlotKey = normalizeSlotKey(
          item.slotKey,
          item.slotLabel || item.category
        );

        if (item.id !== buildPickerSlot.id && itemSlotKey !== pickerSlotKey) {
          return item;
        }

        return {
          ...item,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          imageUrl: product.imageUrl || item.imageUrl || "",
          unitPriceRon: Number(product.priceRon || 0),
          quantity: Number(item.quantity || 1),
          slotKey: item.slotKey || pickerSlotKey,
          slotLabel: item.slotLabel || buildPickerSlot.slotLabel,
        };
      })
    );

    closeBuildPicker();
  };

  const handleSaveBuildEdit = async () => {
    const nextName = buildEditName.trim();

    setBuildEditError("");
    setBuildEditSuccess("");

    if (!selectedBuildForEdit?.id) {
      setBuildEditError("Build-ul selectat nu este valid.");
      return;
    }

    if (!nextName) {
      setBuildEditError("Numele configurației nu poate fi gol.");
      return;
    }

    const editableItems = buildDraftItems
      .filter((item) => item.productId)
      .map((item) => ({
        slotKey: normalizeSlotKey(item.slotKey, item.slotLabel || item.category),
        slotId: normalizeSlotKey(item.slotKey, item.slotLabel || item.category),
        slotLabel: item.slotLabel,
        productId: item.productId,
        quantity: Number(item.quantity || 1),
      }));

    try {
      setBuildEditSaveLoading(true);

      const res = await api.patch(`/builds/${selectedBuildForEdit.id}`, {
        name: nextName,
        items: editableItems,
      });

      const fallbackUpdatedBuild = {
        ...buildEditSnapshot,
        id: selectedBuildForEdit.id,
        name: nextName,
        items: buildDraftItems,
      };

      const updatedBuild = {
        ...fallbackUpdatedBuild,
        ...(res.data || {}),
        name: res.data?.name || nextName,
        items: Array.isArray(res.data?.items) ? res.data.items : buildDraftItems,
      };

      setBuilds((prev) =>
        prev.map((build) =>
          build.id === selectedBuildForEdit.id ? { ...build, ...updatedBuild } : build
        )
      );

      setSelectedBuildForEdit(updatedBuild);
      setBuildDraftItems(Array.isArray(updatedBuild.items) ? updatedBuild.items : []);
      setBuildEditSuccess("Configurația a fost actualizată cu succes.");
      window.dispatchEvent(new Event("builds:updated"));
    } catch (e) {
      setBuildEditError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Nu am putut salva modificările. Backend-ul trebuie să accepte PATCH /builds/:id cu { name, items }."
      );
    } finally {
      setBuildEditSaveLoading(false);
    }
  };

  const editBuild = (build) => {
    openEditBuildModal(build);
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileSaveSuccess("");
    setProfileError("");
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setProfileSaveLoading(true);
    setProfileSaveSuccess("");
    setProfileError("");

    try {
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null,
        dateOfBirth: profileForm.dateOfBirth || null,
      };

      const res = await api.patch("/users/me/profile", payload);
      const data = res.data || {};

      setProfileForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth || "",
      });

      if (Array.isArray(data.userRoles)) {
        setProfileRoles(data.userRoles);
      }

      setProfileSaveSuccess("Profilul a fost actualizat cu succes.");
    } catch (e) {
      setProfileError(
        e?.response?.data?.error || "Nu am putut salva profilul."
      );
    } finally {
      setProfileSaveLoading(false);
    }
  };

  const openChangePasswordModal = () => {
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowChangePasswordModal(true);
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangePasswordField = (field, value) => {
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePasswordSubmit = async () => {
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError("Parolele noi nu coincid.");
      return;
    }

    try {
      setChangePasswordLoading(true);

      const { data } = await api.post("/auth/change-password", {
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword,
      });

      setChangePasswordSuccess(
        data?.message || "Parola a fost schimbată cu succes."
      );

      setChangePasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      setChangePasswordError(
        e?.response?.data?.error ||
          e?.response?.data?.details?.[0]?.message ||
          "Nu am putut schimba parola."
      );
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const openDeleteAccountModal = () => {
    setDeleteAccountError("");
    setDeleteAccountForm({
      confirmationText: "",
      currentPassword: "",
    });
    setShowDeletePassword(false);
    setShowDeleteAccountModal(true);
  };

  const closeDeleteAccountModal = () => {
    setShowDeleteAccountModal(false);
    setDeleteAccountError("");
    setDeleteAccountForm({
      confirmationText: "",
      currentPassword: "",
    });
  };

  const handleDeleteAccountField = (field, value) => {
    setDeleteAccountError("");
    setDeleteAccountForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteAccountSubmit = async () => {
    setDeleteAccountError("");

    try {
      setDeleteAccountLoading(true);

      const { data } = await api.delete("/auth/delete-account", {
        data: {
          confirmationText: deleteAccountForm.confirmationText,
          currentPassword: deleteAccountForm.currentPassword || undefined,
        },
      });

      alert(data?.message || "Contul a fost șters definitiv.");
      window.location.href = "/";
    } catch (e) {
      setDeleteAccountError(
        e?.response?.data?.error ||
          e?.response?.data?.details?.[0]?.message ||
          "Nu am putut șterge contul."
      );
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const getFreshAddressForm = () => ({
    ...emptyAddressForm,
    recipientName: profileForm.name || "",
    phone: profileForm.phone || "",
    isDefault: addresses.length === 0,
  });

  const openCreateAddressModal = () => {
    setEditingAddressId("");
    setAddressSaveSuccess("");
    setAddressesError("");
    setAddressForm(getFreshAddressForm());
    setShowAddressModal(true);
  };

  const openEditAddressModal = (address) => {
    setEditingAddressId(address.id);
    setAddressSaveSuccess("");
    setAddressesError("");
    setAddressForm({
      label: address.label || "",
      recipientName: address.recipientName || "",
      phone: address.phone || "",
      country: address.country || "RO",
      county: address.county || "",
      city: address.city || "",
      street: address.street || "",
      postalCode: address.postalCode || "",
      isDefault: Boolean(address.isDefault),
    });
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddressId("");
    setAddressForm(getFreshAddressForm());
  };

  const handleAddressFieldChange = (field, value) => {
    setAddressSaveSuccess("");
    setAddressesError("");
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAddress = async () => {
    setAddressSaveLoading(true);
    setAddressSaveSuccess("");
    setAddressesError("");

    try {
      const payload = {
        label: addressForm.label.trim(),
        recipientName: addressForm.recipientName.trim() || null,
        phone: addressForm.phone.trim() || null,
        country: addressForm.country.trim() || "RO",
        county: addressForm.county.trim(),
        city: addressForm.city.trim(),
        street: addressForm.street.trim(),
        postalCode: addressForm.postalCode.trim() || null,
        isDefault: Boolean(addressForm.isDefault),
      };

      if (editingAddressId) {
        await api.patch(`/users/me/addresses/${editingAddressId}`, payload);
        setAddressSaveSuccess("Adresa a fost actualizată cu succes.");
      } else {
        await api.post("/users/me/addresses", payload);
        setAddressSaveSuccess("Adresa a fost adăugată cu succes.");
      }

      await fetchMyAddresses();
      setShowAddressModal(false);
      setEditingAddressId("");
      setAddressForm(getFreshAddressForm());
    } catch (e) {
      setAddressesError(
        e?.response?.data?.error || "Nu am putut salva adresa."
      );
    } finally {
      setAddressSaveLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setDefaultAddressLoadingId(addressId);
      await api.post(`/users/me/addresses/${addressId}/default`);
      await fetchMyAddresses();
    } catch (e) {
      setAddressesError(
        e?.response?.data?.error || "Nu am putut seta adresa implicită."
      );
    } finally {
      setDefaultAddressLoadingId("");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm("Sigur vrei să ștergi această adresă?");

    if (!confirmed) return;

    try {
      setAddressDeleteLoadingId(addressId);
      await api.delete(`/users/me/addresses/${addressId}`);
      await fetchMyAddresses();

      if (editingAddressId === addressId) {
        closeAddressModal();
      }
    } catch (e) {
      setAddressesError(
        e?.response?.data?.error || "Nu am putut șterge adresa."
      );
    } finally {
      setAddressDeleteLoadingId("");
    }
  };

  useEffect(() => {
    fetchMyOrders();
    fetchMyBuilds();
    fetchWishlistStats();
    fetchMyProfile();
    fetchMyAddresses();

    const onWishlistUpdated = () => fetchWishlistStats();
    const onBuildsUpdated = () => fetchMyBuilds();

    window.addEventListener("wishlist:updated", onWishlistUpdated);
    window.addEventListener("builds:updated", onBuildsUpdated);

    return () => {
      window.removeEventListener("wishlist:updated", onWishlistUpdated);
      window.removeEventListener("builds:updated", onBuildsUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const shouldLockScroll =
      showBuildEditModal ||
      showOrderModal ||
      showAddressModal ||
      showChangePasswordModal ||
      showDeleteAccountModal;

    if (!shouldLockScroll) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [
    showBuildEditModal,
    showOrderModal,
    showAddressModal,
    showChangePasswordModal,
    showDeleteAccountModal,
  ]);

  useEffect(() => {
    if (!showBuildEditModal || buildDraftItems.length === 0) return;

    let cancelled = false;

    async function checkBuildDraftCompatibility() {
      try {
        setBuildEditCompatibilityLoading(true);

        const res = await api.post("/configurator/compatibility", {
          selected: buildPickerSelectedMap,
        });

        if (!cancelled) {
          setBuildEditCompatibility(
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
          setBuildEditCompatibility((prev) => prev);
        }
      } finally {
        if (!cancelled) {
          setBuildEditCompatibilityLoading(false);
        }
      }
    }

    checkBuildDraftCompatibility();

    return () => {
      cancelled = true;
    };
  }, [showBuildEditModal, buildDraftItems, buildPickerSelectedMap]);

  const ordersCount = orders.length;

  const spentTotal = useMemo(
    () => orders.reduce((s, o) => s + (Number(o.totalRon) || 0), 0),
    [orders]
  );

  const buildsCount = builds.length;

  const wishlistCountDisplay = wishlistLoading
    ? "…"
    : wishlistError
    ? "—"
    : wishlistStats.totalItems;

  const wishlistSubtitle = useMemo(() => {
    if (wishlistLoading) return "Se încarcă...";
    if (wishlistError) return "Eroare la încărcare";
    if (wishlistStats.listsCount > 1) {
      return `Produse favorite • ${wishlistStats.listsCount} liste`;
    }
    return "Produse favorite";
  }, [wishlistLoading, wishlistError, wishlistStats.listsCount]);

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-700/40 bg-slate-900/30 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0">
            <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-bold text-white ring-2 ring-cyan-500/30">
                  {initials}
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="inline-block overflow-visible bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text pb-1 text-4xl font-bold leading-[1.15] text-transparent">
                  {displayName}
                </h1>
                <p className="mt-0 break-all text-sm text-slate-400 sm:text-base">
                  {displayEmail}
                </p>
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="outline"
                className="w-full gap-2 sm:w-auto"
                type="button"
                onClick={() => navigate("/admin")}
              >
                <Shield className="h-4 w-4" />
                Dashboard Admin
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-2 flex items-center justify-between">
              <Package className="h-5 w-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">Total</Badge>
            </div>
            <div className="text-3xl font-bold text-white">{ordersCount}</div>
            <div className="text-sm text-slate-400">Comenzi plasate</div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-2 flex items-center justify-between">
              <CreditCard className="h-5 w-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Total</Badge>
            </div>
            <div className="break-words text-3xl font-bold text-white">
              {formatRon(spentTotal)}
            </div>
            <div className="text-sm text-slate-400">RON cheltuiți</div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-2 flex items-center justify-between">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">Builds</Badge>
            </div>
            <div className="text-3xl font-bold text-white">
              {buildsLoading ? "…" : buildsError ? "—" : buildsCount}
            </div>
            <div className="text-sm text-slate-400">Configurații salvate</div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-2 flex items-center justify-between">
              <Heart className="h-5 w-5 text-pink-400" />
              <Badge className="bg-pink-500/20 text-pink-400">Wishlist</Badge>
            </div>

            <div className="text-3xl font-bold text-white">
              {wishlistCountDisplay}
            </div>

            <div className="text-sm text-slate-400">{wishlistSubtitle}</div>

            {!wishlistLoading && wishlistError && (
              <div className="mt-2 text-xs text-red-300">{wishlistError}</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="mb-8 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50 p-1 backdrop-blur-sm">
            <div className="flex min-w-max gap-1 sm:min-w-0 sm:grid sm:w-full sm:grid-cols-5">
              <TabButton value="orders" icon={Package}>
                Comenzi
              </TabButton>
              <TabButton value="builds" icon={Cpu}>
                Configurații
              </TabButton>
              <TabButton value="profile" icon={User}>
                Profil
              </TabButton>
              <TabButton value="addresses" icon={MapPin}>
                Adrese
              </TabButton>
              <TabButton value="settings" icon={Settings}>
                Setări
              </TabButton>
            </div>
          </div>

          {tab === "orders" && (
            <div className="space-y-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-white">Comenzile mele</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 sm:w-auto"
                  onClick={fetchMyOrders}
                  disabled={ordersLoading}
                  type="button"
                >
                  <History className="h-4 w-4" />
                  {ordersLoading ? "Se încarcă..." : "Reîmprospătează"}
                </Button>
              </div>

              {ordersError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {ordersError}
                </div>
              )}

              {orderModalError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {orderModalError}
                </div>
              )}

              {ordersLoading ? (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">
                  Se încarcă comenzile...
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">
                  Nu ai comenzi încă.
                </div>
              ) : (
                orders.map((order, index) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  const totalRon = Number(order.totalRon) || 0;
                  const createdAt = order.createdAt
                    ? new Date(order.createdAt)
                    : null;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-800/50 sm:p-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h3 className="break-all font-semibold text-white">
                              Comandă #{order.orderNumber || order.id}
                            </h3>
                            <Badge className={statusBadgeClass(order.status)}>
                              {statusLabel(order.status)}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 sm:gap-3">
                            <span>
                              {createdAt
                                ? createdAt.toLocaleDateString("ro-RO")
                                : "—"}
                            </span>
                            <span>•</span>
                            <span>{items.length} produse</span>
                            <span>•</span>
                            <span className="font-medium text-cyan-400">
                              {formatRon(totalRon)} RON
                            </span>
                          </div>

                          {order.shippingMethod === "EASYBOX" && (
                            <div className="mt-3 rounded-lg border border-slate-700/50 bg-slate-950/40 px-3 py-2 text-xs text-slate-300">
                              Livrare: <span className="text-cyan-300">EasyBox</span> — {order.easyboxLockerName || "—"}
                            </div>
                          )}
                        </div>

                        <div className="grid gap-2 sm:flex">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => openOrderDetails(order.id)}
                            disabled={orderDetailsLoadingId === order.id}
                            className="w-full sm:w-auto"
                          >
                            {orderDetailsLoadingId === order.id
                              ? "Se încarcă..."
                              : "Detalii"}
                          </Button>

                          {order.status === "DELIVERED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => alert("Comandă din nou (în curând)")}
                              className="w-full sm:w-auto"
                            >
                              Comandă din nou
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {showOrderModal && selectedOrder && (
                <Modal onClose={closeOrderModal} maxWidth="max-w-5xl">
                  <div className="mb-6 flex flex-col gap-4 border-b border-slate-700/50 pb-6 md:flex-row md:items-start md:justify-between">
                    <div className="pr-10">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                          <ReceiptText className="h-5 w-5 text-cyan-400" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-all text-xl font-bold text-white sm:text-2xl">
                            Comandă #{selectedOrder.orderNumber || selectedOrder.id}
                          </h3>
                          <p className="text-sm text-slate-400">
                            Detalii complete despre comandă
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-cyan-400" />
                          {formatDateRo(selectedOrder.createdAt)}
                        </div>

                        <Badge className={statusBadgeClass(selectedOrder.status)}>
                          {statusLabel(selectedOrder.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                        {formatRon(selectedOrder.totalRon)} RON
                      </div>
                      <div className="text-xs text-slate-400">Total comandă</div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <PackageOpen className="h-5 w-5 text-cyan-400" />
                          <h4 className="text-lg font-semibold text-white">
                            Produse
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {(selectedOrder.items || []).map((item) => (
                            <div
                              key={item.id}
                              className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-4"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                                      {item.category}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                      {item.brand}
                                    </span>
                                  </div>

                                  <h5 className="break-words font-medium text-white">
                                    {item.productName}
                                  </h5>

                                  <p className="mt-1 text-sm text-slate-400">
                                    Cantitate: {item.quantity} × {formatRon(item.unitPriceRon)} RON
                                  </p>
                                </div>

                                <div className="text-left md:text-right">
                                  <div className="font-semibold text-cyan-400">
                                    {formatRon(item.lineTotalRon)} RON
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Subtotal produs
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-cyan-400" />
                            <h4 className="text-lg font-semibold text-white">
                              Livrare
                            </h4>
                          </div>

                          <div className="space-y-2 text-sm text-slate-300">
                            <p>
                              <span className="text-slate-400">Metodă:</span> {shippingMethodLabel(selectedOrder.shippingMethod)}
                            </p>

                            {selectedOrder.shippingMethod === "EASYBOX" ? (
                              <>
                                <p><span className="text-slate-400">Locker:</span> {selectedOrder.easyboxLockerName || "—"}</p>
                                <p><span className="text-slate-400">Oraș:</span> {selectedOrder.easyboxCity || "—"}</p>
                              </>
                            ) : (
                              <>
                                <p><span className="text-slate-400">Adresă:</span> {selectedOrder.shippingStreet || "—"}</p>
                                <p><span className="text-slate-400">Localitate:</span> {selectedOrder.shippingCity || "—"}, {selectedOrder.shippingCounty || "—"}</p>
                                <p><span className="text-slate-400">Cod poștal:</span> {selectedOrder.shippingPostalCode || "—"}</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-cyan-400" />
                            <h4 className="text-lg font-semibold text-white">
                              Plată
                            </h4>
                          </div>

                          <div className="space-y-2 text-sm text-slate-300">
                            <p><span className="text-slate-400">Metodă:</span> {paymentMethodLabel(selectedOrder.paymentMethod)}</p>
                            <p><span className="text-slate-400">Status:</span> {statusLabel(selectedOrder.status)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <User className="h-5 w-5 text-cyan-400" />
                          <h4 className="text-lg font-semibold text-white">
                            Client
                          </h4>
                        </div>

                        <div className="space-y-2 break-words text-sm text-slate-300">
                          <p>{selectedOrder.customerName || "—"}</p>
                          <p>{selectedOrder.customerEmail || "—"}</p>
                          <p>{selectedOrder.customerPhone || "—"}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <ReceiptText className="h-5 w-5 text-cyan-400" />
                          <h4 className="text-lg font-semibold text-white">
                            Sumar
                          </h4>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between gap-4 text-slate-300">
                            <span>Subtotal produse</span>
                            <span>{formatRon(selectedOrder.subtotalRon)} RON</span>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-slate-300">
                            <span>TVA</span>
                            <span>{formatRon(selectedOrder.vatRon)} RON</span>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-slate-300">
                            <span>Transport</span>
                            <span>{formatRon(selectedOrder.shippingFeeRon)} RON</span>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-slate-300">
                            <span>Taxă plată</span>
                            <span>{formatRon(selectedOrder.paymentFeeRon)} RON</span>
                          </div>

                          <div className="border-t border-slate-700 pt-3">
                            <div className="flex items-center justify-between gap-4 font-semibold text-white">
                              <span>Total</span>
                              <span className="text-cyan-400">
                                {formatRon(selectedOrder.totalRon)} RON
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:flex">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full flex-1"
                          onClick={closeOrderModal}
                        >
                          Închide
                        </Button>

                        {selectedOrder.status === "DELIVERED" && (
                          <Button
                            type="button"
                            className="w-full flex-1"
                            onClick={() => alert("Comandă din nou (în curând)")}
                          >
                            Comandă din nou
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          )}

          {tab === "builds" && (
            <div className="space-y-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-white">Configurații salvate</h2>

                <Button
                  type="button"
                  className="w-full gap-2 sm:w-auto"
                  onClick={() => navigate("/configurator")}
                >
                  <Cpu className="h-4 w-4" />
                  Configurație nouă
                </Button>
              </div>

              {buildsError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {buildsError}
                </div>
              )}

              {buildsLoading ? (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">
                  Se încarcă build-urile...
                </div>
              ) : builds.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 text-center backdrop-blur-sm sm:p-12"
                >
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/50">
                    <Cpu className="h-12 w-12 text-slate-600" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Niciun build salvat
                  </h3>

                  <p className="mb-6 text-slate-400">
                    Începe să construiești PC-ul perfect pentru tine
                  </p>

                  <Button type="button" className="gap-2" onClick={() => navigate("/configurator")}>
                    <Cpu className="h-4 w-4" />
                    Creează build
                  </Button>
                </motion.div>
              ) : (
                <div className="grid gap-6">
                  {builds.map((build, index) => {
                    const items = Array.isArray(build.items) ? build.items : [];
                    const totalPrice = Number(build.totalGrossRon) || Number(build.totalNetRon) || 0;

                    return (
                      <motion.div
                        key={build.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="group overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-800/50"
                      >
                        <div className="border-b border-slate-700/50 p-5 sm:p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                                  <Cpu className="h-5 w-5 text-cyan-400" />
                                </div>

                                <div className="min-w-0">
                                  <h3 className="break-words text-xl font-semibold text-white">{build.name}</h3>
                                  <p className="text-sm text-slate-400">{items.length} componente • {formatDateRo(build.createdAt)}</p>
                                </div>
                              </div>

                              {!build.isCompatible && (
                                <div className="mt-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                  Build salvat cu incompatibilități
                                </div>
                              )}
                            </div>

                            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-center md:text-right">
                              <div className="flex items-baseline justify-center gap-2 md:justify-end">
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                                  {formatRon(totalPrice)}
                                </span>
                                <span className="text-sm font-semibold text-slate-400">
                                  RON
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6">
                          <div className="mb-4 space-y-2">
                            {items.map((component) => (
                              <div key={component.id} className="flex flex-col gap-2 rounded-lg border border-slate-700/30 bg-slate-800/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                                      {component.slotLabel || "Componentă"}
                                    </Badge>
                                    <span className="text-xs text-slate-500">{component.brand}</span>
                                  </div>
                                  <p className="mt-1 break-words text-sm text-white">{component.productName}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <span className="font-semibold text-cyan-400">{formatRon(component.unitPriceRon)} RON</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid gap-2 sm:flex sm:flex-wrap">
                            <Button type="button" className="w-full gap-2 sm:w-auto sm:flex-1" onClick={() => addBuildToCart(build)} disabled={buildCartLoadingId === build.id}>
                              <ShoppingCart className="h-4 w-4" />
                              {buildCartLoadingId === build.id ? "Se adaugă..." : "Adaugă în coș"}
                            </Button>
                            <Button type="button" variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => editBuild(build)}>
                              <Edit className="h-4 w-4" />
                              Editează
                            </Button>
                            <Button type="button" variant="danger" className="w-full gap-2 sm:w-auto" onClick={() => deleteBuild(build.id)} disabled={buildDeleteLoadingId === build.id}>
                              <Trash2 className="h-4 w-4" />
                              {buildDeleteLoadingId === build.id ? "Se șterge..." : "Șterge"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">Informații personale</h2>
              </div>

              {profileError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{profileError}</div>
              )}

              {profileSaveSuccess && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">{profileSaveSuccess}</div>
              )}

              {profileLoading ? (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">Se încarcă profilul...</div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
                    <Field label="Nume complet" icon={User}>
                      <input type="text" value={profileForm.name} onChange={(e) => handleProfileFieldChange("name", e.target.value)} className="min-w-0 flex-1 bg-transparent text-white focus:outline-none" />
                    </Field>
                    <Field label="Email" icon={Mail}>
                      <input type="email" value={profileForm.email} onChange={(e) => handleProfileFieldChange("email", e.target.value)} className="min-w-0 flex-1 bg-transparent text-white focus:outline-none" />
                    </Field>
                    <Field label="Telefon" icon={Phone}>
                      <input type="tel" value={profileForm.phone} onChange={(e) => handleProfileFieldChange("phone", e.target.value)} className="min-w-0 flex-1 bg-transparent text-white focus:outline-none" />
                    </Field>
                    <Field label="Data nașterii">
                      <input type="date" value={profileForm.dateOfBirth} onChange={(e) => handleProfileFieldChange("dateOfBirth", e.target.value)} className="min-w-0 flex-1 bg-transparent text-white focus:outline-none" />
                    </Field>
                  </div>

                  <div className="grid gap-3 sm:flex sm:justify-end">
                    <Button variant="outline" type="button" onClick={fetchMyProfile} className="w-full sm:w-auto">Anulează</Button>
                    <Button type="button" onClick={handleSaveProfile} disabled={profileSaveLoading} className="w-full sm:w-auto">
                      {profileSaveLoading ? "Se salvează..." : "Salvează modificările"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div className="space-y-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-white">Adresele mele</h2>
                <Button type="button" className="w-full gap-2 sm:w-auto" onClick={openCreateAddressModal}>
                  <Plus className="h-4 w-4" /> Adaugă adresă nouă
                </Button>
              </div>

              {addressesError && !showAddressModal && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{addressesError}</div>
              )}
              {addressSaveSuccess && !showAddressModal && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">{addressSaveSuccess}</div>
              )}

              {addressesLoading ? (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">Se încarcă adresele...</div>
              ) : addresses.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[32vh] flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 text-center backdrop-blur-sm sm:p-12">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/50"><MapPin className="h-12 w-12 text-slate-600" /></div>
                  <h3 className="mb-2 text-2xl font-bold text-white">Nicio adresă salvată</h3>
                  <p className="mb-6 text-slate-400">Adaugă o adresă pentru checkout mai rapid</p>
                  <Button type="button" className="gap-2" onClick={openCreateAddressModal}><Plus className="h-4 w-4" />Adaugă adresă</Button>
                </motion.div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {addresses.map((addr, index) => (
                    <motion.div key={addr.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-cyan-400" />
                            <h3 className="break-words font-semibold text-white">{addr.label}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {addr.isDefault && <Badge className="bg-cyan-500/20 text-cyan-400">Implicit</Badge>}
                            {addr.recipientName && <Badge className="bg-slate-700/60 text-slate-200">{addr.recipientName}</Badge>}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 space-y-1 break-words text-sm text-slate-400">
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.county}{addr.postalCode ? `, ${addr.postalCode}` : ""}</p>
                        <p>{addr.country}</p>
                        {addr.phone && <p>Telefon: {addr.phone}</p>}
                      </div>

                      <div className="grid gap-2 sm:flex sm:flex-wrap">
                        <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto sm:flex-1" type="button" onClick={() => openEditAddressModal(addr)}><Edit className="h-4 w-4" />Editează</Button>
                        {!addr.isDefault && (
                          <Button variant="outline" size="sm" type="button" className="w-full sm:w-auto" onClick={() => handleSetDefaultAddress(addr.id)} disabled={defaultAddressLoadingId === addr.id}>{defaultAddressLoadingId === addr.id ? "Se setează..." : "Setează implicită"}</Button>
                        )}
                        <Button variant="danger" size="sm" type="button" className="w-full sm:w-auto" onClick={() => handleDeleteAddress(addr.id)} disabled={addressDeleteLoadingId === addr.id}>{addressDeleteLoadingId === addr.id ? "Se șterge..." : "Șterge"}</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {showAddressModal && (
                <Modal onClose={closeAddressModal} maxWidth="max-w-3xl">
                  <h3 className="mb-6 pr-10 text-2xl font-bold text-white">{editingAddressId ? "Editează adresă" : "Adaugă adresă nouă"}</h3>
                  {addressesError && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{addressesError}</div>}
                  {addressSaveSuccess && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">{addressSaveSuccess}</div>}

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ["label", "Etichetă", "Acasă / Serviciu"],
                      ["recipientName", "Destinatar", "Nume destinatar"],
                      ["phone", "Telefon", "07xx xxx xxx"],
                      ["country", "Țară", "RO"],
                      ["county", "Județ", ""],
                      ["city", "Oraș", ""],
                    ].map(([field, label, placeholder]) => (
                      <div key={field}>
                        <label className="mb-2 block text-sm font-medium text-slate-400">{label}</label>
                        <input type="text" value={addressForm[field]} onChange={(e) => handleAddressFieldChange(field, e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none" />
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-400">Stradă / adresă completă</label>
                      <input type="text" value={addressForm.street} onChange={(e) => handleAddressFieldChange("street", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none" />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-400">Cod poștal</label>
                      <input type="text" value={addressForm.postalCode} onChange={(e) => handleAddressFieldChange("postalCode", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none" />
                    </div>

                    <div className="flex items-center gap-3 pt-0 md:pt-8">
                      <input id="isDefaultAddress" type="checkbox" checked={addressForm.isDefault} onChange={(e) => handleAddressFieldChange("isDefault", e.target.checked)} className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-500" />
                      <label htmlFor="isDefaultAddress" className="text-sm text-slate-300">Setează ca adresă implicită</label>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
                    <Button type="button" variant="outline" onClick={closeAddressModal} className="w-full sm:w-auto"><X className="mr-2 h-4 w-4" />Anulează</Button>
                    <Button type="button" onClick={handleSaveAddress} disabled={addressSaveLoading} className="w-full gap-2 sm:w-auto"><Check className="h-4 w-4" />{addressSaveLoading ? "Se salvează..." : "Salvează"}</Button>
                  </div>
                </Modal>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Setări și securitate</h2>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Securitate</h3>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" type="button" onClick={openChangePasswordModal}>
                    <Lock className="mr-2 h-4 w-4" />Schimbă parola
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
                <h3 className="mb-4 font-semibold text-red-400">Zona periculoasă</h3>
                <div className="space-y-3">
                  <button type="button" onClick={logout} className="flex w-full items-center justify-start rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500 hover:bg-red-500/10"><LogOut className="mr-2 h-4 w-4" />Deconectează-te</button>
                  <button type="button" onClick={openDeleteAccountModal} className="flex w-full items-center justify-start rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500 hover:bg-red-500/10">Șterge contul</button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showBuildEditModal && selectedBuildForEdit && (
        <Modal
          onClose={closeEditBuildModal}
          maxWidth="max-w-5xl"
          disableScroll={buildPickerOpen}
        >
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-700/50 pb-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 pr-10">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                  <Cpu className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-2xl font-bold text-white">
                    Editează configurația
                  </h3>
                  <p className="text-sm text-slate-400">
                    Poți modifica numele build-ului și fiecare componentă salvată.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-center">
              <div className="flex items-baseline justify-center gap-2 md:justify-center">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                  {formatRon(
                    Math.round(
                      buildDraftItems.length
                        ? buildEditGrossTotal
                        : Number(selectedBuildForEdit.totalGrossRon) ||
                            Number(selectedBuildForEdit.totalNetRon) ||
                            0
                    )
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  RON
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Valoarea configurației
              </div>
            </div>
          </div>

          {buildEditError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {buildEditError}
            </div>
          )}

          {buildEditSuccess && (
            <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              {buildEditSuccess}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Nume configurație
                </label>
                <input
                  type="text"
                  value={buildEditName}
                  onChange={(e) => {
                    setBuildEditName(e.target.value);
                    setBuildEditError("");
                    setBuildEditSuccess("");
                  }}
                  placeholder="Ex: Build gaming 1440p"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">
                      Componente salvate
                    </h4>
                    <p className="text-sm text-slate-400">
                      {buildDraftItems.length} componente în configurație
                    </p>
                  </div>

                  {!selectedBuildForEdit.isCompatible && (
                    <Badge className="bg-red-500/20 text-red-300">
                      Incompatibil
                    </Badge>
                  )}
                </div>

                {buildDraftItems.length > 0 ? (
                  <div className="space-y-3">
                    {buildDraftItems.map((component) => (
                      <div
                        key={component.id || component.slotKey}
                        className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-4"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                                {component.slotLabel || "Componentă"}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {component.brand || "Brand"}
                              </span>
                            </div>

                            <p className="break-words font-medium text-white">
                              {component.productName || "Produs"}
                            </p>

                            {component.category && (
                              <p className="mt-1 text-xs text-slate-500">
                                {component.category}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-[minmax(150px,1fr)_auto] xl:min-w-[300px]">
                            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-center">
                              <div className="flex items-baseline justify-center gap-2 sm:justify-center">
                                <span className="font-bold text-cyan-400">
                                  {formatRon(component.unitPriceRon)}
                                </span>
                                <span className="text-xs text-slate-400">
                                  RON
                                </span>
                              </div>
                              {Number(component.quantity || 1) > 1 && (
                                <div className="text-xs text-slate-500">
                                  x{component.quantity}
                                </div>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 sm:w-auto"
                              onClick={() => openBuildPicker(component)}
                            >
                              <Edit className="h-4 w-4" />
                              Schimbă
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-4 text-sm text-slate-400">
                    Configurația nu are componente salvate.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                <h4 className="mb-4 font-semibold text-white">
                  Detalii build
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Creat</span>
                    <span className="text-right text-slate-200">
                      {formatDateRo(selectedBuildForEdit.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Compatibilitate</span>
                    <span
                      className={
                        activeBuildCompatibility.isCompatible
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {activeBuildCompatibility.isCompatible
                        ? "Compatibil"
                        : "Incompatibil"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Consum estimat</span>
                    <span className="text-slate-200">
                      {activeBuildCompatibility.estimatedSystemPowerW || 0} W
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">PSU recomandat</span>
                    <span className="text-cyan-400">
                      {activeBuildCompatibility.recommendedPsuW || 0} W
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-slate-300">
                {buildEditCompatibilityLoading ? (
                  <p className="text-cyan-300">
                    Se verifică compatibilitatea...
                  </p>
                ) : activeBuildCompatibility.isCompatible ? (
                  <p className="text-green-300">
                    Configurația curentă este compatibilă.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="font-semibold text-red-300">
                      Configurația are incompatibilități:
                    </p>

                    {activeBuildCompatibility.errors.length > 0 && (
                      <ul className="space-y-2">
                        {activeBuildCompatibility.errors.map((error, idx) => (
                          <li
                            key={`build-error-${idx}`}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-200"
                          >
                            {error}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {!buildEditCompatibilityLoading &&
                  activeBuildCompatibility.warnings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="font-semibold text-orange-300">
                        Avertismente:
                      </p>
                      {activeBuildCompatibility.warnings.map((warning, idx) => (
                        <div
                          key={`build-warning-${idx}`}
                          className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-orange-200"
                        >
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-slate-300">
                Pentru fiecare rubrică apasă <span className="font-semibold text-cyan-300">Schimbă</span>.
                Lista arată toate produsele din aceeași categorie; compatibilitatea se verifică după selecție.
              </div>

              <div className="grid gap-3">
                <Button
                  type="button"
                  onClick={handleSaveBuildEdit}
                  disabled={buildEditSaveLoading}
                  className="w-full gap-2"
                >
                  <Check className="h-4 w-4" />
                  {buildEditSaveLoading ? "Se salvează..." : "Salvează modificările"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => buildEditSnapshot && addBuildToCart(buildEditSnapshot)}
                  disabled={
                    !buildEditSnapshot ||
                    buildCartLoadingId === selectedBuildForEdit.id
                  }
                  className="w-full gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {buildCartLoadingId === selectedBuildForEdit.id
                    ? "Se adaugă..."
                    : "Adaugă în coș"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/configurator")}
                  className="w-full gap-2"
                >
                  <Cpu className="h-4 w-4" />
                  Deschide Configurator
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditBuildModal}
                  className="w-full"
                >
                  Închide
                </Button>
              </div>
            </div>
          </div>

        </Modal>
      )}

      {buildPickerOpen && buildPickerSlot && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-6">
          <div className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-700/60 bg-slate-950 p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={closeBuildPicker}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 pr-10">
              <h4 className="text-xl font-bold text-white">
                Schimbă {buildPickerSlot.slotLabel || "componenta"}
              </h4>
              <p className="mt-1 text-sm text-slate-400">
                Alege un produs din aceeași rubrică.
              </p>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3">
              <Search className="h-5 w-5 flex-shrink-0 text-slate-500" />
              <input
                value={buildPickerQuery}
                onChange={(e) => setBuildPickerQuery(e.target.value)}
                placeholder="Caută după nume, brand sau categorie..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {buildPickerError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {buildPickerError}
              </div>
            )}

            {buildPickerLoading ? (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">
                Se încarcă produsele...
              </div>
            ) : filteredBuildPickerProducts.length > 0 ? (
              <div className="space-y-3">
                {filteredBuildPickerProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 transition hover:border-cyan-500/40"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                            {product.category || buildPickerSlot.category || "Categorie"}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {product.brand || "Brand"}
                          </span>
                        </div>

                        <p className="break-words font-semibold text-white">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Stoc:{" "}
                          <span
                            className={
                              Number(product.stock || 0) > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {Number(product.stock || 0)}
                          </span>
                        </p>
                      </div>

                      <div className="grid gap-3 sm:min-w-[220px]">
                        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-center">
                          <div className="flex items-baseline justify-center gap-2 sm:justify-center">
                            <span className="text-lg font-bold text-cyan-400">
                              {formatRon(product.priceRon)}
                            </span>
                            <span className="text-xs text-slate-400">
                              RON
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          disabled={Number(product.stock || 0) <= 0}
                          onClick={() => selectBuildReplacementProduct(product)}
                          className="w-full"
                        >
                          Selectează
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">
                Nu am găsit produse pentru această rubrică.
              </div>
            )}
          </div>
        </div>
      )}


      {showChangePasswordModal && (
        <Modal onClose={closeChangePasswordModal}>
          <div className="mb-6 pr-10">
            <h3 className="text-2xl font-bold text-white">Schimbă parola</h3>
            <p className="mt-1 text-sm text-slate-400">Actualizează parola contului tău în siguranță.</p>
          </div>

          {changePasswordError && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{changePasswordError}</div>}
          {changePasswordSuccess && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">{changePasswordSuccess}</div>}

          <div className="space-y-4">
            {[
              ["currentPassword", "Parola curentă", showCurrentPassword, setShowCurrentPassword, Lock],
              ["newPassword", "Parolă nouă", showNewPassword, setShowNewPassword, KeyRound],
              ["confirmPassword", "Confirmă parola nouă", showConfirmPassword, setShowConfirmPassword, KeyRound],
            ].map(([field, label, shown, setShown, Icon]) => (
              <div key={field}>
                <label className="mb-2 block text-sm font-medium text-slate-400">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input type={shown ? "text" : "password"} value={changePasswordForm[field]} onChange={(e) => handleChangePasswordField(field, e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                  <button type="button" onClick={() => setShown((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {field === "newPassword" && <p className="mt-2 text-xs text-slate-500">Minim 8 caractere, o literă mare și un număr</p>}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
            <Button type="button" variant="outline" onClick={closeChangePasswordModal} className="w-full sm:w-auto"><X className="mr-2 h-4 w-4" />Anulează</Button>
            <Button type="button" onClick={handleChangePasswordSubmit} disabled={changePasswordLoading} className="w-full gap-2 sm:w-auto"><Check className="h-4 w-4" />{changePasswordLoading ? "Se salvează..." : "Salvează parola"}</Button>
          </div>
        </Modal>
      )}

      {showDeleteAccountModal && (
        <Modal onClose={closeDeleteAccountModal}>
          <div className="mb-6 flex items-start gap-4 pr-10">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/20"><AlertTriangle className="h-6 w-6 text-red-400" /></div>
            <div>
              <h3 className="text-2xl font-bold text-white">Șterge contul definitiv</h3>
              <p className="mt-1 text-sm text-slate-400">Această acțiune este permanentă și nu poate fi anulată.</p>
            </div>
          </div>

          {deleteAccountError && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{deleteAccountError}</div>}

          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-slate-300">
              <p className="mb-2 font-medium text-red-300">Ce se va întâmpla:</p>
              <ul className="space-y-1 text-slate-300">
                <li>• profilul tău va fi șters</li>
                <li>• adresele salvate vor fi eliminate</li>
                <li>• build-urile și wishlist-urile tale vor fi eliminate</li>
                <li>• nu vei mai putea accesa contul</li>
              </ul>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Scrie <span className="font-bold text-red-400">STERGE</span> pentru confirmare</label>
              <input type="text" value={deleteAccountForm.confirmationText} onChange={(e) => handleDeleteAccountField("confirmationText", e.target.value)} placeholder="STERGE" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Parola curentă <span className="ml-1 text-xs text-slate-500">(obligatorie pentru conturile cu parolă locală)</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input type={showDeletePassword ? "text" : "password"} value={deleteAccountForm.currentPassword} onChange={(e) => handleDeleteAccountField("currentPassword", e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20" />
                <button type="button" onClick={() => setShowDeletePassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showDeletePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
            <Button type="button" variant="outline" onClick={closeDeleteAccountModal} className="w-full sm:w-auto"><X className="mr-2 h-4 w-4" />Anulează</Button>
            <Button type="button" variant="danger" onClick={handleDeleteAccountSubmit} disabled={deleteAccountLoading} className="w-full gap-2 sm:w-auto"><AlertTriangle className="h-4 w-4" />{deleteAccountLoading ? "Se șterge..." : "Șterge definitiv"}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
