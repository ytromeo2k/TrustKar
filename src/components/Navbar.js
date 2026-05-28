"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BRAND_NAME } from "@/lib/constants";
import { CATEGORY_TREE } from "@/lib/categories";
import {
  Plus,
  Menu,
  X,
  Shield,
  LayoutDashboard,
  LogOut,
  Scale,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const { user, profile, logout, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    router.replace("/");
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-lg shadow-slate-200/40" : ""
      }`}
    >
      <div className="tk-container flex h-[68px] items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-xs font-black text-white">
            TK
          </span>
          <span className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{BRAND_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
            >
              Categories <ChevronDown size={14} className={catOpen ? "rotate-180" : ""} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 grid w-72 grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {CATEGORY_TREE.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.id}`}
                    onClick={() => setCatOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/compare" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-cyan-50 hover:text-cyan-700">
            Why TrustKar
          </Link>
          <Link href="/support" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-cyan-50 hover:text-cyan-700">
            Support
          </Link>
          {isAdmin && (
            <Link href="/admin" className="rounded-full px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <Link href="/dashboard" className="hidden items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-cyan-200 sm:flex">
                <LayoutDashboard size={16} />
                {profile?.displayName?.split(" ")[0] || "Account"}
              </Link>
              <button type="button" onClick={handleLogout} className="hidden rounded-full p-2 text-slate-500 hover:bg-slate-100 sm:block" title="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : !loading ? (
            <Link href="/auth/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:block">
              Login
            </Link>
          ) : null}
          <Link href="/post-ad" className="tk-btn-primary !px-4 !py-2 text-xs sm:text-sm">
            <Plus size={16} /> Sell
          </Link>
          <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          {CATEGORY_TREE.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-cyan-50" onClick={() => setMobileOpen(false)}>
              {c.name}
            </Link>
          ))}
          <Link href="/compare" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold" onClick={() => setMobileOpen(false)}>
            <Scale size={16} /> Why TrustKar
          </Link>
          <Link href="/support" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold" onClick={() => setMobileOpen(false)}>
            <HelpCircle size={16} /> Support
          </Link>
          <Link href="/dashboard" className="block rounded-xl px-3 py-2.5 text-sm font-semibold" onClick={() => setMobileOpen(false)}>
            My Dashboard
          </Link>
          {user ? (
            <button type="button" onClick={handleLogout} className="mt-2 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-700">
              Logout
            </button>
          ) : (
            <Link href="/auth/login" className="mt-2 block rounded-xl bg-cyan-600 py-2.5 text-center text-sm font-bold text-white" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
