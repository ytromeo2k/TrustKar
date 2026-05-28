"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Clock, ShieldCheck } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toggleWishlist, isInWishlist } from "@/lib/firestore-helpers";
import { useToast } from "@/context/ToastContext";

function timeAgo(timestamp) {
  if (!timestamp) return "Recently";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-PK");
}

export default function AdCard({ ad }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favorited, setFavorited] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = ad.mainImage || ad.images?.[0] || "/placeholder-ad.svg";

  useEffect(() => {
    if (!user) return;
    isInWishlist(user.uid, ad.id).then(setFavorited);
  }, [user, ad.id]);

  async function toggleFav(e) {
    e.preventDefault();
    if (!user) {
      showToast("Login to save wishlist", "info");
      return;
    }
    try {
      const added = await toggleWishlist(user.uid, ad.id, ad);
      setFavorited(added);
      showToast(added ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch {
      showToast("Could not update wishlist", "error");
    }
  }

  return (
    <Link
      href={`/ad/${ad.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
        <Image
          src={imageUrl}
          alt={ad.title}
          fill
          className={cn("object-cover transition duration-500 group-hover:scale-105", imgLoaded ? "opacity-100" : "opacity-0")}
          sizes="(max-width: 768px) 50vw, 260px"
          unoptimized={imageUrl.startsWith("http")}
          onLoad={() => setImgLoaded(true)}
        />
        <button
          type="button"
          onClick={toggleFav}
          className={cn(
            "absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition",
            favorited ? "bg-red-500 text-white" : "bg-slate-900/70 text-white hover:bg-red-500"
          )}
          aria-label="Wishlist"
        >
          <Heart size={15} className={favorited ? "fill-white" : ""} />
        </button>
        {ad.escrowVerified && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-bold text-white">
            <ShieldCheck size={11} /> Verified
          </span>
        )}
        {ad.condition && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
            {ad.condition}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-base font-black text-cyan-700">{formatPrice(ad.price)}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">{ad.title}</h3>
        <p className="mt-1 truncate text-[11px] font-medium text-slate-500">{ad.categoryName}</p>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
          <span className="flex min-w-0 items-center gap-1 truncate">
            <MapPin size={11} className="shrink-0 text-cyan-600" />
            {ad.city || ad.location || "Pakistan"}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Clock size={10} />
            {timeAgo(ad.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
