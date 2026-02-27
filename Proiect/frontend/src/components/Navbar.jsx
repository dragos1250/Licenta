import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  User,
  Cpu,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, isAuthLoading, logout } = useAuth();

  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // navbar in 2 dimensiuni pentru măsurat cât ocupă fiecare variantă (normal vs compact)
  const navMeasureNormalRef = useRef(null);
  const navMeasureCompactRef = useRef(null);

  const [navMode, setNavMode] = useState("normal"); // normal | compact | mobile
  const [centerOffset, setCenterOffset] = useState(0); // px
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const navLinkClass = (path, compact = false) =>
    `relative px-1 py-2 ${compact ? "text-xs" : "text-sm"} font-medium transition-colors ${
      isActive(path) ? "text-cyan-400" : "text-slate-300 hover:text-cyan-300"
    }`;

  const computePlacement = (navWidth) => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const leftWidth = leftRef.current?.offsetWidth || 0;
    const rightWidth = rightRef.current?.offsetWidth || 0;

    // spațiu de siguranță între nav și blocurile laterale
    const sideGap = 12;

    if (!containerWidth || !navWidth) {
      return { fits: false, offset: 0 };
    }

    const idealCenterX = containerWidth / 2;

    // Centrul meniului trebuie să rămână între aceste limite pentru a nu se lovi cu blocurile laterale
    const minCenterX = leftWidth + sideGap + navWidth / 2;
    const maxCenterX = containerWidth - rightWidth - sideGap - navWidth / 2;

    if (minCenterX > maxCenterX) {
      return { fits: false, offset: 0 };
    }

    // stă centrat până când "lovește" una din părți
    const placedCenterX = Math.min(Math.max(idealCenterX, minCenterX), maxCenterX);
    const offset = placedCenterX - idealCenterX;

    return { fits: true, offset };
  };

  const recalcNavbar = () => {
    const normalWidth = navMeasureNormalRef.current?.scrollWidth || 0;
    const compactWidth = navMeasureCompactRef.current?.scrollWidth || 0;

    // 1) încearcă normal
    const normalPlacement = computePlacement(normalWidth);
    if (normalPlacement.fits) {
      setNavMode("normal");
      setCenterOffset(normalPlacement.offset);
      return;
    }

    // 2) încearcă compact
    const compactPlacement = computePlacement(compactWidth);
    if (compactPlacement.fits) {
      setNavMode("compact");
      setCenterOffset(compactPlacement.offset);
      return;
    }

    // 3) fallback hamburger
    setNavMode("mobile");
    setCenterOffset(0);
    setMobileOpen(false);
  };

  useEffect(() => {
    recalcNavbar();

    const observer = new ResizeObserver(() => {
      recalcNavbar();
    });

    if (containerRef.current) observer.observe(containerRef.current);
    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);

    window.addEventListener("resize", recalcNavbar);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recalcNavbar);
    };
    // recalcularea in momentul in care se schimbă numele userului / auth
  }, [user?.name, isAuthenticated, isAuthLoading]);

  // închidem dropdown-ul la schimbarea paginii
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  const compact = navMode === "compact";

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        {/* Măsurători ascunse pentru nav */}
        <div className="pointer-events-none absolute -left-[9999px] -top-[9999px] opacity-0">
          <div
            ref={navMeasureNormalRef}
            className="flex items-center gap-8 whitespace-nowrap"
          >
            <span className="text-sm font-medium">Acasă</span>
            <span className="text-sm font-medium">Configurator</span>
            <span className="text-sm font-medium">Componente</span>
          </div>

          <div
            ref={navMeasureCompactRef}
            className="mt-2 flex items-center gap-4 whitespace-nowrap"
          >
            <span className="text-xs font-medium">Acasă</span>
            <span className="text-xs font-medium">Configurator</span>
            <span className="text-xs font-medium">Componente</span>
          </div>
        </div>

        {/* Row principal */}
        <div ref={containerRef} className="relative flex items-center justify-between gap-3">
          {/* Stânga: Logo */}
          <div ref={leftRef} className="min-w-0">
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 animate-pulse rounded-lg bg-cyan-500/20 blur-xl" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="truncate bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
                  ConfigEXP
                </h1>
                <p className="hidden text-xs text-slate-400 sm:block">
                  PC Configuration Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Meniu centrat REAL (și mutat doar la coliziune) */}
          {navMode !== "mobile" && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2"
              style={{
                transform: `translate(calc(-50% + ${centerOffset}px), -50%)`,
              }}
            >
              <div
                className={`pointer-events-auto flex items-center whitespace-nowrap ${
                  compact ? "gap-4" : "gap-8"
                }`}
              >
                <Link to="/" className={navLinkClass("/", compact)}>
                  Acasă
                  {isActive("/") && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  )}
                </Link>

                <Link
                  to="/configurator"
                  className={navLinkClass("/configurator", compact)}
                >
                  Configurator
                  {isActive("/configurator") && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  )}
                </Link>

                <Link
                  to="/components"
                  className={navLinkClass("/components", compact)}
                >
                  Componente
                  {isActive("/components") && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* Dreapta: actions */}
          <div ref={rightRef} className="flex items-center justify-end gap-1 sm:gap-2">
            <Link
              to="/wishlist"
              className="group relative rounded-lg p-2 transition-all hover:bg-slate-800/50"
            >
              <Heart className="h-5 w-5 text-slate-400 transition-colors group-hover:text-cyan-400" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                3
              </span>
            </Link>

            <Link
              to="/cart"
              className="group relative rounded-lg p-2 transition-all hover:bg-slate-800/50"
            >
              <ShoppingCart className="h-5 w-5 text-slate-400 transition-colors group-hover:text-cyan-400" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                2
              </span>
            </Link>

            {isAuthLoading ? (
              <div className="ml-1 rounded-md border border-slate-700/50 px-2 py-2 text-xs text-slate-400 sm:px-3 sm:text-sm">
                ...
              </div>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="hidden items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-300 transition hover:bg-slate-800/50 hover:text-cyan-400 sm:inline-flex sm:px-3"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span className="max-w-[110px] truncate lg:max-w-[170px]">
                    {user?.name || "Cont"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-2 py-2 text-sm text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 sm:px-3"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40 sm:px-4"
              >
                <span className="hidden sm:inline">Conectare</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}

            {/* Hamburger doar când nu încape nav */}
            {navMode === "mobile" && (
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="ml-1 inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 p-2 text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800/70 hover:text-cyan-300"
                aria-label="Meniu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dropdown hamburger */}
        {navMode === "mobile" && mobileOpen && (
          <div className="mt-3 rounded-xl border border-slate-700/60 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
            <Link
              to="/"
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                isActive("/")
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-300"
              }`}
            >
              Acasă
            </Link>

            <Link
              to="/configurator"
              className={`mt-1 block rounded-lg px-3 py-2 text-sm transition ${
                isActive("/configurator")
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-300"
              }`}
            >
              Configurator
            </Link>

            <Link
              to="/components"
              className={`mt-1 block rounded-lg px-3 py-2 text-sm transition ${
                isActive("/components")
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-300"
              }`}
            >
              Componente
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}