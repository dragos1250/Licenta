import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  User,
  Bot,
  Loader2,
  RotateCcw,
  AlertCircle,
  Cpu,
  PackageSearch,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const AI_CONVERSATION_STORAGE_KEY = "configexp_ai_chat_only_v1";

const WELCOME_MESSAGE =
  "Bună! Sunt AI ConfigEXP, asistentul tău pentru recomandări PC. 🎯\n\nÎți pot explica ce componente s-ar potrivi pentru bugetul, jocurile sau use case-ul tău. Recomandările sunt orientative, iar selecția finală o faci manual în Configurator sau în pagina Componente.\n\nExemple:\n\n• Vreau un PC de gaming în 5000 RON pentru CS2 și Fortnite\n• Vreau un build pentru editare video 4K în 9000 RON\n• Ce placă video îmi recomanzi pentru Metro Exodus?\n• Vreau monitor 1440p pentru gaming";

function Button({
  variant = "solid",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const variants = {
    solid:
      "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40",
    outline:
      "border border-slate-600 bg-transparent text-slate-300 hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-400",
    ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
  };

  return (
    <button
      type="button"
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function cleanAiText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*-\s*/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getErrorMessage(error) {
  const apiMessage =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message;

  if (apiMessage) return apiMessage;

  return "A apărut o eroare neașteptată.";
}

function createAssistantMessage(result) {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: String(result?.reply || "Nu am primit un răspuns util de la AI.")
      .replace(/\r\n/g, "\n")
      .trim(),
    timestamp: new Date(),
  };
}

function createAssistantErrorMessage(message) {
  return {
    id: `assistant-error-${Date.now()}`,
    role: "assistant",
    content: message,
    timestamp: new Date(),
    isError: true,
  };
}

function loadStoredMessages() {
  try {
    const raw = localStorage.getItem(AI_CONVERSATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    return parsed.map((message) => ({
      ...message,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
    }));
  } catch {
    return null;
  }
}

function getRecentMessages(messages) {
  return messages
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 1200),
    }))
    .filter((message) => message.role && message.content);
}

export function AIConfiguratorPage() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [messages, setMessages] = useState(() => {
    return (
      loadStoredMessages() || [
        {
          id: "welcome",
          role: "assistant",
          content: WELCOME_MESSAGE,
          timestamp: new Date(),
        },
      ]
    );
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const messagesEndRef = useRef(null);

  const canSend = useMemo(() => {
    if (isAuthLoading) return false;
    if (!isAuthenticated) return false;
    if (isTyping) return false;
    if (!inputMessage.trim()) return false;
    if (usage && Number(usage.remaining || 0) <= 0) return false;

    return true;
  }, [inputMessage, isAuthLoading, isAuthenticated, isTyping, usage]);

  useEffect(() => {
    try {
      localStorage.setItem(
        AI_CONVERSATION_STORAGE_KEY,
        JSON.stringify(messages)
      );
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) return;

    fetchUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, isAuthenticated]);

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  const scrollToBottom = (behavior = "smooth") => {
    window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });
    }, 80);
  };

  const fetchUsage = async () => {
    setUsageLoading(true);

    try {
      const res = await api.get("/ai/usage");
      setUsage(res.data || null);
    } catch {
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const cleanMessage = inputMessage.trim();
    if (!cleanMessage || isTyping) return;

    if (isAuthLoading) return;

    if (!isAuthenticated) {
      setGlobalError("Trebuie să fii autentificat ca să folosești asistentul AI.");
      return;
    }

    if (usage && Number(usage.remaining || 0) <= 0) {
      setGlobalError(`Ai atins limita zilnică de ${usage.limit} cereri AI.`);
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: cleanMessage,
      timestamp: new Date(),
    };

    const messagesBeforeSend = messages;

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setGlobalError("");
    setIsTyping(true);
    scrollToBottom();

    try {
      const recentMessages = getRecentMessages(messagesBeforeSend);

      const res = await api.post("/ai/build-assistant", {
        message: cleanMessage,
        context: {
          recentMessages,
        },
      });

      setUsage(res.data?.usage || null);
      setMessages((prev) => [
        ...prev,
        createAssistantMessage(res.data?.result || {}),
      ]);
      scrollToBottom();
    } catch (error) {
      const status = error?.response?.status;
      const message =
        status === 401
          ? "Trebuie să fii autentificat ca să folosești asistentul AI."
          : getErrorMessage(error);

      setMessages((prev) => [...prev, createAssistantErrorMessage(message)]);
      scrollToBottom();

      if (status === 429) {
        await fetchUsage();
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    const nextMessages = [
      {
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGE,
        timestamp: new Date(),
      },
    ];

    setMessages(nextMessages);
    setInputMessage("");
    setGlobalError("");

    try {
      localStorage.setItem(
        AI_CONVERSATION_STORAGE_KEY,
        JSON.stringify(nextMessages)
      );
    } catch {
      // ignore storage errors
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  const usageLabel = usage
    ? `${usage.remaining}/${usage.limit} cereri rămase azi`
    : usageLoading
    ? "Se verifică limita..."
    : "Limită AI disponibilă după autentificare";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-lg bg-purple-500/20 blur-xl" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
                  AI ConfigEXP
                </h1>
                <p className="text-xs text-slate-500">
                  Asistentul tau personal pentru alegerea componentelor
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {usageLabel}
              </div>

              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Conversație nouă
              </Button>
            </div>
          </div>
        </div>
      </div>


      {globalError && (
        <div className="mx-auto mt-4 w-full max-w-4xl px-6">
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{globalError}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === "assistant" ? (
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse rounded-lg bg-purple-500/20 blur-lg" />
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                      <User className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                </div>

                <div
                  className={`min-w-0 flex-1 ${
                    message.role === "user" ? "flex flex-col items-end" : ""
                  }`}
                >
                  <div
                    className={`max-w-full rounded-2xl px-5 py-4 ${
                      message.role === "assistant"
                        ? message.isError
                          ? "border border-red-500/30 bg-red-500/10 text-red-100"
                          : "border border-slate-700/50 bg-slate-800/50 text-slate-100"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>

                  <div className="mt-1 px-1 text-xs text-slate-500">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-lg bg-purple-500/20 blur-lg" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span className="text-sm text-slate-400">
                    AI-ul formulează recomandarea...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              "Vreau un PC de gaming în 5000 RON pentru CS2",
              "Vreau build pentru editare video 4K în 9000 RON",
              "Ce placă video recomanzi pentru 1440p?",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/configurator"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <Cpu className="h-4 w-4" />
              Configurator
            </Link>

            <Link
              to="/components"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
            >
              <PackageSearch className="h-4 w-4" />
              Componente
            </Link>
          </div>

          <div className="flex items-end gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isAuthenticated
                  ? "Descrie ce PC sau componentă cauți..."
                  : "Autentifică-te pentru a folosi AI ConfigEXP"
              }
              rows={1}
              disabled={!isAuthenticated || isAuthLoading}
              className="min-h-[48px] max-h-[160px] flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <Button
              onClick={handleSendMessage}
              disabled={!canSend}
              className="h-12 w-12 flex-shrink-0 p-0"
              aria-label="Trimite mesaj"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          <p className="mt-2 text-center text-xs text-slate-500">
            Recomandările AI sunt orientative. Selectează manual produsele în Configurator sau Componente înainte de comandă.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIConfiguratorPage;
