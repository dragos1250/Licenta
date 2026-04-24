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

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState("orders");

  // Orders
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [orders, setOrders] = useState([]);
  const [orderDetailsLoadingId, setOrderDetailsLoadingId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalError, setOrderModalError] = useState("");

  // Builds
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [buildsError, setBuildsError] = useState("");
  const [builds, setBuilds] = useState([]);
  const [buildCartLoadingId, setBuildCartLoadingId] = useState("");
  const [buildDeleteLoadingId, setBuildDeleteLoadingId] = useState("");

  // Wishlist
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState("");
  const [wishlistStats, setWishlistStats] = useState({
    listsCount: 0,
    totalItems: 0,
  });

  // Profile
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

  // Change password
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

  // Delete account
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountForm, setDeleteAccountForm] = useState({
    confirmationText: "",
    currentPassword: "",
  });
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Addresses
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

  const TabButton = ({ value, icon: Icon, children }) => {
    const active = tab === value;
    return (
      <button
        type="button"
        onClick={() => setTab(value)}
        className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${
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

  const editBuild = (build) => {
    alert(
      `Editarea build-ului "${build.name}" o facem în pasul următor. Momentan poți crea unul nou din Configurator.`
    );
    navigate("/configurator");
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
  }, []);

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
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-bold text-white ring-2 ring-cyan-500/30">
                  {initials}
                </div>
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
                  {displayName}
                </h1>
                <p className="text-slate-400">{displayEmail}</p>
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="outline"
                className="gap-2"
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
          className="mb-8 grid gap-6 md:grid-cols-4"
        >
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <Package className="h-5 w-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">Total</Badge>
            </div>
            <div className="text-3xl font-bold text-white">{ordersCount}</div>
            <div className="text-sm text-slate-400">Comenzi plasate</div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <CreditCard className="h-5 w-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Total</Badge>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatRon(spentTotal)}
            </div>
            <div className="text-sm text-slate-400">RON cheltuiți</div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">Builds</Badge>
            </div>
            <div className="text-3xl font-bold text-white">
              {buildsLoading ? "…" : buildsError ? "—" : buildsCount}
            </div>
            <div className="text-sm text-slate-400">Configurații salvate</div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
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
          <div className="mb-8 grid w-full grid-cols-5 rounded-xl border border-slate-700/50 bg-slate-900/50 p-1 backdrop-blur-sm">
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

          {tab === "orders" && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Comenzile mele</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
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
                      className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="font-semibold text-white">
                              Comandă #{order.orderNumber || order.id}
                            </h3>
                            <Badge className={statusBadgeClass(order.status)}>
                              {statusLabel(order.status)}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
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
                              Livrare:{" "}
                              <span className="text-cyan-300">EasyBox</span> —{" "}
                              {order.easyboxLockerName || "—"}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => openOrderDetails(order.id)}
                            disabled={orderDetailsLoadingId === order.id}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                  <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={closeOrderModal}
                      className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="mb-6 flex flex-col gap-4 border-b border-slate-700/50 pb-6 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                            <ReceiptText className="h-5 w-5 text-cyan-400" />
                          </div>

                          <div>
                            <h3 className="text-2xl font-bold text-white">
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
                                  <div className="flex-1">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                      <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                                        {item.category}
                                      </Badge>
                                      <span className="text-xs text-slate-500">
                                        {item.brand}
                                      </span>
                                    </div>

                                    <h5 className="font-medium text-white">
                                      {item.productName}
                                    </h5>

                                    <p className="mt-1 text-sm text-slate-400">
                                      Cantitate: {item.quantity} ×{" "}
                                      {formatRon(item.unitPriceRon)} RON
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
                                <span className="text-slate-400">Metodă:</span>{" "}
                                {shippingMethodLabel(selectedOrder.shippingMethod)}
                              </p>

                              {selectedOrder.shippingMethod === "EASYBOX" ? (
                                <>
                                  <p>
                                    <span className="text-slate-400">Locker:</span>{" "}
                                    {selectedOrder.easyboxLockerName || "—"}
                                  </p>
                                  <p>
                                    <span className="text-slate-400">Oraș:</span>{" "}
                                    {selectedOrder.easyboxCity || "—"}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p>
                                    <span className="text-slate-400">Adresă:</span>{" "}
                                    {selectedOrder.shippingStreet || "—"}
                                  </p>
                                  <p>
                                    <span className="text-slate-400">Localitate:</span>{" "}
                                    {selectedOrder.shippingCity || "—"},{" "}
                                    {selectedOrder.shippingCounty || "—"}
                                  </p>
                                  <p>
                                    <span className="text-slate-400">Cod poștal:</span>{" "}
                                    {selectedOrder.shippingPostalCode || "—"}
                                  </p>
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
                              <p>
                                <span className="text-slate-400">Metodă:</span>{" "}
                                {paymentMethodLabel(selectedOrder.paymentMethod)}
                              </p>
                              <p>
                                <span className="text-slate-400">Status:</span>{" "}
                                {statusLabel(selectedOrder.status)}
                              </p>
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

                          <div className="space-y-2 text-sm text-slate-300">
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
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Subtotal produse</span>
                              <span>{formatRon(selectedOrder.subtotalRon)} RON</span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                              <span>TVA</span>
                              <span>{formatRon(selectedOrder.vatRon)} RON</span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                              <span>Transport</span>
                              <span>{formatRon(selectedOrder.shippingFeeRon)} RON</span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                              <span>Taxă plată</span>
                              <span>{formatRon(selectedOrder.paymentFeeRon)} RON</span>
                            </div>

                            <div className="border-t border-slate-700 pt-3">
                              <div className="flex items-center justify-between font-semibold text-white">
                                <span>Total</span>
                                <span className="text-cyan-400">
                                  {formatRon(selectedOrder.totalRon)} RON
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={closeOrderModal}
                          >
                            Închide
                          </Button>

                          {selectedOrder.status === "DELIVERED" && (
                            <Button
                              type="button"
                              className="flex-1"
                              onClick={() => alert("Comandă din nou (în curând)")}
                            >
                              Comandă din nou
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "builds" && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Configurații salvate
                </h2>

                <Button
                  type="button"
                  className="gap-2"
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
                  className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 p-12 backdrop-blur-sm"
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

                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => navigate("/configurator")}
                  >
                    <Cpu className="h-4 w-4" />
                    Creează build
                  </Button>
                </motion.div>
              ) : (
                <div className="grid gap-6">
                  {builds.map((build, index) => {
                    const items = Array.isArray(build.items) ? build.items : [];
                    const totalPrice =
                      Number(build.totalGrossRon) ||
                      Number(build.totalNetRon) ||
                      0;

                    return (
                      <motion.div
                        key={build.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="group overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-800/50"
                      >
                        <div className="border-b border-slate-700/50 p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                                  <Cpu className="h-5 w-5 text-cyan-400" />
                                </div>

                                <div>
                                  <h3 className="text-xl font-semibold text-white">
                                    {build.name}
                                  </h3>
                                  <p className="text-sm text-slate-400">
                                    {items.length} componente •{" "}
                                    {formatDateRo(build.createdAt)}
                                  </p>
                                </div>
                              </div>

                              {!build.isCompatible && (
                                <div className="mt-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                  Build salvat cu incompatibilități
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                                {formatRon(totalPrice)}
                              </div>
                              <div className="text-xs text-slate-400">RON</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-4 space-y-2">
                            {items.map((component) => (
                              <div
                                key={component.id}
                                className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-800/30 p-3"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                                      {component.slotLabel || "Componentă"}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                      {component.brand}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-sm text-white">
                                    {component.productName}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="font-semibold text-cyan-400">
                                    {formatRon(component.unitPriceRon)} RON
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              className="flex-1 gap-2"
                              onClick={() => addBuildToCart(build)}
                              disabled={buildCartLoadingId === build.id}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              {buildCartLoadingId === build.id
                                ? "Se adaugă..."
                                : "Adaugă în coș"}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              className="gap-2"
                              onClick={() => editBuild(build)}
                            >
                              <Edit className="h-4 w-4" />
                              Editează
                            </Button>

                            <Button
                              type="button"
                              variant="danger"
                              className="gap-2"
                              onClick={() => deleteBuild(build.id)}
                              disabled={buildDeleteLoadingId === build.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              {buildDeleteLoadingId === build.id
                                ? "Se șterge..."
                                : "Șterge"}
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
                <h2 className="text-2xl font-bold text-white">
                  Informații personale
                </h2>
              </div>

              {profileError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {profileError}
                </div>
              )}

              {profileSaveSuccess && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                  {profileSaveSuccess}
                </div>
              )}

              {profileLoading ? (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">
                  Se încarcă profilul...
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                      <label className="mb-2 block text-sm font-medium text-slate-400">
                        Nume complet
                      </label>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                        <User className="h-5 w-5 text-slate-500" />
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) =>
                            handleProfileFieldChange("name", e.target.value)
                          }
                          className="flex-1 bg-transparent text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                      <label className="mb-2 block text-sm font-medium text-slate-400">
                        Email
                      </label>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                        <Mail className="h-5 w-5 text-slate-500" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            handleProfileFieldChange("email", e.target.value)
                          }
                          className="flex-1 bg-transparent text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                      <label className="mb-2 block text-sm font-medium text-slate-400">
                        Telefon
                      </label>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                        <Phone className="h-5 w-5 text-slate-500" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            handleProfileFieldChange("phone", e.target.value)
                          }
                          className="flex-1 bg-transparent text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                      <label className="mb-2 block text-sm font-medium text-slate-400">
                        Data nașterii
                      </label>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                        <input
                          type="date"
                          value={profileForm.dateOfBirth}
                          onChange={(e) =>
                            handleProfileFieldChange("dateOfBirth", e.target.value)
                          }
                          className="flex-1 bg-transparent text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={fetchMyProfile}
                    >
                      Anulează
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={profileSaveLoading}
                    >
                      {profileSaveLoading
                        ? "Se salvează..."
                        : "Salvează modificările"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div className="space-y-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Adresele mele</h2>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={openCreateAddressModal}
                >
                  <Plus className="h-4 w-4" />
                  Adaugă adresă nouă
                </Button>
              </div>

              {addressesError && !showAddressModal && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {addressesError}
                </div>
              )}

              {addressSaveSuccess && !showAddressModal && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                  {addressSaveSuccess}
                </div>
              )}

              {addressesLoading ? (
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-300">
                  Se încarcă adresele...
                </div>
              ) : addresses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[32vh] flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/50 p-12 backdrop-blur-sm"
                >
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/50">
                    <MapPin className="h-12 w-12 text-slate-600" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Nicio adresă salvată
                  </h3>

                  <p className="mb-6 text-slate-400">
                    Adaugă o adresă pentru checkout mai rapid
                  </p>

                  <Button
                    type="button"
                    className="gap-2"
                    onClick={openCreateAddressModal}
                  >
                    <Plus className="h-4 w-4" />
                    Adaugă adresă
                  </Button>
                </motion.div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {addresses.map((addr, index) => (
                    <motion.div
                      key={addr.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-cyan-400" />
                            <h3 className="font-semibold text-white">
                              {addr.label}
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {addr.isDefault && (
                              <Badge className="bg-cyan-500/20 text-cyan-400">
                                Implicit
                              </Badge>
                            )}

                            {addr.recipientName && (
                              <Badge className="bg-slate-700/60 text-slate-200">
                                {addr.recipientName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 space-y-1 text-sm text-slate-400">
                        <p>{addr.street}</p>
                        <p>
                          {addr.city}, {addr.county}
                          {addr.postalCode ? `, ${addr.postalCode}` : ""}
                        </p>
                        <p>{addr.country}</p>
                        {addr.phone && <p>Telefon: {addr.phone}</p>}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          type="button"
                          onClick={() => openEditAddressModal(addr)}
                        >
                          <Edit className="h-4 w-4" />
                          Editează
                        </Button>

                        {!addr.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            disabled={defaultAddressLoadingId === addr.id}
                          >
                            {defaultAddressLoadingId === addr.id
                              ? "Se setează..."
                              : "Setează implicită"}
                          </Button>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          disabled={addressDeleteLoadingId === addr.id}
                        >
                          {addressDeleteLoadingId === addr.id
                            ? "Se șterge..."
                            : "Șterge"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                  <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={closeAddressModal}
                      className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <h3 className="mb-6 text-2xl font-bold text-white">
                      {editingAddressId
                        ? "Editează adresă"
                        : "Adaugă adresă nouă"}
                    </h3>

                    {addressesError && (
                      <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {addressesError}
                      </div>
                    )}

                    {addressSaveSuccess && (
                      <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                        {addressSaveSuccess}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Etichetă
                        </label>
                        <input
                          type="text"
                          value={addressForm.label}
                          onChange={(e) =>
                            handleAddressFieldChange("label", e.target.value)
                          }
                          placeholder="Acasă / Serviciu"
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Destinatar
                        </label>
                        <input
                          type="text"
                          value={addressForm.recipientName}
                          onChange={(e) =>
                            handleAddressFieldChange("recipientName", e.target.value)
                          }
                          placeholder="Nume destinatar"
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Telefon
                        </label>
                        <input
                          type="text"
                          value={addressForm.phone}
                          onChange={(e) =>
                            handleAddressFieldChange("phone", e.target.value)
                          }
                          placeholder="07xx xxx xxx"
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Țară
                        </label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) =>
                            handleAddressFieldChange("country", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Județ
                        </label>
                        <input
                          type="text"
                          value={addressForm.county}
                          onChange={(e) =>
                            handleAddressFieldChange("county", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Oraș
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) =>
                            handleAddressFieldChange("city", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Stradă / adresă completă
                        </label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={(e) =>
                            handleAddressFieldChange("street", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Cod poștal
                        </label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) =>
                            handleAddressFieldChange("postalCode", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-8">
                        <input
                          id="isDefaultAddress"
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            handleAddressFieldChange("isDefault", e.target.checked)
                          }
                          className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-500"
                        />
                        <label
                          htmlFor="isDefaultAddress"
                          className="text-sm text-slate-300"
                        >
                          Setează ca adresă implicită
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeAddressModal}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Anulează
                      </Button>

                      <Button
                        type="button"
                        onClick={handleSaveAddress}
                        disabled={addressSaveLoading}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        {addressSaveLoading ? "Se salvează..." : "Salvează"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">
                Setări și securitate
              </h2>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Securitate</h3>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    type="button"
                    onClick={openChangePasswordModal}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Schimbă parola
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
                <h3 className="mb-4 font-semibold text-red-400">
                  Zona periculoasă
                </h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center justify-start rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Deconectează-te
                  </button>

                  <button
                    type="button"
                    onClick={openDeleteAccountModal}
                    className="flex w-full items-center justify-start rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
                  >
                    Șterge contul
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={closeChangePasswordModal}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">Schimbă parola</h3>
              <p className="mt-1 text-sm text-slate-400">
                Actualizează parola contului tău în siguranță.
              </p>
            </div>

            {changePasswordError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {changePasswordError}
              </div>
            )}

            {changePasswordSuccess && (
              <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                {changePasswordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Parola curentă
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={changePasswordForm.currentPassword}
                    onChange={(e) =>
                      handleChangePasswordField("currentPassword", e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Parolă nouă
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={changePasswordForm.newPassword}
                    onChange={(e) =>
                      handleChangePasswordField("newPassword", e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Minim 8 caractere, o literă mare și un număr
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Confirmă parola nouă
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={changePasswordForm.confirmPassword}
                    onChange={(e) =>
                      handleChangePasswordField("confirmPassword", e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeChangePasswordModal}
              >
                <X className="mr-2 h-4 w-4" />
                Anulează
              </Button>

              <Button
                type="button"
                onClick={handleChangePasswordSubmit}
                disabled={changePasswordLoading}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                {changePasswordLoading ? "Se salvează..." : "Salvează parola"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-red-500/20 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={closeDeleteAccountModal}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Șterge contul definitiv
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Această acțiune este permanentă și nu poate fi anulată.
                </p>
              </div>
            </div>

            {deleteAccountError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {deleteAccountError}
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-slate-300">
                <p className="mb-2 font-medium text-red-300">
                  Ce se va întâmpla:
                </p>
                <ul className="space-y-1 text-slate-300">
                  <li>• profilul tău va fi șters</li>
                  <li>• adresele salvate vor fi eliminate</li>
                  <li>• build-urile și wishlist-urile tale vor fi eliminate</li>
                  <li>• nu vei mai putea accesa contul</li>
                </ul>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Scrie <span className="font-bold text-red-400">STERGE</span> pentru confirmare
                </label>
                <input
                  type="text"
                  value={deleteAccountForm.confirmationText}
                  onChange={(e) =>
                    handleDeleteAccountField("confirmationText", e.target.value)
                  }
                  placeholder="STERGE"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Parola curentă
                  <span className="ml-1 text-xs text-slate-500">
                    (obligatorie pentru conturile cu parolă locală)
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    value={deleteAccountForm.currentPassword}
                    onChange={(e) =>
                      handleDeleteAccountField("currentPassword", e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showDeletePassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeDeleteAccountModal}
              >
                <X className="mr-2 h-4 w-4" />
                Anulează
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteAccountSubmit}
                disabled={deleteAccountLoading}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                {deleteAccountLoading ? "Se șterge..." : "Șterge definitiv"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}