import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Login() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    acceptedTerms: false,
  });

  useEffect(() => {
    setErrorMsg("");
    setSuccessMsg("");
  }, [activeTab]);

  const getApiErrorMessage = (error) => {
    if (error?.response?.data?.details?.length) {
      return error.response.data.details[0].message;
    }

    return error?.response?.data?.error || "A apărut o eroare.";
  };

  const getRedirectTo = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect") || "/";
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await api.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password,
      });

      await refreshAuth();

      setSuccessMsg("Autentificare reușită!");
      navigate(getRedirectTo());
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!registerForm.acceptedTerms) {
      setErrorMsg("Trebuie să accepți termenii și condițiile.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });

      setSuccessMsg(
        data?.message ||
          "Cont creat cu succes. Verifică emailul pentru activarea contului."
      );

      setLoginForm((prev) => ({
        ...prev,
        email: registerForm.email,
        password: "",
      }));

      setRegisterForm({
        name: "",
        email: "",
        password: "",
        acceptedTerms: false,
      });

      setActiveTab("login");
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (data) => {
    try {
      await refreshAuth();
    } catch (_) {}

    setErrorMsg("");
    setSuccessMsg(data?.message || "Autentificare cu Google reușită.");
    navigate(getRedirectTo());
  };

  const handleGoogleNeedsVerification = (data) => {
    setErrorMsg("");
    setSuccessMsg(
      data?.message ||
        "Contul a fost creat. Verifică emailul pentru activarea contului."
    );

    if (data?.user?.email) {
      setLoginForm((prev) => ({
        ...prev,
        email: data.user.email,
      }));
    }

    setActiveTab("login");
  };

  const handleGoogleError = (error) => {
    setErrorMsg(getApiErrorMessage(error));
    setSuccessMsg("");
  };

  const featureItems = [
    {
      icon: Sparkles,
      title: "AI Configurator",
      description:
        "Configurare inteligentă asistată de AI pentru rezultate optime",
      iconBg: "from-purple-500/30 to-cyan-500/30",
      iconColor: "text-cyan-300",
    },
    {
      icon: User,
      title: "Configurare Personalizată",
      description: "Control total asupra fiecărei componente din build-ul tău",
      iconBg: "from-cyan-500/30 to-blue-500/30",
      iconColor: "text-cyan-300",
    },
    {
      icon: ArrowRight,
      title: "Verificare Compatibilitate",
      description:
        "Sistem automat de verificare a compatibilității componentelor",
      iconBg: "from-blue-500/30 to-purple-500/30",
      iconColor: "text-cyan-300",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl sm:left-1/4 sm:top-1/4 sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl sm:bottom-1/4 sm:right-1/4 sm:h-96 sm:w-96" />
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="mb-6 text-center sm:mb-8">
            <Link
              to="/"
              className="mb-3 inline-flex items-center justify-center gap-3 sm:mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-xl bg-cyan-500/20 blur-xl" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 sm:h-12 sm:w-12">
                  <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
              </div>

              <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                ConfigEXP
              </h1>
            </Link>

            <p className="text-sm text-slate-400 sm:text-lg">
              Configurează PC-ul perfect pentru tine
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)]">
              <div className="min-w-0 p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="mb-5 grid grid-cols-2 rounded-xl border border-slate-700/50 bg-slate-800/50 p-1 sm:mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                      activeTab === "login"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10"
                        : "text-slate-300 hover:text-cyan-300"
                    }`}
                  >
                    Conectare
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                      activeTab === "register"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10"
                        : "text-slate-300 hover:text-cyan-300"
                    }`}
                  >
                    Înregistrare
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
                    {successMsg}
                  </div>
                )}

                {activeTab === "login" && (
                  <div className="space-y-5 sm:space-y-6">
                    <div>
                      <h2 className="mb-1 text-xl font-bold text-white sm:mb-2 sm:text-2xl">
                        Bine ai revenit!
                      </h2>
                      <p className="text-sm text-slate-400">
                        Conectează-te pentru a continua
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            autoComplete="email"
                            placeholder="alex@example.com"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Parolă
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                password: e.target.value,
                              })
                            }
                            className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-slate-700/60 hover:text-slate-300"
                            aria-label={
                              showPassword ? "Ascunde parola" : "Arată parola"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-400">
                          <input
                            type="checkbox"
                            className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                          />
                          <span>Ține-mă minte</span>
                        </label>

                        <Link
                          to="/forgot-password"
                          className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                        >
                          Ai uitat parola?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? "Se procesează..." : "Conectare"}
                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                      </button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-slate-900 px-2 text-slate-500">
                          Sau continuă cu
                        </span>
                      </div>
                    </div>

                    <center>
                      <div className="flex w-full justify-center overflow-hidden [&>*]:max-w-full">
                        <GoogleSignInButton
                          onSuccess={handleGoogleSuccess}
                          onNeedsVerification={handleGoogleNeedsVerification}
                          onError={handleGoogleError}
                        />
                      </div>
                    </center>
                  </div>
                )}

                {activeTab === "register" && (
                  <div className="space-y-5 sm:space-y-6">
                    <div>
                      <h2 className="mb-1 text-xl font-bold text-white sm:mb-2 sm:text-2xl">
                        Creează cont nou
                      </h2>
                      <p className="text-sm text-slate-400">
                        Începe configurarea PC-ului tău
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Nume complet
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            autoComplete="name"
                            placeholder="Alex Ionescu"
                            value={registerForm.name}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            autoComplete="email"
                            placeholder="alex@example.com"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Parolă
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={registerForm.password}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                password: e.target.value,
                              })
                            }
                            className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-slate-700/60 hover:text-slate-300"
                            aria-label={
                              showRegisterPassword
                                ? "Ascunde parola"
                                : "Arată parola"
                            }
                          >
                            {showRegisterPassword ? (
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

                      <div className="flex items-start gap-2 text-sm text-slate-400">
                        <input
                          id="acceptedTerms"
                          type="checkbox"
                          checked={registerForm.acceptedTerms}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              acceptedTerms: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                        />
                        <label
                          htmlFor="acceptedTerms"
                          className="min-w-0 leading-relaxed"
                        >
                          Sunt de acord cu{" "}
                          <Link
                            to="/info#terms"
                            className="font-medium text-cyan-400 hover:text-cyan-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Termenii și Condițiile
                          </Link>{" "}
                          și{" "}
                          <Link
                            to="/info#privacy"
                            className="font-medium text-cyan-400 hover:text-cyan-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Politica de Confidențialitate
                          </Link>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? "Se procesează..." : "Creează cont"}
                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                      </button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-slate-900 px-2 text-slate-500">
                          Sau înregistrează-te cu
                        </span>
                      </div>
                    </div>

                    <center>
                      <div className="flex w-full justify-center overflow-hidden [&>*]:max-w-full">
                        <GoogleSignInButton
                          onSuccess={handleGoogleSuccess}
                          onNeedsVerification={handleGoogleNeedsVerification}
                          onError={handleGoogleError}
                        />
                      </div>
                    </center>
                  </div>
                )}
              </div>

              <div className="relative min-w-0 overflow-hidden border-t border-slate-700/50 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-5 sm:p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative space-y-6 sm:space-y-8">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                      De ce ConfigEXP?
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
                      Platforma ta completă pentru configurarea PC-ului perfect
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    {featureItems.map((feature, index) => {
                      const Icon = feature.icon;

                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.08 }}
                          className="flex gap-3 sm:gap-4"
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${feature.iconBg} sm:h-12 sm:w-12`}
                          >
                            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="mb-1 font-semibold text-white">
                              {feature.title}
                            </h4>
                            <p className="text-sm leading-relaxed text-slate-400">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 sm:gap-4 sm:pt-4">
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
                        50,000+
                      </div>
                      <div className="text-sm text-slate-400">
                        Configurații create
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
                        98%
                      </div>
                      <div className="text-sm text-slate-400">
                        Clienți mulțumiți
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
