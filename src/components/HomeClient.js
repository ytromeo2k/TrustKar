"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { subscribeActiveAds, derivePopularSearches } from "@/lib/firestore-helpers";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { CATEGORY_TREE, CATEGORY_ICONS } from "@/lib/categories";
import HeroSearch from "./HeroSearch";
import TrustBanner from "./TrustBanner";
import CategoriesGrid from "./CategoriesGrid";
import ListingSection from "./ListingSection";
import AppDownloadBanner from "./AppDownloadBanner";
import AdCard from "./AdCard";
import SkeletonCard from "./SkeletonCard";
import { Loader2, PackageOpen, Flame } from "lucide-react";
import Link from "next/link";

export default function HomeClient() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeActiveAds(
      (list) => {
        setAds(list);
        setLoading(false);
      },
      (err) => {
        setError(getAuthErrorMessage(err.code || err.message));
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const popularSearches = useMemo(() => derivePopularSearches(ads, 6), [ads]);

  const filtered = useMemo(() => {
    let list = ads;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(s) ||
          a.description?.toLowerCase().includes(s) ||
          a.brand?.toLowerCase().includes(s)
      );
    }
    if (city) {
      list = list.filter(
        (a) =>
          a.city?.toLowerCase() === city.toLowerCase() ||
          a.location?.toLowerCase() === city.toLowerCase()
      );
    }
    return list;
  }, [ads, search, city]);

  const trending = useMemo(() => filtered.slice(0, 12), [filtered]);

  const byCategory = useMemo(() => {
    const map = {};
    for (const cat of CATEGORY_TREE) {
      map[cat.id] = filtered.filter((a) => a.categoryId === cat.id).slice(0, 10);
    }
    return map;
  }, [filtered]);

  const hasSearch = Boolean(search || city);

  return (
    <div className="min-h-screen">
      <HeroSearch popularSearches={popularSearches} />
      <TrustBanner />

      <div className="tk-container py-6">
        <CategoriesGrid />
      </div>

      {error && (
        <div className="tk-container pb-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
        </div>
      )}

      {hasSearch ? (
        <section className="tk-container pb-12">
          <h2 className="tk-section-title mb-6">
            {search ? `Results for "${search}"` : `Listings in ${city}`}
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {filtered.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
            </div>
          )}
          {!loading && trending.length > 0 && (
            <ListingSection
              title="Trending Now"
              ads={trending}
              icon={<Flame className="h-5 w-5 text-orange-500" />}
              seeAllHref="/?search=trending"
            />
          )}
          {!loading &&
            CATEGORY_TREE.map((cat) => {
              const catAds = byCategory[cat.id] || [];
              if (catAds.length === 0) return null;
              return (
                <ListingSection
                  key={cat.id}
                  title={cat.name}
                  ads={catAds}
                  categoryId={cat.id}
                  iconName={CATEGORY_ICONS[cat.id]}
                />
              );
            })}
          {!loading && ads.length === 0 && <EmptyState />}
        </>
      )}

      <div className="tk-container pb-8">
        <div className="tk-card flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="text-lg font-black text-slate-900">Why buyers trust TrustKar</h3>
            <p className="text-sm text-slate-600">Escrow · Reviews · Disputes · KYC — not just listings.</p>
          </div>
          <Link href="/compare" className="tk-btn-primary">
            Compare with other sites
          </Link>
        </div>
      </div>

      <AppDownloadBanner />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-slate-500">
      <PackageOpen className="h-16 w-16 text-slate-300" />
      <p className="mt-4 text-lg font-bold">No listings yet</p>
      <Link href="/post-ad" className="mt-3 tk-btn-primary">
        Post the first ad
      </Link>
    </div>
  );
}
