"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAllAds,
  fetchAllUsers,
  fetchAllTransactions,
  fetchAllPaymentProofs,
  adminUpdateUser,
  updateAd,
  deleteAd,
  updateTransactionStatus,
  logAdminAction,
  computePlatformStats,
} from "@/lib/firestore-helpers";
import { COLLECTIONS, ESCROW_STATUS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import {
  Shield,
  Loader2,
  Ban,
  BadgeCheck,
  CheckCircle,
  Trash2,
  Users,
  BarChart3,
  CreditCard,
  Package,
  Star,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

const ADMIN_TABS = ["overview", "transactions", "ads", "users", "proofs"];

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState("overview");
  const [ads, setAds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login?redirect=/admin");
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    loadAll();
  }, [user, isAdmin, authLoading]);

  async function loadAll() {
    setLoading(true);
    try {
      const [a, t, u, p] = await Promise.all([
        fetchAllAds(),
        fetchAllTransactions(),
        fetchAllUsers(),
        fetchAllPaymentProofs(),
      ]);
      setAds(a);
      setTransactions(t);
      setUsers(u);
      setProofs(p);
    } catch (e) {
      console.error(e);
      showToast("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  }

  async function releasePayment(txId) {
    try {
      await updateTransactionStatus(txId, ESCROW_STATUS.RELEASED, { releasedAt: new Date() });
      await logAdminAction(user.uid, "release_payment", { txId });
      showToast("Payment released", "success");
      await loadAll();
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  async function toggleVerified(adId, current) {
    await updateAd(adId, { escrowVerified: !current });
    await logAdminAction(user.uid, "toggle_ad_verified", { adId });
    await loadAll();
  }

  async function removeAd(adId) {
    if (!confirm("Delete this ad?")) return;
    await deleteAd(adId);
    await logAdminAction(user.uid, "delete_ad", { adId });
    showToast("Ad removed", "success");
    await loadAll();
  }

  async function toggleSuspend(uid, suspended) {
    await adminUpdateUser(uid, { suspended: !suspended });
    await logAdminAction(user.uid, suspended ? "unsuspend_user" : "suspend_user", { uid });
    showToast(suspended ? "User unsuspended" : "User suspended", "success");
    await loadAll();
  }

  async function toggleUserVerified(uid, verified) {
    await adminUpdateUser(uid, { verified: !verified });
    await logAdminAction(user.uid, "toggle_user_verified", { uid });
    await loadAll();
  }

  async function setUserRole(uid, role) {
    await adminUpdateUser(uid, { role });
    await logAdminAction(user.uid, "set_role", { uid, role });
    showToast("Role updated", "success");
    await loadAll();
  }

  async function resetTrust(uid) {
    await adminUpdateUser(uid, { trustRating: 5, reviewCount: 0 });
    showToast("Trust reset to 5.0", "info");
    await loadAll();
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="tk-container py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold">Admin access denied</h1>
        <p className="mt-2 text-slate-600">
          Set <code className="rounded bg-slate-100 px-1">role: &quot;admin&quot;</code> in Firestore{" "}
          <code className="rounded bg-slate-100 px-1">users/{"{uid}"}</code>
        </p>
      </div>
    );
  }

  const stats = computePlatformStats(ads, users, transactions);
  const q = search.toLowerCase();
  const filterFn = (text) => !q || String(text || "").toLowerCase().includes(q);

  return (
    <div className="tk-container py-8">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <Shield className="h-8 w-8 text-cyan-600" />
        TrustKar Admin
      </h1>

      <input
        type="search"
        placeholder="Search users, ads, transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="tk-input mt-4 max-w-md"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {ADMIN_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${
              tab === t ? "bg-cyan-600 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Package, "Active ads", stats.totalAds],
            [Users, "Users", stats.totalUsers],
            [CreditCard, "Escrow held", formatPrice(stats.escrowHeld)],
            [BarChart3, "Disputes", stats.activeDisputes],
          ].map(([Icon, label, val]) => (
            <div key={label} className="tk-card !p-4">
              <Icon className="h-6 w-6 text-cyan-600" />
              <p className="mt-2 text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-black">{val}</p>
            </div>
          ))}
          <div className="tk-card col-span-full lg:col-span-2">
            <h3 className="font-bold">Ads by city</h3>
            <ul className="mt-3 space-y-1 text-sm">
              {stats.topCities.map(([city, n]) => (
                <li key={city} className="flex justify-between">
                  <span>{city}</span>
                  <span className="font-bold">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="tk-card col-span-full lg:col-span-2">
            <h3 className="font-bold">Top categories</h3>
            <ul className="mt-3 space-y-1 text-sm">
              {stats.topCategories.map(([cat, n]) => (
                <li key={cat} className="flex justify-between">
                  <span className="truncate">{cat}</span>
                  <span className="font-bold">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "transactions" && (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Ad</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter((t) => filterFn(t.adTitle)).slice(0, 50).map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.adTitle}</td>
                  <td className="p-3">{formatPrice(t.amount)}</td>
                  <td className="p-3 font-medium text-cyan-700">{t.status}</td>
                  <td className="p-3">
                    {t.status !== ESCROW_STATUS.RELEASED && (
                      <button
                        type="button"
                        onClick={() => releasePayment(t.id)}
                        className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2 py-1 text-xs text-white"
                      >
                        <CheckCircle size={12} /> Release
                      </button>
                    )}
                    <Link href={`/checkout/${t.id}`} className="ml-2 text-xs text-cyan-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "ads" && (
        <ul className="mt-6 space-y-2">
          {ads.filter((a) => filterFn(a.title)).slice(0, 40).map((ad) => (
            <li key={ad.id} className="tk-card flex flex-wrap items-center justify-between gap-2 !p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{ad.title}</p>
                <p className="text-xs text-slate-500">
                  {ad.city} · {formatPrice(ad.price)} · {ad.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => toggleVerified(ad.id, ad.escrowVerified)} className="rounded-lg bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-800">
                  <BadgeCheck size={12} className="inline" /> {ad.escrowVerified ? "Verified" : "Verify"}
                </button>
                <Link href={`/ad/${ad.id}`} className="text-xs text-cyan-600">Open</Link>
                <button type="button" onClick={() => removeAd(ad.id)} className="rounded-lg bg-red-50 px-2 py-1 text-xs text-red-700">
                  <Trash2 size={12} className="inline" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "users" && (
        <ul className="mt-6 space-y-2">
          {users.filter((u) => filterFn(u.displayName || u.email)).map((u) => (
            <li key={u.uid} className="tk-card !p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{u.displayName || u.email}</p>
                  <p className="text-xs text-slate-500">
                    {u.email} · Trust {u.trustRating ?? 5} · Role {u.role || "user"}
                    {u.suspended && <span className="ml-2 text-red-600">SUSPENDED</span>}
                    {u.verified && <span className="ml-2 text-cyan-600">VERIFIED</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggleSuspend(u.uid, u.suspended)} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                    <Ban size={12} className="inline" /> {u.suspended ? "Unban" : "Ban"}
                  </button>
                  <button type="button" onClick={() => toggleUserVerified(u.uid, u.verified)} className="rounded-lg bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-800">
                    <Star size={12} className="inline" /> {u.verified ? "Unverify" : "Verify"}
                  </button>
                  {u.role !== "admin" && (
                    <button type="button" onClick={() => setUserRole(u.uid, "admin")} className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                      Make admin
                    </button>
                  )}
                  <button type="button" onClick={() => resetTrust(u.uid)} className="text-xs text-slate-500 underline">
                    Reset trust
                  </button>
                  <Link href={`/seller/${u.uid}`} className="text-xs text-cyan-600">Profile</Link>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Password reset: direct user to{" "}
                <Link href="/auth/forgot-password" className="text-cyan-600">forgot password</Link> or Firebase Console.
              </p>
            </li>
          ))}
        </ul>
      )}

      {tab === "proofs" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proofs.length === 0 ? (
            <p className="text-slate-500">No payment ID screenshots yet.</p>
          ) : (
            proofs.map((p) => (
              <div key={p.id + p.userId} className="tk-card !p-3">
                <p className="text-sm font-bold">{p.userName}</p>
                <p className="text-xs text-slate-500">{p.status} · {p.method}</p>
                {p.imageUrl && (
                  <div className="relative mt-2 aspect-video overflow-hidden rounded-xl">
                    <Image src={p.imageUrl} alt="Proof" fill className="object-contain" unoptimized />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
