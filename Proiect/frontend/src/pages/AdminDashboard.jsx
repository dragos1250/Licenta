import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Check,
  X,
  Clock,
  AlertCircle,
  Box,
  Cpu,
  Boxes,
  Activity,
  ChevronRight,
  Shield,
  RefreshCw,
  ReceiptText,
  CalendarDays,
  Truck,
  CreditCard,
  User,
  Save,
  Plus,
  Mail,
  Phone,
  Tag,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

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
    ghost:
      "text-slate-300 hover:bg-slate-800 hover:text-white",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant] || variants.solid} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Badge({ className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function TabButton({ active, icon: Icon, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
}

function Modal({ title, subtitle, children, onClose, maxWidth = "max-w-4xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className={`relative max-h-[92vh] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 pr-10">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalFeedback({ success, error }) {
  if (!success && !error) return null;

  const isSuccess = Boolean(success);
  const message = success || error;

  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-green-500/30 bg-green-500/10 text-green-200"
          : "border-red-500/30 bg-red-500/10 text-red-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {isSuccess ? (
          <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}

function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}

function SelectInput({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
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

function formatDateTimeRo(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMonthKey(dateValue) {
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthLabel(dateValue) {
  const d = new Date(dateValue);
  return d.toLocaleDateString("ro-RO", {
    month: "short",
  });
}

function pickArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}


function jsonArrayToText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).join("\n");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .join("\n");
      }
    } catch {
      return value;
    }
  }

  return "";
}

function textToJsonArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProductSpecificationsForForm(specifications) {
  if (!Array.isArray(specifications)) return [];

  return specifications
    .map((spec, index) => ({
      id: spec?.id || `spec-${index}`,
      name: spec?.name || "",
      value: spec?.value || "",
    }))
    .filter((spec) => spec.name || spec.value);
}

function getVisibleProductSpecifications(specifications) {
  if (!Array.isArray(specifications)) return [];

  return specifications.filter((spec) => {
    return String(spec?.name || "").trim() || String(spec?.value || "").trim();
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

function getPrimaryRoleLabel(user) {
  const directRoles = Array.isArray(user?.roles) ? user.roles : [];
  if (directRoles.length > 0) {
    return String(directRoles[0] || "client").trim() || "client";
  }

  const roles = Array.isArray(user?.userRoles) ? user.userRoles : [];
  const firstRole =
    roles[0]?.role?.name || roles[0]?.name || roles[0]?.roleName || "client";

  return String(firstRole).trim() || "client";
}

function getOrderStatusColor(status) {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400";
    case "PROCESSING":
      return "bg-blue-500/20 text-blue-400";
    case "SHIPPED":
      return "bg-purple-500/20 text-purple-400";
    case "DELIVERED":
      return "bg-green-500/20 text-green-400";
    case "CANCELED":
      return "bg-red-500/20 text-red-400";
    case "PAID":
      return "bg-cyan-500/20 text-cyan-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
}

function getOrderStatusLabel(status) {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "În așteptare";
    case "PAID":
      return "Plătită";
    case "PROCESSING":
      return "Procesare";
    case "SHIPPED":
      return "Expediată";
    case "DELIVERED":
      return "Livrată";
    case "CANCELED":
      return "Anulată";
    default:
      return "Necunoscut";
  }
}

function getOrderStatusIcon(status) {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return <Clock className="h-3 w-3" />;
    case "PROCESSING":
      return <Activity className="h-3 w-3" />;
    case "SHIPPED":
      return <Package className="h-3 w-3" />;
    case "DELIVERED":
      return <Check className="h-3 w-3" />;
    case "CANCELED":
      return <X className="h-3 w-3" />;
    case "PAID":
      return <Check className="h-3 w-3" />;
    default:
      return <AlertCircle className="h-3 w-3" />;
  }
}

function getProductStatus(product) {
  if (product?.isActive === false) return "INACTIVE";
  if (Number(product?.stock || 0) <= 0) return "OUT_OF_STOCK";
  return "ACTIVE";
}

function getProductStatusColor(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/20 text-green-400";
    case "INACTIVE":
      return "bg-slate-500/20 text-slate-400";
    case "OUT_OF_STOCK":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
}

function getProductStatusLabel(status) {
  switch (status) {
    case "ACTIVE":
      return "Activ";
    case "INACTIVE":
      return "Inactiv";
    case "OUT_OF_STOCK":
      return "Stoc epuizat";
    default:
      return "Necunoscut";
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

const emptyOrderEditForm = {
  status: "PENDING",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingMethod: "COURIER_STANDARD",
  paymentMethod: "CARD",
  shippingCounty: "",
  shippingCity: "",
  shippingStreet: "",
  shippingPostalCode: "",
  easyboxLockerId: "",
  easyboxLockerName: "",
  easyboxCity: "",
};

const emptyUserEditForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  roleName: "User",
};

const emptyProductForm = {
  name: "",
  brand: "",
  category: "",
  imageUrl: "",
  priceRon: "",
  originalPriceRon: "",
  stock: "",
  badge: "",
  isActive: true,
  shortDescription: "",
  description: "",
  featuresText: "",
  prosText: "",
  consText: "",
  specifications: [],
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const [tab, setTab] = useState("orders");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [modalSuccessMsg, setModalSuccessMsg] = useState("");
  const [modalErrorMsg, setModalErrorMsg] = useState("");

  const [ordersRaw, setOrdersRaw] = useState([]);
  const [usersRaw, setUsersRaw] = useState([]);
  const [productsRaw, setProductsRaw] = useState([]);
  const [moderationRaw, setModerationRaw] = useState({
    reviews: [],
    questions: [],
    answers: [],
  });

  const [profileRoles, setProfileRoles] = useState([]);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showOrderEditModal, setShowOrderEditModal] = useState(false);
  const [orderEditForm, setOrderEditForm] = useState(emptyOrderEditForm);
  const [orderBusy, setOrderBusy] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [userEditForm, setUserEditForm] = useState(emptyUserEditForm);
  const [userBusy, setUserBusy] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productBusy, setProductBusy] = useState(false);

  const [moderationActionLoading, setModerationActionLoading] = useState("");
  const [moderationNotice, setModerationNotice] = useState("");

  const isAdmin = useMemo(() => {
    if (profileRoles.length) {
      return hasAdminRole({ userRoles: profileRoles });
    }
    return hasAdminRole(user);
  }, [profileRoles, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const [ordersRes, usersRes, productsRes, moderationRes] = await Promise.all([
        api.get("/admin/orders"),
        api.get("/admin/users"),
        api.get("/admin/products"),
        api.get("/admin/moderation/pending"),
      ]);

      setOrdersRaw(
        pickArray(ordersRes.data, ["orders", "items", "data", "rows"])
      );
      setUsersRaw(pickArray(usersRes.data, ["users", "items", "data", "rows"]));
      setProductsRaw(
        pickArray(productsRes.data, ["products", "items", "data", "rows"])
      );
      setModerationRaw({
        reviews: Array.isArray(moderationRes.data?.reviews)
          ? moderationRes.data.reviews
          : [],
        questions: Array.isArray(moderationRes.data?.questions)
          ? moderationRes.data.questions
          : [],
        answers: Array.isArray(moderationRes.data?.answers)
          ? moderationRes.data.answers
          : [],
      });
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.error ||
          "Nu am putut încărca dashboard-ul de administrare."
      );
      setOrdersRaw([]);
      setUsersRaw([]);
      setProductsRaw([]);
      setModerationRaw({
        reviews: [],
        questions: [],
        answers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfileRoles = async () => {
      setAdminCheckLoading(true);

      try {
        const res = await api.get("/users/me/profile");
        const roles = Array.isArray(res.data?.userRoles) ? res.data.userRoles : [];

        if (!cancelled) {
          setProfileRoles(roles);
        }
      } catch {
        if (!cancelled) {
          setProfileRoles(Array.isArray(user?.userRoles) ? user.userRoles : []);
        }
      } finally {
        if (!cancelled) {
          setAdminCheckLoading(false);
        }
      }
    };

    loadProfileRoles();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (adminCheckLoading) return;
    if (!isAdmin) return;

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminCheckLoading, isAdmin]);

  const orders = useMemo(() => {
    return [...ordersRaw]
      .map((order) => {
        const items = Array.isArray(order?.items) ? order.items : [];
        const itemsCount =
          items.length > 0
            ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
            : Number(order?.itemsCount || 0);

        return {
          ...order,
          id: order?.id || "",
          orderNumber: order?.orderNumber || order?.id || "—",
          customerName:
            order?.customerName ||
            order?.user?.name ||
            order?.customer?.name ||
            order?.customerEmail ||
            "—",
          customerEmail: order?.customerEmail || "—",
          createdAt: order?.createdAt || null,
          status: order?.status || "PENDING",
          totalRon: Number(order?.totalRon || 0),
          itemsCount,
          items,
          userId: order?.userId || null,
        };
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [ordersRaw]);

  const ordersByUserId = useMemo(() => {
    const map = new Map();

    for (const order of orders) {
      if (!order.userId) continue;
      map.set(order.userId, (map.get(order.userId) || 0) + 1);
    }

    return map;
  }, [orders]);

  const spentByUserId = useMemo(() => {
    const map = new Map();

    for (const order of orders) {
      if (!order.userId) continue;
      map.set(order.userId, (map.get(order.userId) || 0) + order.totalRon);
    }

    return map;
  }, [orders]);

  const users = useMemo(() => {
    return [...usersRaw]
      .map((u) => ({
        ...u,
        id: u?.id || "",
        name: u?.name || "Utilizator",
        email: u?.email || "—",
        phone: u?.phone || "",
        dateOfBirth: u?.dateOfBirth || "",
        createdAt: u?.createdAt || null,
        roleLabel: getPrimaryRoleLabel(u),
        ordersCount:
          Number(u?.ordersCount) ||
          (Array.isArray(u?.orders) ? u.orders.length : 0) ||
          ordersByUserId.get(u?.id) ||
          0,
        spentRon:
          Number(u?.spentRon) ||
          Number(u?.spentTotalRon) ||
          spentByUserId.get(u?.id) ||
          0,
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [usersRaw, ordersByUserId, spentByUserId]);

  const salesByProductId = useMemo(() => {
    const map = new Map();

    for (const order of orders) {
      for (const item of order.items) {
        const productId = item?.productId || item?.product?.id || "";
        if (!productId) continue;

        map.set(productId, (map.get(productId) || 0) + (Number(item.quantity) || 0));
      }
    }

    return map;
  }, [orders]);

  const revenueByProductId = useMemo(() => {
    const map = new Map();

    for (const order of orders) {
      for (const item of order.items) {
        const productId = item?.productId || item?.product?.id || "";
        if (!productId) continue;

        const lineRevenue =
          Number(item?.lineTotalRon) ||
          (Number(item?.unitPriceRon) || 0) * (Number(item?.quantity) || 0);

        map.set(productId, (map.get(productId) || 0) + lineRevenue);
      }
    }

    return map;
  }, [orders]);

  const products = useMemo(() => {
    return [...productsRaw].map((p) => {
      const status = getProductStatus(p);

      return {
        ...p,
        id: p?.id || "",
        name: p?.name || "Produs",
        category: p?.category || "Necategorizat",
        brand: p?.brand || "",
        imageUrl: p?.imageUrl || "",
        badge: p?.badge || "",
        shortDescription: p?.shortDescription || "",
        description: p?.description || "",
        features: Array.isArray(p?.features) ? p.features : [],
        pros: Array.isArray(p?.pros) ? p.pros : [],
        cons: Array.isArray(p?.cons) ? p.cons : [],
        specifications: Array.isArray(p?.specifications)
          ? p.specifications
          : [],
        priceRon: Number(p?.priceRon || 0),
        originalPriceRon:
          p?.originalPriceRon === null || p?.originalPriceRon === undefined
            ? ""
            : Number(p?.originalPriceRon || 0),
        stock: Number(p?.stock || 0),
        isActive: p?.isActive !== false,
        salesCount:
          Number(p?.salesCount) ||
          Number(p?.sales) ||
          salesByProductId.get(p?.id) ||
          0,
        revenueRon:
          Number(p?.revenueRon) || revenueByProductId.get(p?.id) || 0,
        status,
      };
    });
  }, [productsRaw, salesByProductId, revenueByProductId]);

  const pendingReviews = useMemo(() => {
    return Array.isArray(moderationRaw.reviews) ? moderationRaw.reviews : [];
  }, [moderationRaw]);

  const pendingQuestions = useMemo(() => {
    return Array.isArray(moderationRaw.questions) ? moderationRaw.questions : [];
  }, [moderationRaw]);

  const pendingAnswers = useMemo(() => {
    return Array.isArray(moderationRaw.answers) ? moderationRaw.answers : [];
  }, [moderationRaw]);

  const pendingModerationCount =
    pendingReviews.length + pendingQuestions.length + pendingAnswers.length;

  const now = new Date();

  const salesThisMonth = useMemo(() => {
    return orders
      .filter((order) => {
        const d = new Date(order.createdAt || 0);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, order) => sum + order.totalRon, 0);
  }, [orders, now]);

  const ordersThisMonth = useMemo(() => {
    return orders.filter((order) => {
      const d = new Date(order.createdAt || 0);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }).length;
  }, [orders, now]);

  const usersCount = users.length;

  const totalUnitsInStock = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + Math.max(Number(p.stock || 0), 0),
      0
    );
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) < 20
    ).length;
  }, [products]);

  const salesData = useMemo(() => {
    const months = [];
    const cursor = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    for (let i = 0; i < 6; i += 1) {
      const current = new Date(cursor.getFullYear(), cursor.getMonth() + i, 1);
      const key = getMonthKey(current);
      months.push({
        key,
        month: getMonthLabel(current),
        vanzari: 0,
        comenzi: 0,
      });
    }

    const byKey = new Map(months.map((m) => [m.key, m]));

    for (const order of orders) {
      if (!order.createdAt) continue;
      const key = getMonthKey(order.createdAt);
      const bucket = byKey.get(key);
      if (!bucket) continue;

      bucket.vanzari += order.totalRon;
      bucket.comenzi += 1;
    }

    return months;
  }, [orders, now]);

  const categoryData = useMemo(() => {
    const palette = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"];
    const revenueByCategory = new Map();

    for (const order of orders) {
      for (const item of order.items) {
        const category = item?.category || item?.product?.category || "Altele";
        const lineRevenue =
          Number(item?.lineTotalRon) ||
          (Number(item?.unitPriceRon) || 0) * (Number(item?.quantity) || 0);

        revenueByCategory.set(
          category,
          (revenueByCategory.get(category) || 0) + lineRevenue
        );
      }
    }

    const totalRevenue = [...revenueByCategory.values()].reduce(
      (sum, value) => sum + value,
      0
    );

    return [...revenueByCategory.entries()]
      .map(([name, revenue], index) => ({
        name,
        revenue,
        value:
          totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
        color: palette[index % palette.length],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map();

    for (const order of orders) {
      for (const item of order.items) {
        const productId =
          item?.productId || item?.product?.id || item?.productName;
        const productName =
          item?.productName || item?.product?.name || "Produs";
        const quantity = Number(item?.quantity) || 0;
        const revenue =
          Number(item?.lineTotalRon) ||
          (Number(item?.unitPriceRon) || 0) * quantity;

        if (!map.has(productId)) {
          map.set(productId, {
            id: productId,
            name: productName,
            sales: 0,
            revenue: 0,
          });
        }

        const entry = map.get(productId);
        entry.sales += quantity;
        entry.revenue += revenue;
      }
    }

    return [...map.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const setGlobalSuccess = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const clearModalFeedback = () => {
    setModalSuccessMsg("");
    setModalErrorMsg("");
  };

  const setModalSuccess = (message) => {
    setModalErrorMsg("");
    setModalSuccessMsg(message);
    setGlobalSuccess(message);
  };

  const setModalError = (message) => {
    setModalSuccessMsg("");
    setModalErrorMsg(message);
  };

  const getOrderPayload = () => {
    const payload = {
      status: orderEditForm.status,
      customerName: orderEditForm.customerName,
      customerEmail: orderEditForm.customerEmail,
      customerPhone: orderEditForm.customerPhone || "",
      shippingMethod: orderEditForm.shippingMethod,
      paymentMethod: orderEditForm.paymentMethod,
      shippingCounty: orderEditForm.shippingCounty,
      shippingCity: orderEditForm.shippingCity,
      shippingPostalCode: orderEditForm.shippingPostalCode || "",
    };

    if (orderEditForm.shippingMethod === "EASYBOX") {
      payload.easyboxLockerId = orderEditForm.easyboxLockerId;
      payload.easyboxLockerName = orderEditForm.easyboxLockerName;
      payload.easyboxCity = orderEditForm.easyboxCity;
    } else {
      payload.shippingStreet = orderEditForm.shippingStreet;
    }

    return payload;
  };

  const fillOrderEditForm = (order) => {
    setOrderEditForm({
      status: order?.status || "PENDING",
      customerName: order?.customerName || "",
      customerEmail: order?.customerEmail || "",
      customerPhone: order?.customerPhone || "",
      shippingMethod: order?.shippingMethod || "COURIER_STANDARD",
      paymentMethod: order?.paymentMethod || "CARD",
      shippingCounty: order?.shippingCounty || "",
      shippingCity: order?.shippingCity || "",
      shippingStreet: order?.shippingStreet || "",
      shippingPostalCode: order?.shippingPostalCode || "",
      easyboxLockerId: order?.easyboxLockerId || "",
      easyboxLockerName: order?.easyboxLockerName || "",
      easyboxCity: order?.easyboxCity || "",
    });
  };

  const fillUserEditForm = (targetUser) => {
    setUserEditForm({
      name: targetUser?.name || "",
      email: targetUser?.email || "",
      phone: targetUser?.phone || "",
      dateOfBirth: targetUser?.dateOfBirth
        ? String(targetUser.dateOfBirth).slice(0, 10)
        : "",
      roleName: targetUser?.roleLabel || "User",
    });
  };

  const fillProductForm = (product) => {
    setProductForm({
      name: product?.name || "",
      brand: product?.brand || "",
      category: product?.category || "",
      imageUrl: product?.imageUrl || "",
      priceRon: product?.priceRon ?? "",
      originalPriceRon:
        product?.originalPriceRon === "" ||
        product?.originalPriceRon === null ||
        product?.originalPriceRon === undefined
          ? ""
          : product.originalPriceRon,
      stock: product?.stock ?? "",
      badge: product?.badge || "",
      isActive: product?.isActive !== false,
      shortDescription: product?.shortDescription || "",
      description: product?.description || "",
      featuresText: jsonArrayToText(product?.features),
      prosText: jsonArrayToText(product?.pros),
      consText: jsonArrayToText(product?.cons),
      specifications: normalizeProductSpecificationsForForm(product?.specifications),
    });
  };

  const handleProductSpecChange = (index, field, value) => {
    setProductForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, specIndex) =>
        specIndex === index ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  const addProductSpecRow = () => {
    setProductForm((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        {
          id: `new-spec-${Date.now()}`,
          name: "",
          value: "",
        },
      ],
    }));
  };

  const removeProductSpecRow = (index) => {
    setProductForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, specIndex) => specIndex !== index),
    }));
  };

  const getProductPayload = () => ({
    name: productForm.name,
    brand: productForm.brand,
    category: productForm.category,
    imageUrl: productForm.imageUrl || null,
    priceRon: Number(productForm.priceRon || 0),
    originalPriceRon:
      productForm.originalPriceRon === ""
        ? null
        : Number(productForm.originalPriceRon || 0),
    stock: Number(productForm.stock || 0),
    badge: productForm.badge || null,
    isActive: Boolean(productForm.isActive),
    shortDescription: productForm.shortDescription || null,
    description: productForm.description || null,
    features: textToJsonArray(productForm.featuresText),
    pros: textToJsonArray(productForm.prosText),
    cons: textToJsonArray(productForm.consText),
    specifications: getVisibleProductSpecifications(productForm.specifications).map(
      (spec, index) => ({
        name: String(spec.name || "").trim(),
        value: String(spec.value || "").trim(),
        sortOrder: index,
      })
    ),
  });

  const openOrderDetailsModal = async (orderId) => {
    setErrorMsg("");

    try {
      setOrderBusy(true);
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data || null);
      setShowOrderDetailsModal(true);
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.error || "Nu am putut încărca detaliile comenzii."
      );
    } finally {
      setOrderBusy(false);
    }
  };

  const openOrderEditModal = async (orderId) => {
    setErrorMsg("");
    clearModalFeedback();

    try {
      setOrderBusy(true);
      const res = await api.get(`/admin/orders/${orderId}`);
      const order = res.data || null;
      setSelectedOrder(order);
      fillOrderEditForm(order);
      setShowOrderEditModal(true);
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.error || "Nu am putut încărca comanda pentru editare."
      );
    } finally {
      setOrderBusy(false);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder?.id) return;

    setErrorMsg("");
    clearModalFeedback();

    try {
      setOrderBusy(true);
      const res = await api.patch(`/admin/orders/${selectedOrder.id}`, getOrderPayload());
      const updatedOrder = res.data || null;
      setSelectedOrder(updatedOrder);
      fillOrderEditForm(updatedOrder);
      setModalSuccess("Comanda a fost actualizată cu succes.");
      await fetchDashboardData();
    } catch (e) {
      const message =
        e?.response?.data?.error ||
        e?.response?.data?.details?.[0]?.message ||
        "Nu am putut salva comanda.";
      setModalError(message);
    } finally {
      setOrderBusy(false);
    }
  };

  const openUserDetailsModal = (targetUser) => {
    setSelectedUser(targetUser);
    setShowUserDetailsModal(true);
  };

  const openUserEditModal = (targetUser) => {
    clearModalFeedback();
    setSelectedUser(targetUser);
    fillUserEditForm(targetUser);
    setShowUserEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser?.id) return;

    setErrorMsg("");
    clearModalFeedback();

    try {
      setUserBusy(true);

      await api.patch(`/admin/users/${selectedUser.id}`, {
        name: userEditForm.name,
        email: userEditForm.email,
        phone: userEditForm.phone || null,
        dateOfBirth: userEditForm.dateOfBirth || null,
        roleName: userEditForm.roleName,
      });

      setModalSuccess("Utilizatorul a fost actualizat cu succes.");
      await fetchDashboardData();
    } catch (e) {
      const message =
        e?.response?.data?.error ||
        e?.response?.data?.details?.[0]?.message ||
        "Nu am putut salva utilizatorul.";
      setModalError(message);
    } finally {
      setUserBusy(false);
    }
  };

  const openProductDetailsModal = (product) => {
    setSelectedProduct(product);
    setShowProductDetailsModal(true);
  };

  const openProductEditModal = (product) => {
    clearModalFeedback();
    setSelectedProduct(product);
    fillProductForm(product);
    setShowProductEditModal(true);
  };

  const openCreateProductModal = () => {
    clearModalFeedback();
    setSelectedProduct(null);
    setProductForm(emptyProductForm);
    setShowCreateProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct?.id) return;

    setErrorMsg("");
    clearModalFeedback();

    try {
      setProductBusy(true);
      await api.patch(`/admin/products/${selectedProduct.id}`, getProductPayload());
      setModalSuccess("Produsul a fost actualizat cu succes.");
      await fetchDashboardData();
    } catch (e) {
      const message =
        e?.response?.data?.error ||
        e?.response?.data?.details?.[0]?.message ||
        "Nu am putut salva produsul.";
      setModalError(message);
    } finally {
      setProductBusy(false);
    }
  };

  const handleCreateProduct = async () => {
    setErrorMsg("");
    clearModalFeedback();

    try {
      setProductBusy(true);
      await api.post("/admin/products", getProductPayload());
      setModalSuccess("Produsul a fost adăugat cu succes.");
      await fetchDashboardData();
      setProductForm(emptyProductForm);
    } catch (e) {
      const message =
        e?.response?.data?.error ||
        e?.response?.data?.details?.[0]?.message ||
        "Nu am putut crea produsul.";
      setModalError(message);
    } finally {
      setProductBusy(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    if (!reviewId) return;

    setModerationNotice("");
    setErrorMsg("");

    try {
      setModerationActionLoading(`review-approve-${reviewId}`);
      await api.patch(`/admin/reviews/${reviewId}/approve`);
      setModerationNotice("Review-ul a fost aprobat.");
      setGlobalSuccess("Review-ul a fost aprobat.");
      await fetchDashboardData();
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut aproba review-ul.");
    } finally {
      setModerationActionLoading("");
    }
  };

  const handleRejectReview = async (reviewId) => {
    if (!reviewId) return;

    const reason = window.prompt("Motiv respingere review, opțional:");
    if (reason === null) return;

    setModerationNotice("");
    setErrorMsg("");

    try {
      setModerationActionLoading(`review-reject-${reviewId}`);
      await api.patch(`/admin/reviews/${reviewId}/reject`, {
        reason,
      });
      setModerationNotice("Review-ul a fost respins.");
      setGlobalSuccess("Review-ul a fost respins.");
      await fetchDashboardData();
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut respinge review-ul.");
    } finally {
      setModerationActionLoading("");
    }
  };

  const handleApproveQuestion = async (questionId) => {
    if (!questionId) return;

    setModerationNotice("");
    setErrorMsg("");

    try {
      setModerationActionLoading(`question-approve-${questionId}`);
      await api.patch(`/admin/questions/${questionId}/approve`);
      setModerationNotice("Întrebarea a fost aprobată.");
      setGlobalSuccess("Întrebarea a fost aprobată.");
      await fetchDashboardData();
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut aproba întrebarea.");
    } finally {
      setModerationActionLoading("");
    }
  };

  const handleRejectQuestion = async (questionId) => {
    if (!questionId) return;

    const reason = window.prompt("Motiv respingere întrebare, opțional:");
    if (reason === null) return;

    setModerationNotice("");
    setErrorMsg("");

    try {
      setModerationActionLoading(`question-reject-${questionId}`);
      await api.patch(`/admin/questions/${questionId}/reject`, {
        reason,
      });
      setModerationNotice("Întrebarea a fost respinsă.");
      setGlobalSuccess("Întrebarea a fost respinsă.");
      await fetchDashboardData();
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut respinge întrebarea.");
    } finally {
      setModerationActionLoading("");
    }
  };

  const handleApproveAnswer = async (answerId) => {
    if (!answerId) return;

    setModerationNotice("");
    setErrorMsg("");

    try {
      setModerationActionLoading(`answer-approve-${answerId}`);
      await api.patch(`/admin/answers/${answerId}/approve`);
      setModerationNotice("Răspunsul a fost aprobat.");
      setGlobalSuccess("Răspunsul a fost aprobat.");
      await fetchDashboardData();
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut aproba răspunsul.");
    } finally {
      setModerationActionLoading("");
    }
  };

  const handleRejectAnswer = async (answerId) => {
    if (!answerId) return;

    const reason = window.prompt("Motiv respingere răspuns, opțional:");
    if (reason === null) return;

    setModerationNotice("");
    setErrorMsg("");

    try {
      setModerationActionLoading(`answer-reject-${answerId}`);
      await api.patch(`/admin/answers/${answerId}/reject`, {
        reason,
      });
      setModerationNotice("Răspunsul a fost respins.");
      setGlobalSuccess("Răspunsul a fost respins.");
      await fetchDashboardData();
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Nu am putut respinge răspunsul.");
    } finally {
      setModerationActionLoading("");
    }
  };

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">
              Se verifică accesul...
            </h1>
            <p className="text-slate-300">Te rog așteaptă câteva momente.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <Shield className="mx-auto mb-4 h-10 w-10 text-red-300" />
            <h1 className="mb-2 text-2xl font-bold text-white">
              Acces restricționat
            </h1>
            <p className="mb-6 text-slate-300">
              Această pagină este disponibilă doar conturilor cu rol de admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartTooltipStyle = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
                Dashboard Admin
              </h1>
              <p className="mt-2 text-slate-400">
                Administrare completă pentru comenzi, utilizatori, produse și moderare conținut
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                type="button"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
                {loading ? "Se încarcă..." : "Refresh"}
              </Button>
            </div>
          </div>
        </motion.div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {successMsg}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-6 md:grid-cols-4"
        >
          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-cyan-500/10 blur-2xl transition-all group-hover:bg-cyan-500/20" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                  <DollarSign className="h-6 w-6 text-cyan-400" />
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  Luna curentă
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatRon(salesThisMonth)} RON
              </div>
              <div className="text-sm text-slate-400">Vânzări luna aceasta</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-blue-500/30">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/30">
                  <ShoppingCart className="h-6 w-6 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400">
                  Luna curentă
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white">
                {ordersThisMonth}
              </div>
              <div className="text-sm text-slate-400">Comenzi noi</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/30">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-purple-500/30">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-400">
                  Total
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white">{usersCount}</div>
              <div className="text-sm text-slate-400">Utilizatori</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-yellow-500/30">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/10 blur-2xl transition-all group-hover:bg-yellow-500/20" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 ring-1 ring-yellow-500/30">
                  <MessageSquare className="h-6 w-6 text-yellow-400" />
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  Pending
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white">
                {pendingModerationCount}
              </div>
              <div className="text-sm text-slate-400">Conținut de moderat</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Evoluție vânzări
                </h3>
                <p className="text-sm text-slate-400">
                  Ultimele 6 luni - vânzări și comenzi
                </p>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                Din baza de date
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vanzari"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="Vânzări (RON)"
                />
                <Line
                  type="monotone"
                  dataKey="comenzi"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Comenzi"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">
                Distribuție categorii
              </h3>
              <p className="text-sm text-slate-400">După venituri</p>
            </div>

            {categoryData.length === 0 ? (
              <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-sm text-slate-300">
                Nu există suficiente date pentru categorii.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-400">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Top produse vândute
              </h3>
              <p className="text-sm text-slate-400">
                Derivate din comenzile din baza de date
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              type="button"
              onClick={() => setTab("products")}
            >
              Vezi toate
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {topProducts.length === 0 ? (
            <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-sm text-slate-300">
              Nu există produse vândute încă.
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-800/30 p-4 transition-all hover:border-cyan-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
                      <Cpu className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {product.name}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {product.sales} bucăți vândute
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-cyan-400">
                      {formatRon(product.revenue)} RON
                    </div>
                    <div className="text-xs text-slate-500">Venit total</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-8 grid w-full grid-cols-2 gap-1 rounded-xl border border-slate-700/50 bg-slate-900/50 p-1 backdrop-blur-sm md:grid-cols-4">
            <TabButton
              active={tab === "orders"}
              icon={ShoppingCart}
              onClick={() => setTab("orders")}
            >
              Comenzi
            </TabButton>

            <TabButton
              active={tab === "users"}
              icon={Users}
              onClick={() => setTab("users")}
            >
              Utilizatori
            </TabButton>

            <TabButton
              active={tab === "products"}
              icon={Boxes}
              onClick={() => setTab("products")}
            >
              Produse
            </TabButton>

            <TabButton
              active={tab === "moderation"}
              icon={MessageSquare}
              onClick={() => setTab("moderation")}
            >
              Moderare
              {pendingModerationCount > 0 ? ` (${pendingModerationCount})` : ""}
            </TabButton>
          </div>

          {tab === "orders" && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Gestionare comenzi
                </h2>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reîmprospătează
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-800/50">
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          ID Comandă
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Data
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Produse
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Total
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-8 text-center text-sm text-slate-400"
                          >
                            Nu există comenzi.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.04 }}
                            className="border-b border-slate-700/30 transition-colors hover:bg-slate-800/30"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-cyan-400">
                                #{order.orderNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm text-white">
                                  {order.customerName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {order.customerEmail}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-400">
                                {formatDateRo(order.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getOrderStatusColor(order.status)}>
                                {getOrderStatusIcon(order.status)}
                                <span className="ml-1">
                                  {getOrderStatusLabel(order.status)}
                                </span>
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-400">
                                {order.itemsCount} produse
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-white">
                                {formatRon(order.totalRon)} RON
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0"
                                  type="button"
                                  disabled={orderBusy}
                                  onClick={() => openOrderDetailsModal(order.id)}
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0"
                                  type="button"
                                  disabled={orderBusy}
                                  onClick={() => openOrderEditModal(order.id)}
                                >
                                  <Edit className="h-5 w-5" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Gestionare utilizatori
                </h2>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reîmprospătează
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-800/50">
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Nume
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Data înregistrare
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Rol
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Comenzi
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Cheltuieli
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-8 text-center text-sm text-slate-400"
                          >
                            Nu există utilizatori.
                          </td>
                        </tr>
                      ) : (
                        users.map((row, index) => (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.04 }}
                            className="border-b border-slate-700/30 transition-colors hover:bg-slate-800/30"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-cyan-400">
                                {row.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-white">
                                {row.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-400">
                                {row.email}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-400">
                                {formatDateRo(row.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="bg-cyan-500/20 text-cyan-400">
                                {row.roleLabel}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-white">
                                {row.ordersCount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-white">
                                {formatRon(row.spentRon)} RON
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0"
                                  type="button"
                                  onClick={() => openUserDetailsModal(row)}
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0"
                                  type="button"
                                  onClick={() => openUserEditModal(row)}
                                >
                                  <Edit className="h-5 w-5" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Gestionare produse
                </h2>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    type="button"
                    onClick={fetchDashboardData}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reîmprospătează
                  </Button>

                  <Button
                    size="sm"
                    type="button"
                    className="gap-2"
                    onClick={openCreateProductModal}
                  >
                    <Plus className="h-4 w-4" />
                    Adaugă produs
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-800/50">
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Produs
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Categorie
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Preț
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Stoc
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Vânzări
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-8 text-center text-sm text-slate-400"
                          >
                            Nu există produse.
                          </td>
                        </tr>
                      ) : (
                        products.map((product, index) => (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.04 }}
                            className="border-b border-slate-700/30 transition-colors hover:bg-slate-800/30"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-cyan-400">
                                {product.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-white">
                                {product.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                                {product.category}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-white">
                                {formatRon(product.priceRon)} RON
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-sm font-medium ${
                                  product.stock === 0
                                    ? "text-red-400"
                                    : product.stock < 20
                                    ? "text-yellow-400"
                                    : "text-green-400"
                                }`}
                              >
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-400">
                                {product.salesCount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                className={getProductStatusColor(product.status)}
                              >
                                {getProductStatusLabel(product.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0"
                                  type="button"
                                  onClick={() => openProductDetailsModal(product)}
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0"
                                  type="button"
                                  onClick={() => openProductEditModal(product)}
                                >
                                  <Edit className="h-5 w-5" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "moderation" && (
            <div className="space-y-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Moderare conținut
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Aprobă sau respinge review-uri, întrebări și răspunsuri înainte să apară public.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reîmprospătează
                </Button>
              </div>

              {moderationNotice && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                  {moderationNotice}
                </div>
              )}

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Review-uri în așteptare
                  </h3>

                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    {pendingReviews.length} pending
                  </Badge>
                </div>

                {pendingReviews.length === 0 ? (
                  <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-sm text-slate-300">
                    Nu există review-uri de moderat.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-5"
                      >
                        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Badge className="bg-cyan-500/20 text-cyan-400">
                                Review
                              </Badge>
                              <span className="text-sm text-slate-400">
                                {formatDateTimeRo(review.createdAt)}
                              </span>
                            </div>

                            <h4 className="font-semibold text-white">
                              {review.title || "Review fără titlu"}
                            </h4>

                            <p className="mt-1 text-sm text-slate-400">
                              Produs:{" "}
                              <span className="text-cyan-300">
                                {review.product?.name || "—"}
                              </span>
                            </p>

                            <p className="text-sm text-slate-400">
                              Autor: {review.authorName || review.user?.email || "Utilizator"}
                            </p>

                            <p className="text-sm text-yellow-300">
                              Rating: {review.rating}/5
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              type="button"
                              className="gap-2"
                              disabled={Boolean(moderationActionLoading)}
                              onClick={() => handleApproveReview(review.id)}
                            >
                              <Check className="h-4 w-4" />
                              Aprobă
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              type="button"
                              className="gap-2"
                              disabled={Boolean(moderationActionLoading)}
                              onClick={() => handleRejectReview(review.id)}
                            >
                              <X className="h-4 w-4" />
                              Respinge
                            </Button>
                          </div>
                        </div>

                        <p className="whitespace-pre-wrap rounded-lg border border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-200">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Întrebări în așteptare
                  </h3>

                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    {pendingQuestions.length} pending
                  </Badge>
                </div>

                {pendingQuestions.length === 0 ? (
                  <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-sm text-slate-300">
                    Nu există întrebări de moderat.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-5"
                      >
                        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Badge className="bg-purple-500/20 text-purple-400">
                                Întrebare
                              </Badge>
                              <span className="text-sm text-slate-400">
                                {formatDateTimeRo(question.createdAt)}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-400">
                              Produs:{" "}
                              <span className="text-cyan-300">
                                {question.product?.name || "—"}
                              </span>
                            </p>

                            <p className="text-sm text-slate-400">
                              Autor: {question.authorName || question.user?.email || "Utilizator"}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              type="button"
                              className="gap-2"
                              disabled={Boolean(moderationActionLoading)}
                              onClick={() => handleApproveQuestion(question.id)}
                            >
                              <Check className="h-4 w-4" />
                              Aprobă
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              type="button"
                              className="gap-2"
                              disabled={Boolean(moderationActionLoading)}
                              onClick={() => handleRejectQuestion(question.id)}
                            >
                              <X className="h-4 w-4" />
                              Respinge
                            </Button>
                          </div>
                        </div>

                        <p className="whitespace-pre-wrap rounded-lg border border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-200">
                          {question.question}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Răspunsuri în așteptare
                  </h3>

                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    {pendingAnswers.length} pending
                  </Badge>
                </div>

                {pendingAnswers.length === 0 ? (
                  <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-sm text-slate-300">
                    Nu există răspunsuri de moderat.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAnswers.map((answer) => (
                      <div
                        key={answer.id}
                        className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-5"
                      >
                        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Badge className="bg-blue-500/20 text-blue-400">
                                Răspuns
                              </Badge>
                              {answer.isOfficial && (
                                <Badge className="bg-cyan-500/20 text-cyan-400">
                                  Oficial
                                </Badge>
                              )}
                              <span className="text-sm text-slate-400">
                                {formatDateTimeRo(answer.createdAt)}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-400">
                              Produs:{" "}
                              <span className="text-cyan-300">
                                {answer.question?.product?.name || "—"}
                              </span>
                            </p>

                            <p className="text-sm text-slate-400">
                              Întrebare:{" "}
                              <span className="text-slate-300">
                                {answer.question?.question || "—"}
                              </span>
                            </p>

                            <p className="text-sm text-slate-400">
                              Autor: {answer.authorName || answer.user?.email || "Utilizator"}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              type="button"
                              className="gap-2"
                              disabled={Boolean(moderationActionLoading)}
                              onClick={() => handleApproveAnswer(answer.id)}
                            >
                              <Check className="h-4 w-4" />
                              Aprobă
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              type="button"
                              className="gap-2"
                              disabled={Boolean(moderationActionLoading)}
                              onClick={() => handleRejectAnswer(answer.id)}
                            >
                              <X className="h-4 w-4" />
                              Respinge
                            </Button>
                          </div>
                        </div>

                        <p className="whitespace-pre-wrap rounded-lg border border-slate-700/40 bg-slate-900/60 p-4 text-sm text-slate-200">
                          {answer.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showOrderDetailsModal && selectedOrder && (
        <Modal
          title={`Comandă #${selectedOrder.orderNumber || selectedOrder.id}`}
          subtitle="Detalii complete despre comandă"
          onClose={() => {
            setShowOrderDetailsModal(false);
            setSelectedOrder(null);
          }}
          maxWidth="max-w-5xl"
        >
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-700/50 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-cyan-400" />
                  {formatDateRo(selectedOrder.createdAt)}
                </div>

                <Badge className={getOrderStatusColor(selectedOrder.status)}>
                  {getOrderStatusIcon(selectedOrder.status)}
                  <span className="ml-1">
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
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
                  <Package className="h-5 w-5 text-cyan-400" />
                  <h4 className="text-lg font-semibold text-white">Produse</h4>
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
                      {getOrderStatusLabel(selectedOrder.status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-400" />
                  <h4 className="text-lg font-semibold text-white">Client</h4>
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
                  <h4 className="text-lg font-semibold text-white">Sumar</h4>
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

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowOrderDetailsModal(false);
                  setSelectedOrder(null);
                }}
              >
                Închide
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showOrderEditModal && selectedOrder && (
        <Modal
          title={`Editează comanda #${selectedOrder.orderNumber || selectedOrder.id}`}
          subtitle="Modifică statusul și detaliile clientului sau livrării."
          onClose={() => {
            setShowOrderEditModal(false);
            setSelectedOrder(null);
            setOrderEditForm(emptyOrderEditForm);
            clearModalFeedback();
          }}
          maxWidth="max-w-4xl"
        >
          <ModalFeedback success={modalSuccessMsg} error={modalErrorMsg} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <h4 className="mb-4 text-lg font-semibold text-white">
                Client și status
              </h4>

              <div className="space-y-4">
                <Field label="Status">
                  <SelectInput
                    value={orderEditForm.status}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="PENDING">În așteptare</option>
                    <option value="PAID">Plătită</option>
                    <option value="PROCESSING">Procesare</option>
                    <option value="SHIPPED">Expediată</option>
                    <option value="DELIVERED">Livrată</option>
                    <option value="CANCELED">Anulată</option>
                  </SelectInput>
                </Field>

                <Field label="Nume client">
                  <TextInput
                    type="text"
                    value={orderEditForm.customerName}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, customerName: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Email client">
                  <TextInput
                    type="email"
                    value={orderEditForm.customerEmail}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, customerEmail: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Telefon client">
                  <TextInput
                    type="text"
                    value={orderEditForm.customerPhone}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, customerPhone: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <h4 className="mb-4 text-lg font-semibold text-white">
                Livrare și plată
              </h4>

              <div className="space-y-4">
                <Field label="Metodă livrare">
                  <SelectInput
                    value={orderEditForm.shippingMethod}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, shippingMethod: e.target.value }))
                    }
                  >
                    <option value="COURIER_STANDARD">Curier standard</option>
                    <option value="COURIER_EXPRESS">Curier expres</option>
                    <option value="EASYBOX">EasyBox</option>
                  </SelectInput>
                </Field>

                <Field label="Metodă plată">
                  <SelectInput
                    value={orderEditForm.paymentMethod}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
                    }
                  >
                    <option value="CARD">Card</option>
                    <option value="CASH_ON_DELIVERY">Ramburs</option>
                  </SelectInput>
                </Field>

                <Field label="Județ">
                  <TextInput
                    type="text"
                    value={orderEditForm.shippingCounty}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, shippingCounty: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Oraș">
                  <TextInput
                    type="text"
                    value={orderEditForm.shippingCity}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({ ...prev, shippingCity: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Cod poștal">
                  <TextInput
                    type="text"
                    value={orderEditForm.shippingPostalCode}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({
                        ...prev,
                        shippingPostalCode: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </div>
          </div>

          {orderEditForm.shippingMethod === "EASYBOX" ? (
            <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <h4 className="mb-4 text-lg font-semibold text-white">
                Date EasyBox
              </h4>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Locker ID">
                  <TextInput
                    type="text"
                    value={orderEditForm.easyboxLockerId}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({
                        ...prev,
                        easyboxLockerId: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Nume locker">
                  <TextInput
                    type="text"
                    value={orderEditForm.easyboxLockerName}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({
                        ...prev,
                        easyboxLockerName: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Oraș EasyBox">
                  <TextInput
                    type="text"
                    value={orderEditForm.easyboxCity}
                    onChange={(e) =>
                      setOrderEditForm((prev) => ({
                        ...prev,
                        easyboxCity: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <Field label="Stradă / adresă completă">
                <TextInput
                  type="text"
                  value={orderEditForm.shippingStreet}
                  onChange={(e) =>
                    setOrderEditForm((prev) => ({
                      ...prev,
                      shippingStreet: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowOrderEditModal(false);
                setSelectedOrder(null);
                setOrderEditForm(emptyOrderEditForm);
                clearModalFeedback();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Anulează
            </Button>

            <Button
              type="button"
              onClick={handleSaveOrder}
              disabled={orderBusy}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {orderBusy ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </Modal>
      )}

      {showUserDetailsModal && selectedUser && (
        <Modal
          title="Detalii utilizator"
          subtitle="Informații despre contul selectat."
          onClose={() => {
            setShowUserDetailsModal(false);
            setSelectedUser(null);
          }}
          maxWidth="max-w-3xl"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Profil</h4>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <p><span className="text-slate-400">Nume:</span> {selectedUser.name || "—"}</p>
                <p><span className="text-slate-400">Email:</span> {selectedUser.email || "—"}</p>
                <p><span className="text-slate-400">Telefon:</span> {selectedUser.phone || "—"}</p>
                <p><span className="text-slate-400">Data nașterii:</span> {formatDateRo(selectedUser.dateOfBirth)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Cont</h4>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <p><span className="text-slate-400">Rol:</span> {selectedUser.roleLabel || "—"}</p>
                <p><span className="text-slate-400">Creat la:</span> {formatDateTimeRo(selectedUser.createdAt)}</p>
                <p><span className="text-slate-400">Comenzi:</span> {selectedUser.ordersCount}</p>
                <p><span className="text-slate-400">Cheltuieli:</span> {formatRon(selectedUser.spentRon)} RON</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUserDetailsModal(false);
                setSelectedUser(null);
              }}
            >
              Închide
            </Button>
          </div>
        </Modal>
      )}

      {showUserEditModal && selectedUser && (
        <Modal
          title="Editează utilizator"
          subtitle="Modifică informațiile de bază ale utilizatorului."
          onClose={() => {
            setShowUserEditModal(false);
            setSelectedUser(null);
            setUserEditForm(emptyUserEditForm);
            clearModalFeedback();
          }}
          maxWidth="max-w-3xl"
        >
          <ModalFeedback success={modalSuccessMsg} error={modalErrorMsg} />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nume">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <TextInput
                  type="text"
                  value={userEditForm.name}
                  onChange={(e) =>
                    setUserEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <TextInput
                  type="email"
                  value={userEditForm.email}
                  onChange={(e) =>
                    setUserEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Telefon">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <TextInput
                  type="text"
                  value={userEditForm.phone}
                  onChange={(e) =>
                    setUserEditForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Data nașterii">
              <TextInput
                type="date"
                value={userEditForm.dateOfBirth}
                onChange={(e) =>
                  setUserEditForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                }
              />
            </Field>

            <Field label="Rol">
              <SelectInput
                value={userEditForm.roleName}
                onChange={(e) =>
                  setUserEditForm((prev) => ({ ...prev, roleName: e.target.value }))
                }
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </SelectInput>
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUserEditModal(false);
                setSelectedUser(null);
                setUserEditForm(emptyUserEditForm);
                clearModalFeedback();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Anulează
            </Button>

            <Button
              type="button"
              onClick={handleSaveUser}
              disabled={userBusy}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {userBusy ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </Modal>
      )}

      {showProductDetailsModal && selectedProduct && (
        <Modal
          title={selectedProduct.name}
          subtitle="Detalii complete produs"
          onClose={() => {
            setShowProductDetailsModal(false);
            setSelectedProduct(null);
          }}
          maxWidth="max-w-4xl"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <h4 className="mb-4 text-lg font-semibold text-white">
                Informații generale
              </h4>

              <div className="space-y-3 text-sm text-slate-300">
                <p><span className="text-slate-400">Brand:</span> {selectedProduct.brand || "—"}</p>
                <p><span className="text-slate-400">Categorie:</span> {selectedProduct.category || "—"}</p>
                <p><span className="text-slate-400">Preț:</span> {formatRon(selectedProduct.priceRon)} RON</p>
                <p><span className="text-slate-400">Preț original:</span> {selectedProduct.originalPriceRon === "" ? "—" : `${formatRon(selectedProduct.originalPriceRon)} RON`}</p>
                <p><span className="text-slate-400">Stoc:</span> {selectedProduct.stock}</p>
                <p><span className="text-slate-400">Badge:</span> {selectedProduct.badge || "—"}</p>
                <p>
                  <span className="text-slate-400">Status:</span>{" "}
                  <Badge className={getProductStatusColor(selectedProduct.status)}>
                    {getProductStatusLabel(selectedProduct.status)}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <h4 className="mb-4 text-lg font-semibold text-white">
                Performanță
              </h4>

              <div className="space-y-3 text-sm text-slate-300">
                <p><span className="text-slate-400">Vânzări:</span> {selectedProduct.salesCount}</p>
                <p><span className="text-slate-400">Venit generat:</span> {formatRon(selectedProduct.revenueRon)} RON</p>
                <p><span className="text-slate-400">Activ:</span> {selectedProduct.isActive ? "Da" : "Nu"}</p>
                <p><span className="text-slate-400">Imagine:</span> {selectedProduct.imageUrl || "—"}</p>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <h4 className="mb-4 text-lg font-semibold text-white">
                Descriere și conținut
              </h4>

              <div className="space-y-4 text-sm text-slate-300">
                <p><span className="text-slate-400">Descriere scurtă:</span> {selectedProduct.shortDescription || "—"}</p>
                <p><span className="text-slate-400">Descriere completă:</span> {selectedProduct.description || "—"}</p>

                <div>
                  <div className="mb-2 font-semibold text-slate-200">Caracteristici</div>
                  {selectedProduct.features?.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-slate-300">
                      {selectedProduct.features.map((feature, idx) => (
                        <li key={`feature-${idx}`}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500">—</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 font-semibold text-slate-200">Avantaje</div>
                    {selectedProduct.pros?.length ? (
                      <ul className="list-disc space-y-1 pl-5 text-slate-300">
                        {selectedProduct.pros.map((pro, idx) => (
                          <li key={`pro-${idx}`}>{pro}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500">—</p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 font-semibold text-slate-200">Dezavantaje</div>
                    {selectedProduct.cons?.length ? (
                      <ul className="list-disc space-y-1 pl-5 text-slate-300">
                        {selectedProduct.cons.map((con, idx) => (
                          <li key={`con-${idx}`}>{con}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
              <h4 className="mb-4 text-lg font-semibold text-white">
                Specificații tehnice
              </h4>

              {selectedProduct.specifications?.length ? (
                <div className="space-y-2 text-sm">
                  {selectedProduct.specifications.map((spec, idx) => (
                    <div
                      key={spec.id || `${spec.name}-${idx}`}
                      className="grid gap-2 rounded-lg border border-slate-700/40 bg-slate-800/30 p-3 md:grid-cols-2"
                    >
                      <span className="font-medium text-slate-400">{spec.name}</span>
                      <span className="text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Nu există specificații tehnice adăugate.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowProductDetailsModal(false);
                setSelectedProduct(null);
              }}
            >
              Închide
            </Button>
          </div>
        </Modal>
      )}

      {(showProductEditModal || showCreateProductModal) && (
        <Modal
          title={showCreateProductModal ? "Adaugă produs nou" : "Editează produs"}
          subtitle={
            showCreateProductModal
              ? "Completează datele pentru produsul nou."
              : "Modifică datele produsului selectat."
          }
          onClose={() => {
            setShowProductEditModal(false);
            setShowCreateProductModal(false);
            setSelectedProduct(null);
            setProductForm(emptyProductForm);
            clearModalFeedback();
          }}
          maxWidth="max-w-4xl"
        >
          <ModalFeedback success={modalSuccessMsg} error={modalErrorMsg} />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nume">
              <div className="relative">
                <Cpu className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <TextInput
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Brand">
              <TextInput
                type="text"
                value={productForm.brand}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, brand: e.target.value }))
                }
              />
            </Field>

            <Field label="Categorie">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <TextInput
                  type="text"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="URL imagine">
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <TextInput
                  type="text"
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  className="pl-11"
                />
              </div>
            </Field>

            <Field label="Preț RON">
              <TextInput
                type="number"
                value={productForm.priceRon}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, priceRon: e.target.value }))
                }
              />
            </Field>

            <Field label="Preț original RON">
              <TextInput
                type="number"
                value={productForm.originalPriceRon}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    originalPriceRon: e.target.value,
                  }))
                }
              />
            </Field>

            <Field label="Stoc">
              <TextInput
                type="number"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
            </Field>

            <Field label="Badge">
              <TextInput
                type="text"
                value={productForm.badge}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, badge: e.target.value }))
                }
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Descriere scurtă">
                <TextInput
                  type="text"
                  value={productForm.shortDescription}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Descriere completă">
                <TextArea
                  rows={5}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Caracteristici principale">
                <TextArea
                  rows={4}
                  value={productForm.featuresText}
                  placeholder="Scrie câte o caracteristică pe linie"
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      featuresText: e.target.value,
                    }))
                  }
                />
              </Field>
              <p className="mt-1 text-xs text-slate-500">
                Se salvează în Product.features ca listă JSON.
              </p>
            </div>

            <div>
              <Field label="Avantaje">
                <TextArea
                  rows={4}
                  value={productForm.prosText}
                  placeholder="Câte un avantaj pe linie"
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      prosText: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>

            <div>
              <Field label="Dezavantaje">
                <TextArea
                  rows={4}
                  value={productForm.consText}
                  placeholder="Câte un dezavantaj pe linie"
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      consText: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-semibold text-white">Specificații tehnice</h4>
                  <p className="text-xs text-slate-500">
                    Apar în tabul „Specificații” din pagina produsului.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={addProductSpecRow}
                >
                  <Plus className="h-4 w-4" />
                  Adaugă specificație
                </Button>
              </div>

              {productForm.specifications.length > 0 ? (
                <div className="space-y-3">
                  {productForm.specifications.map((spec, index) => (
                    <div
                      key={spec.id || `spec-${index}`}
                      className="grid gap-3 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <TextInput
                        type="text"
                        value={spec.name}
                        placeholder="Nume: Socket, Memorie, Garanție..."
                        onChange={(e) =>
                          handleProductSpecChange(index, "name", e.target.value)
                        }
                      />

                      <TextInput
                        type="text"
                        value={spec.value}
                        placeholder="Valoare: AM5, DDR5, 36 luni..."
                        onChange={(e) =>
                          handleProductSpecChange(index, "value", e.target.value)
                        }
                      />

                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeProductSpecRow(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-950/30 p-4 text-sm text-slate-500">
                  Nu ai adăugat nicio specificație.
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                id="productActive"
                type="checkbox"
                checked={productForm.isActive}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-500"
              />
              <label htmlFor="productActive" className="text-sm text-slate-300">
                Produs activ
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowProductEditModal(false);
                setShowCreateProductModal(false);
                setSelectedProduct(null);
                setProductForm(emptyProductForm);
                clearModalFeedback();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Anulează
            </Button>

            <Button
              type="button"
              onClick={showCreateProductModal ? handleCreateProduct : handleSaveProduct}
              disabled={productBusy}
              className="gap-2"
            >
              {showCreateProductModal ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {productBusy
                ? showCreateProductModal
                  ? "Se creează..."
                  : "Se salvează..."
                : showCreateProductModal
                ? "Creează produs"
                : "Salvează"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
