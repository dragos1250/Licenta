import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Package,
  Calendar,
  Box,
  Zap,
} from "lucide-react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const VAT_RATE = 0.21;
const GUEST_CART_KEY = "configexp_guest_cart_v1";

const sectionClass =
  "rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)]";

const inputClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-3 text-sm text-white shadow-sm shadow-black/10 placeholder:text-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10";

const inputWithIconClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-800/90 py-3 pl-11 pr-4 text-sm text-white shadow-sm shadow-black/10 placeholder:text-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10";

const selectClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-3 text-sm text-white shadow-sm shadow-black/10 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10";

const formatRon = (n) =>
  new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n ?? 0));

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
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

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function OptionCard({ selected, children, onClick, className = "" }) {
  return (
    <label
      onClick={onClick}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${
        selected
          ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_0_1px_rgba(6,182,212,0.15)]"
          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
      } ${className}`}
    >
      {children}
    </label>
  );
}

function StripeCardPaymentBox({ onPaymentSucceeded, setErrorMsg }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [localMessage, setLocalMessage] = useState("");

  const handleCardPayment = async () => {
    setLocalMessage("");
    setErrorMsg("");

    if (!stripe || !elements) {
      const msg = "Formularul Stripe nu este încă pregătit.";
      setLocalMessage(msg);
      setErrorMsg(msg);
      return;
    }

    setIsPaying(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: "if_required",
      });

      if (error) {
        const msg = error.message || "Plata a eșuat.";
        setLocalMessage(msg);
        setErrorMsg(msg);
        return;
      }

      if (!paymentIntent) {
        const msg = "Plata nu a putut fi confirmată.";
        setLocalMessage(msg);
        setErrorMsg(msg);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await onPaymentSucceeded(paymentIntent);
        return;
      }

      if (paymentIntent.status === "processing") {
        const msg =
          "Plata este în procesare. Comanda nu a fost finalizată încă.";
        setLocalMessage(msg);
        setErrorMsg(msg);
        return;
      }

      const msg = `Status plată neașteptat: ${paymentIntent.status}`;
      setLocalMessage(msg);
      setErrorMsg(msg);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "A apărut o eroare la confirmarea plății.";
      setLocalMessage(msg);
      setErrorMsg(msg);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-cyan-500/20 bg-slate-950/40 p-4">
      <div className="mb-3 text-sm font-medium text-white">
        Completează plata cu cardul
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
        <PaymentElement />
      </div>

      <Button
        type="button"
        onClick={handleCardPayment}
        disabled={isPaying || !stripe || !elements}
        className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
      >
        {isPaying ? "Se procesează plata..." : "Plătește acum"}
      </Button>

      {localMessage && (
        <p className="mt-3 text-sm text-slate-300">{localMessage}</p>
      )}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // courier | courier_express | easybox
    deliveryType: "courier",

    // courier
    address: "",
    city: "",
    county: "",
    postalCode: "",

    // easybox
    easyboxLocationId: "",

    // payment
    paymentMethod: "card", // card | cash | installments
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [cartLoading, setCartLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  const [clientSecret, setClientSecret] = useState("");
  const [breakdown, setBreakdown] = useState(null);

  const easyboxLocations = [
    {
      id: "EBX-001",
      city: "București",
      county: "București",
      name: "București - Piața Unirii, Str. Regina Elisabeta nr. 5",
    },
    {
      id: "EBX-002",
      city: "București",
      county: "București",
      name: "București - Sector 1, Bd. Aviatorilor nr. 40",
    },
    {
      id: "EBX-101",
      city: "Cluj-Napoca",
      county: "Cluj",
      name: "Cluj-Napoca - Str. Eroilor nr. 15",
    },
    {
      id: "EBX-201",
      city: "Timișoara",
      county: "Timiș",
      name: "Timișoara - Piața Victoriei nr. 2",
    },
    {
      id: "EBX-301",
      city: "Iași",
      county: "Iași",
      name: "Iași - Bd. Carol I nr. 11",
    },
    {
      id: "EBX-401",
      city: "Brașov",
      county: "Brașov",
      name: "Brașov - Str. Republicii nr. 62",
    },
    {
      id: "EBX-501",
      city: "Constanța",
      county: "Constanța",
      name: "Constanța - Bd. Tomis nr. 79",
    },
  ];

  const selectedEasybox = useMemo(() => {
    return (
      easyboxLocations.find((x) => x.id === formData.easyboxLocationId) || null
    );
  }, [formData.easyboxLocationId]);

  const resetStripeState = () => {
    setClientSecret("");
    setBreakdown(null);
  };

  const updateField = (field, value) => {
    setFormData((prev) => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
    if (clientSecret) {
      resetStripeState();
    }
  };

  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true);
      setErrorMsg("");

      try {
        if (!isAuthLoading && isAuthenticated) {
          const res = await api.get("/cart");
          const items = (res.data?.items || []).map((it) => ({
            productId: it.productId,
            name: it.product?.name || "Produs",
            quantity: Number(it.quantity) || 1,
            unitPriceRon: Number(it.unitPriceRon) || 0,
          }));
          setCartItems(items);
        } else {
          const guest = loadGuestCart();
          const items = guest.map((it) => ({
            productId: it.productId,
            name: it.name || "Produs",
            quantity: Number(it.quantity) || 1,
            unitPriceRon: Number(it.unitPriceRon) || 0,
          }));
          setCartItems(items);
        }
      } catch (e) {
        setErrorMsg(e?.response?.data?.error || "Nu am putut încărca coșul.");
        setCartItems([]);
      } finally {
        setCartLoading(false);
      }
    };

    if (!isAuthLoading) {
      loadCart();
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (clientSecret) {
      resetStripeState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    let cancelled = false;

    const loadCheckoutPrefill = async () => {
      let profile = null;
      let addresses = [];

      try {
        const profileRes = await api.get("/users/me/profile");
        profile = profileRes.data || null;
      } catch {
        profile = user
          ? {
              name: user.name || "",
              email: user.email || "",
              phone: "",
            }
          : null;
      }

      try {
        const addressesRes = await api.get("/users/me/addresses");
        addresses = Array.isArray(addressesRes.data) ? addressesRes.data : [];
      } catch {
        addresses = [];
      }

      const defaultAddress =
        addresses.find((addr) => addr.isDefault) || addresses[0] || null;

      const { firstName, lastName } = splitFullName(profile?.name || "");

      if (cancelled) return;

      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName.trim() || firstName,
        lastName: prev.lastName.trim() || lastName,
        email: prev.email.trim() || profile?.email || "",
        phone:
          prev.phone.trim() ||
          profile?.phone ||
          defaultAddress?.phone ||
          "",
        address: prev.address.trim() || defaultAddress?.street || "",
        city: prev.city.trim() || defaultAddress?.city || "",
        county: prev.county.trim() || defaultAddress?.county || "",
        postalCode:
          prev.postalCode.trim() || defaultAddress?.postalCode || "",
      }));
    };

    loadCheckoutPrefill();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, user]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, it) => sum + it.unitPriceRon * it.quantity,
      0
    );
  }, [cartItems]);

  const vatRon = useMemo(() => {
    return Math.round(subtotal * VAT_RATE * 100) / 100;
  }, [subtotal]);

  const shippingMethodApi = useMemo(() => {
    if (formData.deliveryType === "easybox") return "EASYBOX";
    if (formData.deliveryType === "courier_express") return "COURIER_EXPRESS";
    return "COURIER_STANDARD";
  }, [formData.deliveryType]);

  const paymentMethodApi = useMemo(() => {
    if (formData.paymentMethod === "cash") return "CASH_ON_DELIVERY";
    return "CARD";
  }, [formData.paymentMethod]);

  const shippingFeeRon = useMemo(() => {
    if (shippingMethodApi === "COURIER_EXPRESS") return 30;
    if (subtotal >= 500) return 0;
    if (shippingMethodApi === "EASYBOX") return 15;
    return 30;
  }, [subtotal, shippingMethodApi]);

  const paymentFeeRon = useMemo(() => {
    return paymentMethodApi === "CASH_ON_DELIVERY" ? 12.99 : 0;
  }, [paymentMethodApi]);

  const total = useMemo(() => {
    return subtotal + vatRon + shippingFeeRon + paymentFeeRon;
  }, [subtotal, vatRon, shippingFeeRon, paymentFeeRon]);

  const validateBeforeSubmit = () => {
    if (!cartItems.length) return "Coșul este gol.";

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return "Completează numele.";
    }

    if (!formData.email.trim()) {
      return "Completează email-ul.";
    }

    if (!formData.phone.trim()) {
      return "Completează telefonul.";
    }

    if (
      formData.deliveryType === "courier" ||
      formData.deliveryType === "courier_express"
    ) {
      if (!formData.address.trim()) return "Completează adresa pentru curier.";
      if (!formData.city.trim()) return "Completează orașul.";
      if (!formData.county.trim()) return "Completează județul.";
    } else {
      if (!formData.easyboxLocationId) {
        return "Selectează o locație EasyBox.";
      }
    }

    return "";
  };

  const buildGuestItemsPayload = () => {
    return cartItems.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
    }));
  };

  const buildCheckoutPayload = () => {
    const customerName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

    const payloadBase = {
      customerName,
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim(),
      shippingMethod: shippingMethodApi,
      paymentMethod: paymentMethodApi,
    };

    if (shippingMethodApi === "EASYBOX") {
      const eb = selectedEasybox;
      const county = eb?.county || "București";
      const city = eb?.city || "București";

      payloadBase.shippingCounty = county;
      payloadBase.shippingCity = city;
      payloadBase.easyboxLockerId = eb?.id;
      payloadBase.easyboxLockerName = eb?.name;
      payloadBase.easyboxCity = city;
    } else {
      payloadBase.shippingCounty = formData.county.trim();
      payloadBase.shippingCity = formData.city.trim();
      payloadBase.shippingStreet = formData.address.trim();
      payloadBase.shippingPostalCode = formData.postalCode.trim() || undefined;
    }

    return payloadBase;
  };

  const createPaymentIntent = async () => {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      throw new Error(
        "Lipsește VITE_STRIPE_PUBLISHABLE_KEY în frontend/.env.local."
      );
    }

    const basePayload = buildCheckoutPayload();

    let res;

    if (!isAuthLoading && isAuthenticated) {
      res = await api.post("/payments/create-intent-auth", basePayload);
    } else {
      res = await api.post("/payments/create-intent-guest", {
        ...basePayload,
        items: buildGuestItemsPayload(),
      });
    }

    if (!res.data?.clientSecret) {
      throw new Error("Serverul nu a returnat clientSecret.");
    }

    setClientSecret(res.data.clientSecret);
    setBreakdown(res.data?.breakdown || null);

    setTimeout(() => {
      document
        .getElementById("stripe-payment-box")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const finalizePaidOrder = async () => {
    const payload = buildCheckoutPayload();

    if (!isAuthLoading && isAuthenticated) {
      await api.post("/orders/checkout", payload);
      window.dispatchEvent(new Event("cart:updated"));
      alert("Plata a fost efectuată și comanda a fost plasată cu succes! 🎉");
      navigate("/account");
      return;
    }

    const items = buildGuestItemsPayload();

    await api.post("/orders/guest-checkout", {
      ...payload,
      items,
    });

    clearGuestCart();
    window.dispatchEvent(new Event("cart:updated"));
    alert("Plata a fost efectuată și comanda a fost plasată cu succes! 🎉");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const err = validateBeforeSubmit();
    if (err) {
      setErrorMsg(err);
      return;
    }

    if (paymentMethodApi === "CARD" && clientSecret) {
      setErrorMsg(
        "Formularul Stripe este deja pregătit mai jos. Completează plata."
      );
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethodApi === "CARD") {
        await createPaymentIntent();
        return;
      }

      const payload = buildCheckoutPayload();

      if (!isAuthLoading && isAuthenticated) {
        await api.post("/orders/checkout", payload);
        window.dispatchEvent(new Event("cart:updated"));
        alert("Comanda a fost plasată cu succes! 🎉");
        navigate("/account");
        return;
      }

      const items = buildGuestItemsPayload();

      await api.post("/orders/guest-checkout", {
        ...payload,
        items,
      });

      clearGuestCart();
      window.dispatchEvent(new Event("cart:updated"));
      alert("Comanda a fost plasată cu succes! 🎉");
      navigate("/");
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || e?.message || "Checkout eșuat.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la coș
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                Finalizare comandă
              </h1>
              <p className="text-slate-400">
                Completează datele de livrare și plata
              </p>
            </div>
          </div>
        </motion.div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {cartLoading ? (
          <div className={sectionClass}>
            <div className="text-slate-300">Se încarcă coșul...</div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className={sectionClass}>
            <div className="text-slate-300">
              Coșul este gol. Mergi la{" "}
              <Link
                className="text-cyan-400 hover:text-cyan-300"
                to="/components"
              >
                produse
              </Link>
              .
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={sectionClass}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <User className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Informații personale
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Prenume *
                      </label>
                      <input
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        placeholder="Ion"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Nume *
                      </label>
                      <input
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="Popescu"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="ion.popescu@email.ro"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Telefon *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input
                          type="tel"
                          autoComplete="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="0712 345 678"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={sectionClass}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Truck className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Tip de livrare
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <OptionCard
                      selected={formData.deliveryType === "courier"}
                      onClick={() => updateField("deliveryType", "courier")}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={formData.deliveryType === "courier"}
                        onChange={() => updateField("deliveryType", "courier")}
                        className="mt-1 h-5 w-5 cursor-pointer border-slate-700 bg-slate-800 text-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-cyan-400" />
                          <span className="font-semibold text-white">
                            Curier standard
                          </span>
                          <Badge className="border border-slate-600 bg-slate-700/60 text-slate-200">
                            2-3 zile
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Livrare standard la adresă.
                        </p>
                      </div>
                    </OptionCard>

                    <OptionCard
                      selected={formData.deliveryType === "courier_express"}
                      onClick={() =>
                        updateField("deliveryType", "courier_express")
                      }
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={formData.deliveryType === "courier_express"}
                        onChange={() =>
                          updateField("deliveryType", "courier_express")
                        }
                        className="mt-1 h-5 w-5 cursor-pointer border-slate-700 bg-slate-800 text-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-amber-400" />
                          <span className="font-semibold text-white">
                            Curier Express
                          </span>
                          <Badge className="border border-amber-500/30 bg-amber-500/10 text-amber-300">
                            1-2 zile
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Livrare prioritară, mai rapidă decât standard.
                        </p>
                      </div>
                    </OptionCard>

                    <OptionCard
                      selected={formData.deliveryType === "easybox"}
                      onClick={() => updateField("deliveryType", "easybox")}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        checked={formData.deliveryType === "easybox"}
                        onChange={() => updateField("deliveryType", "easybox")}
                        className="mt-1 h-5 w-5 cursor-pointer border-slate-700 bg-slate-800 text-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Box className="h-5 w-5 text-cyan-400" />
                          <span className="font-semibold text-white">
                            EasyBox
                          </span>
                          <Badge className="border border-green-500/30 bg-green-500/10 text-green-300">
                            Economic
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Ridici coletul din locker, când îți este convenabil.
                        </p>
                      </div>
                    </OptionCard>
                  </div>
                </motion.div>

                {(formData.deliveryType === "courier" ||
                  formData.deliveryType === "courier_express") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={sectionClass}
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                        <MapPin className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Adresă de livrare
                        </h2>
                        <p className="text-sm text-slate-400">
                          Pentru{" "}
                          {formData.deliveryType === "courier_express"
                            ? "Curier Express"
                            : "Curier standard"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Adresă completă *
                        </label>
                        <input
                          type="text"
                          autoComplete="street-address"
                          required
                          value={formData.address}
                          onChange={(e) => updateField("address", e.target.value)}
                          placeholder="Str. Lalelelor nr. 12, bl. A2, sc. 1, ap. 8"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Oraș *
                          </label>
                          <input
                            type="text"
                            autoComplete="address-level2"
                            required
                            value={formData.city}
                            onChange={(e) => updateField("city", e.target.value)}
                            placeholder="București"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Județ *
                          </label>
                          <input
                            type="text"
                            autoComplete="address-level1"
                            required
                            value={formData.county}
                            onChange={(e) => updateField("county", e.target.value)}
                            placeholder="București / Ilfov"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Cod poștal
                          </label>
                          <input
                            type="text"
                            autoComplete="postal-code"
                            value={formData.postalCode}
                            onChange={(e) =>
                              updateField("postalCode", e.target.value)
                            }
                            placeholder="010101"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {formData.deliveryType === "easybox" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={sectionClass}
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                        <Box className="h-5 w-5 text-cyan-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">
                        Locație EasyBox
                      </h2>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Selectează locker-ul *
                      </label>
                      <select
                        required
                        value={formData.easyboxLocationId}
                        onChange={(e) =>
                          updateField("easyboxLocationId", e.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="">Alege o locație EasyBox</option>
                        {easyboxLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>

                      {selectedEasybox && (
                        <p className="mt-3 text-xs text-slate-400">
                          Va fi livrat către{" "}
                          <span className="font-medium text-slate-200">
                            {selectedEasybox.city}
                          </span>{" "}
                          /{" "}
                          <span className="font-medium text-slate-200">
                            {selectedEasybox.county}
                          </span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={sectionClass}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <CreditCard className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Metodă de plată
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <OptionCard
                      selected={formData.paymentMethod === "card"}
                      onClick={() => updateField("paymentMethod", "card")}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={formData.paymentMethod === "card"}
                        onChange={() => updateField("paymentMethod", "card")}
                        className="mt-1 h-5 w-5 cursor-pointer border-slate-700 bg-slate-800 text-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-cyan-400" />
                          <span className="font-semibold text-white">
                            Card bancar
                          </span>
                          <Badge className="border border-green-500/30 bg-green-500/10 text-green-300">
                            Recomandat
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Plată online securizată.
                        </p>
                      </div>
                    </OptionCard>

                    <OptionCard
                      selected={formData.paymentMethod === "cash"}
                      onClick={() => updateField("paymentMethod", "cash")}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={formData.paymentMethod === "cash"}
                        onChange={() => updateField("paymentMethod", "cash")}
                        className="mt-1 h-5 w-5 cursor-pointer border-slate-700 bg-slate-800 text-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-cyan-400" />
                          <span className="font-semibold text-white">
                            Ramburs
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          Plătești la livrare. Se aplică taxă suplimentară.
                        </p>
                      </div>
                    </OptionCard>

                    <OptionCard
                      selected={formData.paymentMethod === "installments"}
                      onClick={() => updateField("paymentMethod", "installments")}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={formData.paymentMethod === "installments"}
                        onChange={() =>
                          updateField("paymentMethod", "installments")
                        }
                        className="mt-1 h-5 w-5 cursor-pointer border-slate-700 bg-slate-800 text-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-cyan-400" />
                          <span className="font-semibold text-white">Rate</span>
                          <Badge className="border border-purple-500/30 bg-purple-500/10 text-purple-300">
                            0% dobândă
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          În frontend se trimite momentan ca plată de tip card.
                        </p>
                      </div>
                    </OptionCard>
                  </div>

                  {paymentMethodApi === "CARD" && (
                    <div className="mt-4">
                      {!clientSecret ? (
                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-slate-300">
                          După ce apeși{" "}
                          <span className="font-semibold text-white">
                            „Continuă spre plată”
                          </span>
                          , formularul securizat Stripe va apărea aici.
                        </div>
                      ) : !stripePromise ? (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                          Lipsește cheia Stripe publishable din frontend.
                        </div>
                      ) : (
                        <div id="stripe-payment-box" className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                          <div className="mb-2 text-sm font-medium text-white">
                            Formularul de plată este pregătit.
                          </div>
                          <p className="mb-4 text-sm text-slate-300">
                            Dacă modifici datele de livrare sau metoda de plată,
                            formularul Stripe se va reseta și va trebui generat
                            din nou.
                          </p>

                          <Elements
                            stripe={stripePromise}
                            options={{
                              clientSecret,
                              appearance: {
                                theme: "night",
                              },
                            }}
                          >
                            <StripeCardPaymentBox
                              setErrorMsg={setErrorMsg}
                              onPaymentSucceeded={async () => {
                                try {
                                  await finalizePaidOrder();
                                } catch (e) {
                                  throw new Error(
                                    e?.response?.data?.error ||
                                      e?.message ||
                                      "Plata a reușit, dar finalizarea comenzii a eșuat."
                                  );
                                }
                              }}
                            />
                          </Elements>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="sticky top-24 space-y-6"
                >
                  <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg shadow-cyan-500/10">
                    <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
                      <Package className="h-5 w-5 text-cyan-400" />
                      Sumar comandă
                    </h3>

                    <div className="mb-6 space-y-3">
                      {cartItems.map((it) => (
                        <div
                          key={it.productId}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span className="text-slate-400">
                            {it.name}{" "}
                            <span className="text-slate-500">
                              × {it.quantity}
                            </span>
                          </span>
                          <span className="whitespace-nowrap font-medium text-white">
                            {formatRon(it.unitPriceRon * it.quantity)} RON
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4 rounded-xl border border-slate-700/70 bg-slate-800/50 p-3 text-xs text-slate-300">
                      <div className="mb-1 font-medium text-white">
                        Metodă selectată
                      </div>
                      <div>
                        {shippingMethodApi === "EASYBOX"
                          ? "EasyBox"
                          : shippingMethodApi === "COURIER_EXPRESS"
                          ? "Curier Express"
                          : "Curier Standard"}
                      </div>
                    </div>

                    {breakdown && paymentMethodApi === "CARD" && (
                      <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-slate-300">
                        <div className="mb-1 font-medium text-white">
                          Total confirmat pentru plată
                        </div>
                        <div>{formatRon(breakdown.totalRon)} RON</div>
                      </div>
                    )}

                    <div className="space-y-3 border-t border-slate-700 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="font-medium text-white">
                          {formatRon(subtotal)} RON
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">TVA (21%)</span>
                        <span className="font-medium text-white">
                          {formatRon(vatRon)} RON
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Transport</span>
                        <span
                          className={`font-medium ${
                            shippingFeeRon === 0 ? "text-green-400" : "text-white"
                          }`}
                        >
                          {shippingFeeRon === 0
                            ? "GRATUIT"
                            : `${formatRon(shippingFeeRon)} RON`}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Taxă plată</span>
                        <span className="font-medium text-white">
                          {formatRon(paymentFeeRon)} RON
                        </span>
                      </div>

                      <div className="border-t border-slate-700 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg text-white">Total</span>
                          <div className="text-right">
                            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                              {formatRon(total)}
                            </div>
                            <div className="text-xs text-slate-400">RON</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isProcessing || (paymentMethodApi === "CARD" && !!clientSecret)
                      }
                      className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                          />
                          Procesare...
                        </>
                      ) : paymentMethodApi === "CARD" ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {clientSecret
                            ? "Completează plata mai jos"
                            : "Continuă spre plată"}
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Plasează comanda
                        </>
                      )}
                    </Button>

                    <p className="mt-3 text-center text-xs text-slate-500">
                      Plata este securizată prin SSL
                    </p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-white">
                          Garanție extinsă
                        </h4>
                        <p className="text-xs text-slate-400">
                          2-3 ani pentru toate componentele
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <Truck className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-white">
                          Livrare rapidă
                        </h4>
                        <p className="text-xs text-slate-400">
                          Standard, Express sau EasyBox
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <ShieldCheck className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-white">
                          Protecție cumpărător
                        </h4>
                        <p className="text-xs text-slate-400">
                          14 zile drept de retur
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}