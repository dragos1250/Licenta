import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Wrench,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  Cpu,
  HardDrive,
  MonitorCheck,
} from "lucide-react";

export default function Home() {

return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pb-20 pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">
                Configurează PC-ul perfect pentru tine
              </span>
            </motion.div>

            <h1 className="mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-6xl font-bold leading-tight tracking-tight text-transparent">
              Construiește-ți sistemul
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text">
                de vis
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400">
              Platformă premium de configurare PC cu asistență AI inteligentă.
              Alege componentele perfecte, verifică compatibilitatea și comandă
              totul dintr-un singur loc.
            </p>
          </motion.div>

          {/* Main Feature Cards - The Two Primary Options */}
          <div className="mb-20 grid gap-8 md:grid-cols-2">
            {/* Manual Configuration Card */}
            <Link to="/configurator" className="group">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative h-full overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-8 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                {/* Icon */}
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30 transition-all duration-500 group-hover:scale-110 group-hover:ring-cyan-400/50">
                  <Wrench className="h-8 w-8 text-cyan-400" />
                </div>

                {/* Content */}
                <h2 className="mb-3 text-3xl font-bold text-white">
                  Configurează-ți singur
                  <br />
                  propriul PC
                </h2>
                <p className="mb-6 leading-relaxed text-slate-400">
                  Control complet asupra fiecărei componente. Alege din mii de
                  produse, compară specificații și construiește exact ce-ți
                  dorești.
                </p>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10">
                      <Zap className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    Verificare compatibilitate în timp real
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10">
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    Optimizare buget și performanță
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10">
                      <Shield className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    Garanție extinsă și suport premium
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="flex items-center gap-2 text-cyan-400 transition-all group-hover:gap-3">
                  <span className="font-semibold">Începe configurarea</span>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Corner Accent */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              </motion.div>
            </Link>

            {/* AI Configuration Card */}
            <Link to="/ai-configurator" className="group">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative h-full overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-purple-950/30 via-slate-900/90 to-slate-800/90 p-8 backdrop-blur-xl transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                </div>

                {/* Icon with Pulse Animation */}
                <div className="relative mb-6 inline-flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 opacity-75" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 ring-1 ring-purple-500/30 transition-all duration-500 group-hover:scale-110 group-hover:ring-purple-400/50">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                  </div>
                </div>

                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 px-3 py-1 ring-1 ring-purple-500/20">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-purple-300">
                    Powered by AI
                  </span>
                </div>

                {/* Content */}
                <h2 className="mb-3 text-3xl font-bold text-white">
                  AI ConfigEXP
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Configurare inteligentă
                  </span>
                </h2>
                <p className="mb-6 leading-relaxed text-slate-400">
                  Lasă inteligența artificială să îți creeze configurația
                  perfectă. Răspunde la câteva întrebări și primești recomandări
                  personalizate instant.
                </p>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    Recomandări bazate pe AI și machine learning
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10">
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    Configurații optimizate pentru utilizarea ta
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10">
                      <Award className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    Best price-to-performance ratio garantat
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent transition-all group-hover:gap-3">
                  <span className="font-semibold">Începe cu AI</span>
                  <ChevronRight className="h-5 w-5 text-purple-400 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Corner Accent */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              </motion.div>
            </Link>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-20 grid gap-6 md:grid-cols-3"
          >
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-center backdrop-blur-sm">
              <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                15,000+
              </div>
              <div className="text-sm text-slate-400">Produse disponibile</div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-center backdrop-blur-sm">
              <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                50,000+
              </div>
              <div className="text-sm text-slate-400">Configurații create</div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-center backdrop-blur-sm">
              <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-sm text-slate-400">Clienți mulțumiți</div>
            </div>
          </motion.div>

          {/* Popular Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="mb-8 text-center text-3xl font-bold text-white">
              Categorii populare
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                to="/components/cpu"
                className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 transition-all group-hover:scale-110 group-hover:bg-cyan-500/20">
                  <Cpu className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">Procesoare</h3>
                <p className="text-sm text-slate-400">
                  Intel & AMD cele mai noi generații
                </p>
              </Link>

              <Link
                to="/components/gpu"
                className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 transition-all group-hover:scale-110 group-hover:bg-cyan-500/20">
                  <MonitorCheck className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">Plăci video</h3>
                <p className="text-sm text-slate-400">
                  NVIDIA & AMD pentru gaming și productivitate
                </p>
              </Link>

              <Link
                to="/components/storage"
                className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 transition-all group-hover:scale-110 group-hover:bg-cyan-500/20">
                  <HardDrive className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">Stocare</h3>
                <p className="text-sm text-slate-400">
                  SSD NVMe ultra-rapide și HDD de capacitate
                </p>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );

}