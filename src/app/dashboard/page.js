"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUserTransactions,
  fetchUserAds,
  fetchWishlist,
  fetchViewHistory,
  createReview,
  updateTransactionStatus,
} from "@/lib/firestore-helpers";
import { COLLECTIONS, ESCROW_STATUS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { savePaymentProof } from "@/lib/firestore-helpers";
import {
  Loader2,
  Package,
  Heart,
  Eye,
  ShoppingBag,
  Star,
  Upload,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import AdCard from "@/components/AdCard";

const TABS = [
  { id: "listings", label: "My Ads", icon: Package },
  { id: "purchases", label: "Purchases", icon: ShoppingBag },
  { id: "sales", label: "Sales", icon: ShoppingBag },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "views", label: "Recently Viewed", icon: Eye },
  { id: "payment", label: "Payment ID", icon: Upload },
];

const STATUS_LABELS = {
  [ESCROW_STATUS.PAYMENT_PENDING]: "Awaiting payment",
  [ESCROW_STATUS.FUNDS_HELD]: "Funds held",
  [ESCROW_STATUS.DISPATCHED]: "Dispatched",
  [ESCROW_STATUS.INSPECTION]: "Inspection",
  [ESCROW_STATUS.RELEASED]: "Completed",
  [ESCROW_STATUS.DISPUTED]: "Disputed",
  [ESCROW_STATUS.CANCELLED]: "Cancelled",
};

function DashboardInner() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "listings";
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [myAds, setMyAds] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTx, setReviewTx] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [proofUploading, setProofUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login?redirect=/dashboard");
      return;
    }
    loadAll();
  }, [user, authLoading]);

  async function loadAll() {
    setLoading(true);
    try {
      const [tx, ads, wish, hist] = await Promise.all([
        fetchUserTransactions(user.uid),
        fetchUserAds(user.uid),
        fetchWishlist(user.uid),
        fetchViewHistory(user.uid),
      ]);
      setTransactions(tx);
      setMyAds(ads);
      setWishlist(wish);

      const viewAds = await Promise.all(
        hist.map(async (v) => {
          const snap = await getDoc(doc(db, COLLECTIONS.ADS, v.adId));
          if (snap.exists() && snap.data().status === "active") {
            return { id: snap.id, ...snap.data() };
          }
          return null;
        })
      );
      setViews(viewAds.filter(Boolean));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview() {
    if (!reviewTx) return;
    try {
      await createReview({
        buyerId: user.uid,
        sellerId: reviewTx.sellerId,
        transactionId: reviewTx.id,
        adId: reviewTx.adId,
        rating: reviewRating,
        comment: reviewComment,
        buyerName: profile?.displayName || user.displayName,
      });
      await updateTransactionStatus(reviewTx.id, reviewTx.status, { reviewed: true });
      showToast("Review submitted — thank you!", "success");
      setReviewTx(null);
      await loadAll();
    } catch {
      showToast("Could not submit review", "error");
    }
  }

  async function uploadPaymentProof(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofUploading(true);
    try {
      const { secureUrl } = await uploadImageToCloudinary(file, { folder: "trustkar/payment-proofs" });
      await savePaymentProof(user.uid, { imageUrl: secureUrl, method: "id_verification", note: "Payment ID screenshot" });
      showToast("Screenshot uploaded — admin will review", "success");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setProofUploading(false);
    }
  }

  function setTab(id) {
    router.push(`/dashboard?tab=${id}`);
  }

  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
      </div>
    );
  }

  const purchases = transactions.filter((t) => t.buyerId === user.uid);
  const sales = transactions.filter((t) => t.sellerId === user.uid);

  return (
    <div className="tk-container py-8">
      <h1 className="text-2xl font-black sm:text-3xl">My Dashboard</h1>
      <p className="mt-1 text-slate-600">
        Welcome, <strong>{profile?.displayName}</strong> — only your data is shown here.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === id ? "bg-cyan-600 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      ) : (
        <div className="mt-8">
          {tab === "listings" && (
            <>
              <div className="mb-4 flex justify-between">
                <h2 className="tk-section-title">My posted ads ({myAds.length})</h2>
                <Link href="/post-ad" className="tk-btn-primary !py-2 text-sm">
                  + New ad
                </Link>
              </div>
              {myAds.length === 0 ? (
                <p className="text-slate-500">No ads yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {myAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "wishlist" && (
            <>
              <h2 className="tk-section-title mb-4">Wishlist ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <p className="text-slate-500">Save ads with the heart icon.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {wishlist.map((w) => (
                    <Link key={w.adId} href={`/ad/${w.adId}`} className="tk-card block !p-3 hover:border-cyan-300">
                      {w.mainImage && (
                        <div className="relative mb-2 aspect-video overflow-hidden rounded-xl">
                          <Image src={w.mainImage} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <p className="line-clamp-2 text-sm font-bold">{w.title}</p>
                      <p className="text-cyan-700 font-black">{formatPrice(w.price)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "views" && (
            <>
              <h2 className="tk-section-title mb-4">Recently viewed</h2>
              {views.length === 0 ? (
                <p className="text-slate-500">Browse ads to see history here.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {views.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              )}
            </>
          )}

          {(tab === "purchases" || tab === "sales") && (
            <TxList
              items={tab === "purchases" ? purchases : sales}
              role={tab === "purchases" ? "buyer" : "seller"}
              userId={user.uid}
              onReview={(tx) => setReviewTx(tx)}
            />
          )}

          {tab === "payment" && (
            <div className="tk-card max-w-lg">
              <h2 className="font-bold">Upload payment ID screenshot</h2>
              <p className="mt-2 text-sm text-slate-600">
                For verification — admin can view this in the admin panel.
              </p>
              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 p-8 hover:border-cyan-400">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="mt-2 text-sm font-semibold">
                  {proofUploading ? "Uploading..." : "Choose image"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadPaymentProof} disabled={proofUploading} />
              </label>
            </div>
          )}
        </div>
      )}

      {reviewTx && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="tk-card w-full max-w-md">
            <h3 className="text-lg font-black">Rate seller</h3>
            <p className="mt-1 text-sm text-slate-600">{reviewTx.adTitle}</p>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setReviewRating(n)} className="p-1">
                  <Star size={28} className={n <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                </button>
              ))}
            </div>
            <textarea
              className="tk-input mt-4"
              rows={3}
              placeholder="Share your experience (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <div className="mt-4 flex gap-2">
              <button type="button" className="tk-btn-primary flex-1" onClick={submitReview}>
                Submit review
              </button>
              <button type="button" className="tk-btn-outline" onClick={() => setReviewTx(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TxList({ items, role, userId, onReview }) {
  if (items.length === 0) {
    return <p className="text-slate-500">No transactions yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((tx) => (
        <li key={tx.id} className="tk-card flex flex-wrap items-center justify-between gap-3 !p-4">
          <div>
            <p className="font-bold">{tx.adTitle || "Deal"}</p>
            <p className="text-sm text-slate-500">
              {role === "buyer" ? "You bought" : "You sold"} · {STATUS_LABELS[tx.status] || tx.status}
            </p>
            <p className="font-black text-cyan-700">{formatPrice(tx.amount)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/checkout/${tx.id}`} className="tk-btn-primary !py-2 text-xs">
              Open deal
            </Link>
            {role === "buyer" && tx.status === ESCROW_STATUS.RELEASED && !tx.reviewed && (
              <button type="button" className="tk-btn-outline !py-2 text-xs" onClick={() => onReview(tx)}>
                <Star size={14} /> Leave review
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-20 h-10 w-10 animate-spin" />}>
      <DashboardInner />
    </Suspense>
  );
}
