import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Check,
  Shield,
  Lock,
} from "lucide-react";
import api from "../lib/api";
import Seo from "../components/Seo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", {
        email,
      });

      setSuccessMsg(
        data?.message ||
          "Dacă există un cont asociat acestui email, vei primi instrucțiuni pentru resetarea parolei."
      );
      setIsSubmitted(true);
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <>
      <Seo
        title="Recuperare parolă"
        description="Primește un link de resetare pentru parola contului tău ConfigEXP."
        noIndex
      />

      <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-3">
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
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
            {!isSubmitted ? (
              <div className="p-8 md:p-12">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-2 ring-cyan-500/30">
                    <Lock className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h2 className="mb-2 text-3xl font-bold text-white">
                    Ai uitat parola?
                  </h2>
                  <p className="text-slate-400">
                    Nicio problemă. Introdu adresa de email și îți trimitem
                    instrucțiuni pentru resetarea parolei.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">
                      Adresa de email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Introdu adresa de email asociată contului tău
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Se trimite..." : "Trimite link de resetare"}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Înapoi la autentificare
                  </Link>
                </div>

                <div className="mt-8 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-white">
                        Securitatea contului tău
                      </h4>
                      <p className="text-xs text-slate-400">
                        Din motive de securitate, afișăm același mesaj indiferent
                        dacă adresa este sau nu înregistrată în sistem. Link-ul
                        de resetare este valabil 1 oră.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 ring-2 ring-green-500/30">
                    <Check className="h-10 w-10 text-green-400" />
                  </div>

                  <h2 className="mb-2 text-3xl font-bold text-white">
                    Verifică-ți emailul
                  </h2>
                  <p className="mb-3 text-slate-400">
                    {successMsg ||
                      "Dacă există un cont asociat acestei adrese, vei primi instrucțiuni pentru resetarea parolei."}
                  </p>
                  <p className="mb-8 text-slate-500">
                    Adresa introdusă:{" "}
                    <span className="font-medium text-cyan-400">{email}</span>
                  </p>

                  <div className="mb-8 space-y-4 text-left">
                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                          1
                        </div>
                        <h4 className="text-sm font-semibold text-white">
                          Verifică inbox-ul
                        </h4>
                      </div>
                      <p className="text-sm text-slate-400">
                        Caută un email de la ConfigEXP. Verifică și folderul Spam
                        sau Promotions dacă nu îl găsești.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                          2
                        </div>
                        <h4 className="text-sm font-semibold text-white">
                          Apasă pe link
                        </h4>
                      </div>
                      <p className="text-sm text-slate-400">
                        Deschide emailul și apasă pe link-ul de resetare a
                        parolei.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                          3
                        </div>
                        <h4 className="text-sm font-semibold text-white">
                          Creează parola nouă
                        </h4>
                      </div>
                      <p className="text-sm text-slate-400">
                        Alege o parolă nouă și sigură pentru contul tău.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link to="/login" className="block">
                      <button
                        type="button"
                        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50"
                      >
                        Înapoi la autentificare
                      </button>
                    </Link>

                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="w-full text-sm text-slate-400 transition-colors hover:text-cyan-400"
                    >
                      Nu ai primit emailul? Încearcă din nou
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Ai nevoie de ajutor?{" "}
              <button
                type="button"
                className="text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Contactează suportul
              </button>
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
}