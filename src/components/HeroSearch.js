"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, ChevronDown, LayoutGrid, Shield, Lock, BadgeCheck } from "lucide-react";
import { BRAND_NAME, CITIES } from "@/lib/constants";
import { CATEGORY_TREE } from "@/lib/categories";

export default function HeroSearch({ popularSearches = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoryLabel = CATEGORY_TREE.find((c) => c.id === categoryId)?.name || "All Categories";
  const tags = popularSearches.length > 0 ? popularSearches : [];

  function handleSearch(term) {
    const q = (term ?? query).trim();
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (location) params.set("city", location);
    if (categoryId) router.push(`/category/${categoryId}${params.toString() ? `?${params}` : ""}`);
    else router.push(params.toString() ? `/?${params}` : "/");
  }

  return (
    <section className="relative overflow-hidden bg-[var(--tk-hero)] px-4 pb-14 pt-12 sm:pb-16 sm:pt-16">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full border-[70px] border-white/40" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-[360px] w-[360px] rounded-full border-[60px] border-white/35" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-bold text-cyan-800">
            <Shield size={14} /> Escrow Protected
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-bold text-cyan-800">
            <Lock size={14} /> Funds Held Until Verified
          </span>
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[3.25rem]">
          Scams Ka End — <span className="text-cyan-600">{BRAND_NAME}</span> Ka Trend
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          Pakistan&apos;s professional escrow marketplace. Buy & sell phones, vehicles, electronics & more —
          payment released only after you confirm delivery.
        </p>

        <div className="mx-auto mt-8 max-w-3xl rounded-full border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 sm:flex sm:items-center sm:gap-2 sm:rounded-full">
          <div className="relative sm:shrink-0">
            <button
              type="button"
              onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsLocationOpen(false); }}
              className="flex w-full items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 sm:min-w-[150px] sm:border-0"
            >
              <LayoutGrid size={16} className="text-cyan-500" />
              <span className="flex-1 truncate text-left">{categoryLabel}</span>
              <ChevronDown size={14} className={isCategoryOpen ? "rotate-180" : ""} />
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-64 w-56 overflow-auto rounded-2xl border bg-white p-2 shadow-2xl">
                <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-cyan-50" onClick={() => { setCategoryId(""); setIsCategoryOpen(false); }}>
                  All Categories
                </button>
                {CATEGORY_TREE.map((c) => (
                  <button key={c.id} type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-cyan-50" onClick={() => { setCategoryId(c.id); setIsCategoryOpen(false); }}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative hidden h-7 w-px bg-slate-200 sm:block" />

          <div className="relative sm:shrink-0">
            <button
              type="button"
              onClick={() => { setIsLocationOpen(!isLocationOpen); setIsCategoryOpen(false); }}
              className="flex w-full items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 sm:min-w-[140px] sm:border-0"
            >
              <MapPin size={16} className="text-cyan-500" />
              <span className="flex-1 truncate text-left">{location || "All Pakistan"}</span>
              <ChevronDown size={14} />
            </button>
            {isLocationOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-48 w-48 overflow-auto rounded-2xl border bg-white p-2 shadow-2xl">
                <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-cyan-50" onClick={() => { setLocation(""); setIsLocationOpen(false); }}>
                  All Pakistan
                </button>
                {CITIES.map((loc) => (
                  <button key={loc} type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-cyan-50" onClick={() => { setLocation(loc); setIsLocationOpen(false); }}>
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 items-center gap-2 px-2 py-2 sm:py-0">
            <Search size={18} className="hidden text-slate-400 sm:block" />
            <input
              type="text"
              placeholder="Search anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
            />
          </div>

          <button type="button" onClick={() => handleSearch()} className="tk-btn-primary w-full sm:w-auto sm:shrink-0">
            Search
          </button>
        </div>

        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-500">Popular:</span>
            {tags.map((tag) => (
              <button key={tag} type="button" onClick={() => handleSearch(tag)} className="tk-pill">
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1"><BadgeCheck size={14} className="text-cyan-600" /> Verified sellers</span>
          <Link href="/compare" className="text-cyan-700 underline-offset-2 hover:underline">
            See why we beat OLX-style sites →
          </Link>
        </div>
      </div>
    </section>
  );
}
