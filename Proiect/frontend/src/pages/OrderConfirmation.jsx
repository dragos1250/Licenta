import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Mail,
  Calendar,
  ArrowRight,
  Home,
  Sparkles,
  Truck,
  AlertCircle,
} from "lucide-react";
import api from "../lib/api";
import Seo from "../components/Seo";

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  className = "",
  variant = "solid",
  size = "md",
  disabled,
  type = "button",
  ...props
}) {
  const variants = {
    solid:
      "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50",
    outline:
      "border border-slate-600 bg-transparent text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400",
  };

  const sizes = {
    md: "px-4 py-3 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function formatDateRo(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRon(value) {
  return Number(value || 0).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function shippingMethodLabel(method) {
  switch (method) {
    case "COURIER_EXPRESS":
      return "Curier expres";
    case "EASYBOX":
      return "EasyBox";
    case "COURIER_STANDARD":
      return "Curier standard";
    default:
      return "Livrare";
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

function getEstimatedDelivery(method) {
  switch (method) {
    case "COURIER_EXPRESS":
      return "1-2 zile lucrătoare";
    case "EASYBOX":
      return "1-3 zile lucrătoare";
    case "COURIER_STANDARD":
    default:
      return "3-5 zile lucrătoare";
  }
}

function getOrderFromResponse(data) {
  if (!data) return null;
  if (data.order && typeof data.order === "object") return data.order;
  return data;
}

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialOrder = location.state?.order || null;
  const checkoutSnapshot = location.state?.checkout || {};
  const orderId =
    searchParams.get("orderId") ||
    searchParams.get("id") ||
    location.state?.orderId ||
    initialOrder?.id ||
    "";

  const orderNumberFromUrl =
    searchParams.get("orderNumber") ||
    searchParams.get("order") ||
    initialOrder?.orderNumber ||
    "";

  const shippingMethodFromUrl = searchParams.get("shippingMethod") || "";

  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(Boolean(orderId && !initialOrder));
  const [errorMsg, setErrorMsg] = useState("");

  const supportEmail = "configexp.app@gmail.com";
  const supportPhone = "+40 722 123 456";
  const supportPhoneHref = `tel:${supportPhone.replace(/\s/g, "")}`;

  useEffect(() => {
    if (!orderId || initialOrder) return;

    let cancelled = false;

    async function fetchOrder() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await api.get(`/orders/my/${orderId}`);
        if (!cancelled) {
          setOrder(getOrderFromResponse(res.data));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMsg(
            error?.response?.data?.error ||
              "Nu am putut încărca detaliile comenzii."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, initialOrder]);

  const shippingMethod =
    order?.shippingMethod ||
    checkoutSnapshot.shippingMethod ||
    shippingMethodFromUrl ||
    "COURIER_STANDARD";

  const paymentMethod =
    order?.paymentMethod || checkoutSnapshot.paymentMethod || "";

  const orderNumber = order?.orderNumber || orderNumberFromUrl || "—";
  const orderDate = formatDateRo(order?.createdAt || new Date());
  const estimatedDelivery = getEstimatedDelivery(shippingMethod);
  const customerEmail = order?.customerEmail || checkoutSnapshot.customerEmail || "";
  const totalRon = Number(order?.totalRon ?? checkoutSnapshot.totalRon ?? 0);
  const itemsCount = Array.isArray(order?.items)
    ? order.items.length
    : Number(checkoutSnapshot.itemsCount || 0);

  const nextSteps = useMemo(
    () => [
      {
        step: "1",
        title: "Confirmare email",
        description: customerEmail
          ? `Confirmarea comenzii a fost trimisă la ${customerEmail}.`
          : "Vei primi un email cu detaliile comenzii în câteva minute.",
      },
      {
        step: "2",
        title: "Procesare comandă",
        description:
          "Pregătim produsele și verificăm detaliile înainte de expediere.",
      },
      {
        step: "3",
        title: "Expediere",
        description:
          "Vei primi detaliile de tracking când coletul este predat curierului.",
      },
      {
        step: "4",
        title: "Livrare",
        description: `${shippingMethodLabel(
          shippingMethod
        )} - estimare ${estimatedDelivery}.`,
      },
    ],
    [customerEmail, estimatedDelivery, shippingMethod]
  );

  if (loading) {
    return (
      <>
        <Seo
          title="Comandă confirmată"
          description="Confirmarea comenzii plasate pe ConfigEXP."
          noIndex
        />

        <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 text-slate-300 backdrop-blur-sm">
            Se încarcă detaliile comenzii...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Comandă confirmată"
        description={
          orderNumber && orderNumber !== "—"
            ? `Comanda ${orderNumber} a fost plasată cu succes pe ConfigEXP.`
            : "Comanda ta a fost plasată cu succes pe ConfigEXP."
        }
        noIndex
      />

      <div className="relative min-h-screen overflow-x-hidden px-4 py-10 sm:px-6 sm:py-12">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl sm:left-1/4 sm:top-1/4 sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl sm:bottom-1/4 sm:right-1/4 sm:h-96 sm:w-96" />
      </div>

      <div className="mx-auto max-w-4xl">
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-7 flex justify-center sm:mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.18, 1],
                  opacity: [0.45, 0.75, 0.45],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-green-500/30 blur-2xl"
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/40 ring-4 ring-green-500/20 sm:h-24 sm:w-24">
                <CheckCircle2 className="h-12 w-12 text-white sm:h-14 sm:w-14" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-3 inline-block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text pb-1 text-3xl font-bold leading-[1.15] text-transparent sm:text-5xl">
              Comandă plasată cu succes!
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-lg">
              Mulțumim pentru comanda ta. Am primit-o și o procesăm acum.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm"
          >
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-5 text-center sm:p-8">
              <p className="mb-2 text-sm font-medium text-slate-400">
                Număr comandă
              </p>

              <div className="mb-4 break-words bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-mono text-2xl font-bold text-transparent sm:text-4xl">
                {orderNumber}
              </div>

              <Badge className="border-green-500/30 bg-green-500/20 text-green-400">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Confirmată
              </Badge>
            </div>

            <div className="grid gap-4 p-5 sm:p-8 md:grid-cols-3">
              <div className="flex flex-col items-center rounded-xl border border-slate-700/40 bg-slate-800/20 p-4 text-center md:border-0 md:bg-transparent md:p-0">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
                  <Calendar className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="mb-1 text-xs text-slate-500">Data comenzii</p>
                <p className="font-medium text-white">{orderDate}</p>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-slate-700/40 bg-slate-800/20 p-4 text-center md:border-0 md:bg-transparent md:p-0">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <p className="mb-1 text-xs text-slate-500">Confirmare trimisă</p>
                <p className="break-all font-medium text-white">
                  {customerEmail || "Via email"}
                </p>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-slate-700/40 bg-slate-800/20 p-4 text-center md:border-0 md:bg-transparent md:p-0">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
                  <Truck className="h-6 w-6 text-green-400" />
                </div>
                <p className="mb-1 text-xs text-slate-500">Livrare estimată</p>
                <p className="font-medium text-white">{estimatedDelivery}</p>
              </div>
            </div>

            {(order || checkoutSnapshot?.shippingMethod) && (
              <div className="grid gap-3 border-t border-slate-800 p-5 sm:grid-cols-3 sm:p-6">
                <div className="rounded-xl border border-slate-700/50 bg-slate-950/30 p-4 text-center">
                  <p className="mb-1 text-xs text-slate-500">Produse</p>
                  <p className="font-semibold text-white">
                    {itemsCount || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-slate-950/30 p-4 text-center">
                  <p className="mb-1 text-xs text-slate-500">Plată</p>
                  <p className="font-semibold text-white">
                    {paymentMethodLabel(paymentMethod)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-slate-950/30 p-4 text-center">
                  <p className="mb-1 text-xs text-slate-500">Total</p>
                  <p className="font-semibold text-cyan-400">
                    {formatRon(totalRon)} RON
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm sm:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Ce urmează?</h2>
            </div>

            <div className="space-y-4">
              {nextSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.08 }}
                  className="flex gap-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-sm font-bold text-white">
                    {item.step}
                  </div>

                  <div className="min-w-0">
                    <h3 className="mb-1 font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="mx-auto grid max-w-2xl gap-4 md:grid-cols-2"
          >
            <Button
              onClick={() => navigate("/account?tab=orders")}
              className="w-full gap-2"
              size="lg"
            >
              <Package className="h-5 w-5" />
              Vezi comanda
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Home className="h-5 w-5" />
              Acasă
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
            className="mt-8 rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 text-center sm:p-6"
          >
            <p className="mb-2 text-sm text-slate-400">
              Ai întrebări despre comandă?
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
              Contactează-ne la{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-cyan-400 transition-colors hover:text-cyan-300"
              >
                {supportEmail}
              </a>{" "}
              sau sună la{" "}
              <a
                href={supportPhoneHref}
                className="text-cyan-400 transition-colors hover:text-cyan-300"
              >
                {supportPhone}
              </a>
            </p>

            <div className="mt-4">
              <Link
                to="/components"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Continuă cumpărăturile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </>
  );
}
