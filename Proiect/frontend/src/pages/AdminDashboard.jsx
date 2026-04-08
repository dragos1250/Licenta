import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Settings,
  Activity,
  ChevronRight,
  Shield,
  RefreshCw,
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

function getPrimaryRoleLabel(user) {
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
    case "PROCESSING":
      return "Procesare";
    case "SHIPPED":
      return "Expediată";
    case "DELIVERED":
      return "Livrată";
    case "CANCELED":
      return "Anulată";
    case "PAID":
      return "Plătită";
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState("orders");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [ordersRaw, setOrdersRaw] = useState([]);
  const [usersRaw, setUsersRaw] = useState([]);
  const [productsRaw, setProductsRaw] = useState([]);

  const [profileRoles, setProfileRoles] = useState([]);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

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
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        api.get("/admin/orders"),
        api.get("/admin/users"),
        api.get("/admin/products"),
      ]);

      setOrdersRaw(
        pickArray(ordersRes.data, ["orders", "items", "data", "rows"])
      );
      setUsersRaw(pickArray(usersRes.data, ["users", "items", "data", "rows"]));
      setProductsRaw(
        pickArray(productsRes.data, ["products", "items", "data", "rows"])
      );
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.error ||
          "Nu am putut încărca dashboard-ul de administrare."
      );
      setOrdersRaw([]);
      setUsersRaw([]);
      setProductsRaw([]);
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
        id: u?.id || "",
        name: u?.name || "Utilizator",
        email: u?.email || "—",
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
        id: p?.id || "",
        name: p?.name || "Produs",
        category: p?.category || "Necategorizat",
        priceRon: Number(p?.priceRon || 0),
        stock: Number(p?.stock || 0),
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
  }, [orders]);

  const ordersThisMonth = useMemo(() => {
    return orders.filter((order) => {
      const d = new Date(order.createdAt || 0);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }).length;
  }, [orders]);

  const usersCount = users.length;

  const totalUnitsInStock = useMemo(() => {
    return products.reduce((sum, p) => sum + Math.max(Number(p.stock || 0), 0), 0);
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
  }, [orders]);

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
        const productId = item?.productId || item?.product?.id || item?.productName;
        const productName = item?.productName || item?.product?.name || "Produs";
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

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">
              Se verifică accesul...
            </h1>
            <p className="text-slate-300">
              Te rog așteaptă câteva momente.
            </p>
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
            <Button type="button" onClick={() => navigate("/account")}>
              Înapoi în cont
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                Administrare completă pentru comenzi, utilizatori și produse
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

              <Button
                className="gap-2"
                type="button"
                onClick={() => navigate("/admin/settings")}
              >
                <Settings className="h-4 w-4" />
                Setări sistem
              </Button>
            </div>
          </div>
        </motion.div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
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
                <Badge className="bg-blue-500/20 text-blue-400">Luna curentă</Badge>
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

          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-pink-500/30">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-pink-500/10 blur-2xl transition-all group-hover:bg-pink-500/20" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/20 ring-1 ring-pink-500/30">
                  <Box className="h-6 w-6 text-pink-400" />
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {lowStockCount} stoc mic
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatRon(totalUnitsInStock)}
              </div>
              <div className="text-sm text-slate-400">Unități în stoc</div>
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

            {salesData.length === 0 ? (
              <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-sm text-slate-300">
                Nu există suficiente date pentru grafic.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
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
            )}
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
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
                        <span className="text-sm text-slate-400">{item.name}</span>
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
                      <h4 className="font-semibold text-white">{product.name}</h4>
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
          <div className="mb-8 grid w-full grid-cols-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-1 backdrop-blur-sm">
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
                                  className="h-8 w-8 p-0"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/orders/${order.id}`)
                                  }
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/orders/${order.id}/edit`)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
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
                                  className="h-8 w-8 p-0"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/users/${row.id}`)
                                  }
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/users/${row.id}/edit`)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
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
                    onClick={() => navigate("/admin/products/new")}
                  >
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
                              <Badge className={getProductStatusColor(product.status)}>
                                {getProductStatusLabel(product.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/products/${product.id}`)
                                  }
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/admin/products/${product.id}/edit`)
                                  }
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
        </motion.div>
      </div>
    </div>
  );
}