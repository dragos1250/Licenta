import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  MailCheck,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Mail,
  ShieldCheck,
} from "lucide-react";
import api from "../lib/api";
import Seo from "../components/Seo";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const initialEmail = useMemo(
    () => searchParams.get("email") || "",
    [searchParams]
  );

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Se verifică adresa de email...");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("");
      setErrorMsg("Link-ul de verificare este invalid sau lipsește tokenul.");
      return;
    }

    const verifyEmail = async () => {
      try {
        setStatus("loading");
        setMessage("Se verifică adresa de email...");

        const { data } = await api.get("/auth/verify-email", {
          params: { token },
        });

        setStatus("success");
        setMessage(data?.message || "Cont confirmat cu succes.");
      } catch (error) {
        setStatus("error");
        setMessage("");
        setErrorMsg(
          error?.response?.data?.error ||
            "Link invalid, expirat sau deja folosit. Poți retrimite emailul de confirmare."
        );
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendSuccess("");

    if (!resendEmail.trim()) {
      setErrorMsg("Introdu adresa de email pentru a retrimite confirmarea.");
      return;
    }

    try {
      setResending(true);

      const { data } = await api.post("/auth/resend-verification", {
        email: resendEmail.trim(),
      });

      setResendSuccess(
        data?.message || "Emailul de confirmare a fost retrimis."
      );
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.error ||
          "Nu am putut retrimite emailul de confirmare."
      );
    } finally {
      setResending(false);
    }
  };

  const featureItems = [
    {
      icon: ShieldCheck,
      title: "Cont mai sigur",
      description:
        "Confirmarea emailului protejează contul și reduce riscul de acces neautorizat.",
      iconBg: "from-purple-500/30 to-cyan-500/30",
      iconColor: "text-cyan-300",
    },
    {
      icon: MailCheck,
      title: "Activare completă",
      description:
        "După confirmare poți folosi toate funcționalitățile platformei fără restricții.",
      iconBg: "from-cyan-500/30 to-blue-500/30",
      iconColor: "text-cyan-300",
    },
    {
      icon: RefreshCw,
      title: "Recuperare mai ușoară",
      description:
        "Emailul verificat ajută ulterior la resetarea parolei și la notificări importante.",
      iconBg: "from-blue-500/30 to-purple-500/30",
      iconColor: "text-cyan-300",
    },
  ];

  return (
    <>
      <Seo
        title="Verificare email"
        description="Verifică adresa de email pentru contul tău ConfigEXP."
        noIndex
      />

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
            <p className="text-lg text-slate-400">Confirmarea contului tău</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-10">
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-white">
                      Verificare email
                    </h2>
                    <p className="text-sm text-slate-400">
                      Confirmăm adresa ta de email pentru a activa contul.
                    </p>
                  </div>

                  {status === "loading" && (
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <LoaderCircle className="mt-0.5 h-5 w-5 animate-spin text-cyan-400" />
                        <div>
                          <p className="font-medium text-cyan-300">{message}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            Te rugăm să aștepți câteva secunde.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === "success" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                          <div>
                            <p className="font-medium text-emerald-300">
                              {message}
                            </p>
                            <p className="mt-1 text-sm text-slate-300">
                              Contul a fost activat cu succes și ești gata să
                              continui.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid w-full gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => navigate("/")}
                          className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
                        >
                          Mergi pe site
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/login")}
                          className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300"
                        >
                          Mergi la autentificare
                        </button>
                      </div>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="mt-0.5 h-4 w-4 text-red-400" />
                          <div>
                            <p className="font-medium text-red-300">
                              Verificarea nu a reușit
                            </p>
                            <p className="mt-1 text-sm text-slate-300">
                              {errorMsg}
                            </p>
                          </div>
                        </div>
                      </div>

                      {resendSuccess && (
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                          {resendSuccess}
                        </div>
                      )}

                      <form className="space-y-3" onSubmit={handleResend}>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-400">
                            Retrimite emailul de confirmare
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                              type="email"
                              placeholder="alex@example.com"
                              value={resendEmail}
                              onChange={(e) => setResendEmail(e.target.value)}
                              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-11 pr-4 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={resending}
                          className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {resending ? "Se retrimite..." : "Retrimite emailul"}
                          {!resending && <RefreshCw className="ml-2 h-4 w-4" />}
                        </button>
                      </form>

                      <div className="grid w-full gap-3 sm:grid-cols-2">
                        <Link
                          to="/login"
                          className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
                        >
                          Înapoi la autentificare
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => navigate("/")}
                          className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300"
                        >
                          Mergi pe site
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-8 md:p-10">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative space-y-8">
                  <div>
                    <h3 className="mb-2 text-2xl font-bold text-white">
                      De ce confirmarea emailului?
                    </h3>
                    <p className="text-slate-400">
                      Un pas simplu care face contul mai sigur și mai ușor de
                      recuperat ulterior.
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

                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 backdrop-blur-sm">
                    <div className="mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
                      Siguranță + control
                    </div>
                    <div className="text-sm text-slate-400">
                      Confirmarea emailului ajută și la viitoarele fluxuri de
                      recuperare a parolei și notificări importante.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
}