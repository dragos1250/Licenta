import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Shield,
  KeyRound,
  XCircle,
} from "lucide-react";
import api from "../lib/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const getApiErrorMessage = (error) => {
    if (error?.response?.data?.details?.length) {
      return error.response.data.details[0].message;
    }

    return error?.response?.data?.error || "A apărut o eroare.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) {
      setErrorMsg("Link-ul de resetare este invalid sau lipsește tokenul.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setErrorMsg("Parolele nu coincid.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
      });

      setSuccessMsg(
        data?.message || "Parola a fost resetată cu succes. Te poți autentifica acum."
      );
      setIsSubmitted(true);
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const featureItems = [
    {
      title: "Parolă securizată",
      description:
        "Alege o parolă puternică, cu minim 8 caractere, o literă mare și un număr.",
    },
    {
      title: "Link temporar",
      description:
        "Link-ul de resetare este valabil pentru o perioadă limitată și poate fi folosit o singură dată.",
    },
    {
      title: "Acces rapid",
      description:
        "După resetare, te poți întoarce imediat la autentificare și îți poți accesa contul.",
    },
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
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
            <p className="text-lg text-slate-400">Setează o parolă nouă</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-10">
                {!isSubmitted ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-white">
                        Resetează parola
                      </h2>
                      <p className="text-sm text-slate-400">
                        Introdu parola nouă pentru contul tău.
                      </p>
                    </div>

                    {!token && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        Link-ul de resetare este invalid sau lipsește tokenul.
                      </div>
                    )}

                    {errorMsg && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {errorMsg}
                      </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">
                          Parolă nouă
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={form.newPassword}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
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
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
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

                      <button
                        type="submit"
                        disabled={loading || !token}
                        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? "Se actualizează..." : "Salvează parola nouă"}
                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                      </button>
                    </form>

                    <div className="text-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Înapoi la autentificare
                      </Link>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6 text-center"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 ring-2 ring-green-500/30">
                      <CheckCircle2 className="h-10 w-10 text-green-400" />
                    </div>

                    <div>
                      <h2 className="mb-2 text-3xl font-bold text-white">
                        Parolă actualizată
                      </h2>
                      <p className="text-slate-400">
                        {successMsg}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Link to="/login" className="block">
                        <button
                          type="button"
                          className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
                        >
                          Mergi la autentificare
                        </button>
                      </Link>

                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 font-semibold text-slate-200 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300"
                      >
                        Mergi pe site
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-8 md:p-10">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative space-y-8">
                  <div>
                    <h3 className="mb-2 text-2xl font-bold text-white">
                      Resetare în siguranță
                    </h3>
                    <p className="text-slate-400">
                      Creează o parolă nouă și recapătă accesul la contul tău.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {featureItems.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + index * 0.08 }}
                        className="flex gap-4"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30">
                          <Shield className="h-6 w-6 text-cyan-300" />
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
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm">
                    <div className="mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
                      Recomandare
                    </div>
                    <div className="text-sm text-slate-400">
                      Nu refolosi parole vechi și evită parole ușor de ghicit.
                    </div>
                  </div>

                  {!isSubmitted && (
                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                      <div className="flex gap-3">
                        <Shield className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                        <div>
                          <h4 className="mb-1 text-sm font-semibold text-white">
                            Link securizat
                          </h4>
                          <p className="text-xs text-slate-400">
                            Link-ul de resetare este valabil o singură dată și expiră automat.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {errorMsg && !isSubmitted && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                      <div className="flex gap-3">
                        <XCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                        <div>
                          <h4 className="mb-1 text-sm font-semibold text-white">
                            Problemă la resetare
                          </h4>
                          <p className="text-xs text-slate-300">
                            Dacă link-ul a expirat, solicită unul nou din pagina
                            „Ai uitat parola?”.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}