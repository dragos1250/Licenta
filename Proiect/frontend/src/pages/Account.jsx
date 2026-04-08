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
  Bell,
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
      userRole?.role?.name ||
      userRole?.name ||
      userRole?.roleName ||
      "";

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
    const confirmed = window.confirm(
      "Sigur vrei să ștergi această adresă?"
    );

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
                            onClick={() => alert("Detalii comandă (în curând)")}
                          >
                            Detalii
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
                            handleProfileFieldChange(
                              "dateOfBirth",
                              e.target.value
                            )
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
                            handleAddressFieldChange(
                              "recipientName",
                              e.target.value
                            )
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
                            handleAddressFieldChange(
                              "postalCode",
                              e.target.value
                            )
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
                            handleAddressFieldChange(
                              "isDefault",
                              e.target.checked
                            )
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
                Setări și preferințe
              </h2>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <Bell className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Notificări</h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Notificări email pentru comenzi",
                      description: "Primește actualizări despre comenzile tale",
                      enabled: true,
                    },
                    {
                      label: "Newsletter și oferte",
                      description: "Oferte exclusive și noutăți",
                      enabled: true,
                    },
                    {
                      label: "Alerte de preț",
                      description:
                        "Notificări când produsele favorite se ieftinesc",
                      enabled: false,
                    },
                  ].map((setting) => (
                    <div
                      key={setting.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium text-white">{setting.label}</p>
                        <p className="text-sm text-slate-400">
                          {setting.description}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={setting.enabled}
                        className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

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
                  >
                    Schimbă parola
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    type="button"
                  >
                    Autentificare în doi pași
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
    </div>
  );
}