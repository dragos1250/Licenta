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
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const GUEST_CART_KEY = "configexp_guest_cart_v1";
const GUEST_WISHLIST_KEY = "configexp_guest_wishlist_v1";

function getGuestCartCount() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const items = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(items)) return 0;

    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  } catch {
    return 0;
  }
}

function getGuestWishlistCount() {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    const items = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(items)) return 0;

    return items.length;
  } catch {
    return 0;
  }
}

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, isAuthLoading, logout } = useAuth();

  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const navMeasureNormalRef = useRef(null);
  const navMeasureCompactRef = useRef(null);

  const [navMode, setNavMode] = useState("normal");
  const [centerOffset, setCenterOffset] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navLinkClass = (path, compact = false) =>
    `relative px-1 py-2 ${
      compact ? "text-xs" : "text-sm"
    } font-medium transition-colors ${
      isActive(path) ? "text-cyan-400" : "text-slate-300 hover:text-cyan-300"
    }`;

  const aiLinkClass = (compact = false) =>
    `relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 ${
      compact ? "text-xs" : "text-sm"
    } font-semibold transition-all ${
      isActive("/ai-configurator")
        ? "border-purple-400/60 bg-purple-500/20 text-purple-200 shadow-lg shadow-purple-500/15"
        : "border-purple-500/40 bg-purple-500/10 text-purple-200 hover:border-purple-400/70 hover:bg-purple-500/20"
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
      isActive(path)
        ? "bg-cyan-500/10 text-cyan-400"
        : "text-slate-300 hover:bg-slate-800/70 hover:text-cyan-300"
    }`;

  const computePlacement = (navWidth) => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const leftWidth = leftRef.current?.offsetWidth || 0;
    const rightWidth = rightRef.current?.offsetWidth || 0;
    const sideGap = 12;

    if (!containerWidth || !navWidth) return { fits: false, offset: 0 };

    const idealCenterX = containerWidth / 2;
    const minCenterX = leftWidth + sideGap + navWidth / 2;
    const maxCenterX = containerWidth - rightWidth - sideGap - navWidth / 2;

    if (minCenterX > maxCenterX) return { fits: false, offset: 0 };

    const placedCenterX = Math.min(Math.max(idealCenterX, minCenterX), maxCenterX);

    return {
      fits: true,
      offset: placedCenterX - idealCenterX,
    };
  };

  const recalcNavbar = () => {
    const normalWidth = navMeasureNormalRef.current?.scrollWidth || 0;
    const compactWidth = navMeasureCompactRef.current?.scrollWidth || 0;

    const normalPlacement = computePlacement(normalWidth);
    if (normalPlacement.fits) {
      setNavMode("normal");
      setCenterOffset(normalPlacement.offset);
      return;
    }

    const compactPlacement = computePlacement(compactWidth);
    if (compactPlacement.fits) {
      setNavMode("compact");
      setCenterOffset(compactPlacement.offset);
      return;
    }

    setNavMode("mobile");
    setCenterOffset(0);
  };

  const refreshCounts = async () => {
    if (isAuthLoading) {
      setCartCount(getGuestCartCount());
      setWishlistCount(getGuestWishlistCount());
      return;
    }

    if (!isAuthenticated) {
      setCartCount(getGuestCartCount());
      setWishlistCount(getGuestWishlistCount());
      return;
    }

    try {
      const [cartRes, wishRes] = await Promise.all([
        api.get("/cart"),
        api.get("/wishlist/count"),
      ]);

      const cartItems = cartRes.data?.items || [];
      const totalQty = cartItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      );

      setCartCount(totalQty);
      setWishlistCount(Number(wishRes.data?.count) || 0);
    } catch {
      setCartCount(0);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    recalcNavbar();

    let observer = null;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => recalcNavbar());

      if (containerRef.current) observer.observe(containerRef.current);
      if (leftRef.current) observer.observe(leftRef.current);
      if (rightRef.current) observer.observe(rightRef.current);
    }

    window.addEventListener("resize", recalcNavbar);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", recalcNavbar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, isAuthenticated, isAuthLoading]);

  useEffect(() => {
    refreshCounts();

    const onCartUpdated = () => refreshCounts();
    const onWishlistUpdated = () => refreshCounts();

    window.addEventListener("cart:updated", onCartUpdated);
    window.addEventListener("wishlist:updated", onWishlistUpdated);

    const onStorage = (event) => {
      if (event.key === GUEST_CART_KEY || event.key === GUEST_WISHLIST_KEY) {
        refreshCounts();
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cart:updated", onCartUpdated);
      window.removeEventListener("wishlist:updated", onWishlistUpdated);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    refreshCounts();
  };

  const compact = navMode === "compact";

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
        {/* Hidden measurement navs */}
        <div className="pointer-events-none absolute -left-[9999px] -top-[9999px] opacity-0">
          <div
            ref={navMeasureNormalRef}
            className="flex items-center gap-8 whitespace-nowrap"
          >
            <span className="text-sm font-medium">Acasă</span>
            <span className="text-sm font-medium">Configurator</span>
            <span className="text-sm font-medium">Componente</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              AI
            </span>
          </div>

          <div
            ref={navMeasureCompactRef}
            className="mt-2 flex items-center gap-4 whitespace-nowrap"
          >
            <span className="text-xs font-medium">Acasă</span>
            <span className="text-xs font-medium">Configurator</span>
            <span className="text-xs font-medium">Componente</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              AI
            </span>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative flex items-center justify-between gap-2"
        >
          {/* LEFT */}
          <div ref={leftRef} className="flex-shrink-0">
            <Link to="/" className="group flex items-center gap-2 sm:gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 animate-pulse rounded-lg bg-cyan-500/20 blur-xl" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="whitespace-nowrap bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-2xl">
                  ConfigEXP
                </h1>
                <p className="hidden whitespace-nowrap text-xs text-slate-400 md:block">
                  PC Configuration Platform
                </p>
              </div>
            </Link>
          </div>

          {/* CENTER NAV */}
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

                <Link to="/ai-configurator" className={aiLinkClass(compact)}>
                  <Sparkles className="h-4 w-4" />
                  AI
                  {isActive("/ai-configurator") && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-2 -bottom-[17px] h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"
                    />
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* RIGHT */}
          <div
            ref={rightRef}
            className="flex flex-shrink-0 items-center justify-end gap-1 sm:gap-2"
          >
            <Link
              to="/wishlist"
              className="group relative rounded-lg p-2 transition-all hover:bg-slate-800/50"
              title="Wishlist"
            >
              <Heart className="h-5 w-5 text-slate-400 transition-colors group-hover:text-cyan-400" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="group relative rounded-lg p-2 transition-all hover:bg-slate-800/50"
              title="Coș"
            >
              <ShoppingCart className="h-5 w-5 text-slate-400 transition-colors group-hover:text-cyan-400" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
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
                  title="Cont"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span className="max-w-[110px] truncate lg:max-w-[170px]">
                    {user?.name || "Cont"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-2 py-2 text-sm text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 sm:inline-flex sm:px-3"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40 sm:px-4 sm:text-sm"
              >
                Conectare
              </Link>
            )}

            {navMode === "mobile" && (
              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="ml-1 inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 p-2 text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800/70 hover:text-cyan-300"
                aria-label="Meniu"
                title="Meniu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {navMode === "mobile" && mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-slate-700/60 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            <Link to="/" className={mobileLinkClass("/")}>
              Acasă
            </Link>

            <Link to="/configurator" className={mobileLinkClass("/configurator")}>
              Configurator
            </Link>

            <Link to="/components" className={mobileLinkClass("/components")}>
              Componente
            </Link>

            <Link
              to="/ai-configurator"
              className={`mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive("/ai-configurator")
                  ? "bg-purple-500/15 text-purple-200"
                  : "text-purple-200 hover:bg-purple-500/10"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Link>

            <div className="my-2 h-px bg-slate-800" />

            {isAuthenticated ? (
              <>
                <Link to="/account" className={mobileLinkClass("/account")}>
                  <User className="h-4 w-4" />
                  Contul meu
                  <span className="ml-auto max-w-[160px] truncate text-xs text-slate-500">
                    {user?.name || "Cont"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="mt-1 block rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-cyan-500/20"
              >
                Conectare
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
