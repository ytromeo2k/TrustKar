"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdById,
  createTransaction,
  recordAdView,
} from "@/lib/firestore-helpers";
import { formatPrice } from "@/lib/utils";
import ImageLightbox from "@/components/ImageLightbox";
import {
  ShieldCheck,
  MapPin,
  Star,
  Loader2,
  ShoppingCart,
  Phone,
  Truck,
  CheckCircle,
  ZoomIn,
  User,
} from "lucide-react";

export default function AdDetailContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const posted = searchParams.get("posted");
  const { user, isSuspended } = useAuth();
  const router = useRouter();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdById(id).then((data) => {
      setAd(data);
      setLoading(false);
      if (data && user) recordAdView(user.uid, data);
    });
  }, [id, user]);

  async function handleBuy() {
    if (!user) {
      router.push(`/auth/login?redirect=/ad/${id}`);
      return;
    }
    if (isSuspended) {
      setError("Your account is suspended. Contact support.");
      return;
    }
    if (ad.sellerId === user.uid) {
      setError("You cannot buy your own listing.");
      return;
    }
    setBuying(true);
    setError("");
    try {
      const milestonePlan = ad.milestoneEnabled
        ? {
            upfrontPercent: ad.upfrontPercent || 20,
            upfrontAmount: Math.round((ad.price * (ad.upfrontPercent || 20)) / 100),
            finalAmount: ad.price - Math.round((ad.price * (ad.upfrontPercent || 20)) / 100),
          }
        : null;

      const txId = await createTransaction({
        adId: id,
        buyerId: user.uid,
        sellerId: ad.sellerId,
        amount: ad.price,
        adTitle: ad.title,
        milestonePlan,
      });
      router.push(`/checkout/${txId}`);
    } catch (err) {
      setError(err.message || "Could not start escrow.");
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="tk-container py-20 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <Link href="/" className="mt-4 inline-block text-cyan-600 hover:underline">
          Back to TrustKar
        </Link>
      </div>
    );
  }

  const images = ad.images?.length ? ad.images : [ad.mainImage || "/placeholder-ad.svg"];
  const attrs = ad.attributes || {};

  return (
    <div className="tk-container py-8">
      {posted && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Your ad is live on TrustKar!
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        <div>
          <div
            className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-3xl bg-slate-900 shadow-lg"
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
          >
            <Image src={images[activeImage]} alt={ad.title} fill className="object-contain opacity-95" unoptimized />
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
              <ZoomIn size={14} /> Tap to zoom
            </span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                  activeImage === i ? "border-cyan-500" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
          <div className="tk-card mt-6">
            <h2 className="text-lg font-extrabold">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{ad.description}</p>
          </div>
        </div>

        <div className="tk-card lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-600">{ad.categoryName}</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">{ad.title}</h1>
          <p className="mt-3 text-3xl font-black text-cyan-600">{formatPrice(ad.price)}</p>
          {ad.negotiable && <p className="text-sm text-slate-500">Negotiable</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            {ad.escrowVerified && (
              <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Safe
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{ad.condition}</span>
          </div>

          <div className="mt-5 space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {ad.city || ad.location}
            </p>
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> {ad.delivery}
            </p>
          </div>

          <Link
            href={`/seller/${ad.sellerId}`}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
              <User size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-500">Posted by</p>
              <p className="truncate font-bold text-slate-900">{ad.sellerName || "Seller"}</p>
              {ad.sellerTrustRating != null && (
                <p className="flex items-center gap-1 text-xs text-slate-600">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {Number(ad.sellerTrustRating).toFixed(1)} rating · View profile
                </p>
              )}
            </div>
          </Link>

          {(ad.brand || ad.model || Object.keys(attrs).length > 0) && (
            <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {ad.brand && (
                <>
                  <dt className="text-slate-500">Brand</dt>
                  <dd className="font-medium">{ad.brand}</dd>
                </>
              )}
              {ad.model && (
                <>
                  <dt className="text-slate-500">Model</dt>
                  <dd className="font-medium">{ad.model}</dd>
                </>
              )}
              {Object.entries(attrs).map(([k, v]) =>
                v ? (
                  <span key={k} className="contents">
                    <dt className="capitalize text-slate-500">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </span>
                ) : null
              )}
            </dl>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleBuy}
            disabled={buying}
            className="tk-btn-primary mt-6 w-full !py-4 text-base"
          >
            {buying ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
            Buy with Escrow
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">
            Payment held until you verify delivery · 48h inspection
          </p>
          {ad.contactPhone && (
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500">
              <Phone size={12} /> Contact after escrow started
            </p>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          activeIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={setActiveImage}
          title={ad.title}
        />
      )}
    </div>
  );
}
