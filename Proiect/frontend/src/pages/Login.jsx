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
  Chrome,
  Github,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { refreshAuth } = useAuth();

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
      navigate("/");
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
      await api.post("/auth/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });

      await refreshAuth();

      setSuccessMsg("Cont creat cu succes! Ești autentificat.");
      navigate("/");
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
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
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
      {/* Background glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          {/* Logo + subtitle */}
          <div className="mb-8 text-center">
            <Link to="/" className="mb-4 inline-flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-lg bg-cyan-500/20 blur-xl" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                ConfigEXP
              </h1>
            </Link>
            <p className="text-lg text-slate-400">
              Configurează PC-ul perfect pentru tine
            </p>
          </div>

          {/* Main card */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
            <div className="grid md:grid-cols-2">
              {/* LEFT: Form */}
              <div className="p-8 md:p-10">
                {/* Tabs custom */}
                <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-700/50 bg-slate-800/50 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeTab === "login"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
                        : "text-slate-300 hover:text-cyan-300"
                    }`}
                  >
                    Conectare
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeTab === "register"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
                        : "text-slate-300 hover:text-cyan-300"
                    }`}
                  >
                    Înregistrare
                  </button>
                </div>

                {/* Alerts */}
                {errorMsg && (
                  <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                    {successMsg}
                  </div>
                )}

                {/* LOGIN */}
                {activeTab === "login" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-white">
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
                            placeholder="alex@example.com"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
                            placeholder="••••••••"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                password: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-400">
                          <input
                            type="checkbox"
                            className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                          />
                          Ține-mă minte
                        </label>
                        <button
                          type="button"
                          className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          Ai uitat parola?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-70"
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

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                      >
                        <Chrome className="h-5 w-5" />
                        Google
                      </button>

                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                      >
                        <Github className="h-5 w-5" />
                        GitHub
                      </button>
                    </div>
                  </div>
                )}

                {/* REGISTER */}
                {activeTab === "register" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-white">
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
                            placeholder="Alex Ionescu"
                            value={registerForm.name}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
                            placeholder="alex@example.com"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
                            placeholder="••••••••"
                            value={registerForm.password}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                password: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowRegisterPassword((v) => !v)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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

                      <label className="flex items-start gap-2 text-sm text-slate-400">
                        <input
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
                        <span>
                          Sunt de acord cu{" "}
                          <button
                            type="button"
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            Termenii și Condițiile
                          </button>{" "}
                          și{" "}
                          <button
                            type="button"
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            Politica de Confidențialitate
                          </button>
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-70"
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

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                      >
                        <Chrome className="h-5 w-5" />
                        Google
                      </button>

                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                      >
                        <Github className="h-5 w-5" />
                        GitHub
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Why ConfigEXP */}
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-8 md:p-10">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative space-y-8">
                  <div>
                    <h3 className="mb-2 text-2xl font-bold text-white">
                      De ce ConfigEXP?
                    </h3>
                    <p className="text-slate-400">
                      Platforma ta completă pentru configurarea PC-ului perfect
                    </p>
                  </div>

                  <div className="space-y-6">
                    {featureItems.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.08 }}
                          className="flex gap-4"
                        >
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${feature.iconBg}`}
                          >
                            <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                          </div>
                          <div>
                            <h4 className="mb-1 font-semibold text-white">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-slate-400">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-8">
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
              {/* end right */}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}