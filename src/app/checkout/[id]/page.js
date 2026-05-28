"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, PAYMENT_METHODS, ESCROW_STATUS, INSPECTION_PERIOD_HOURS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { Shield, Loader2, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { key: ESCROW_STATUS.PAYMENT_PENDING, label: "Pay & upload receipt" },
  { key: ESCROW_STATUS.FUNDS_HELD, label: "Funds held in escrow" },
  { key: ESCROW_STATUS.DISPATCHED, label: "Item dispatched" },
  { key: ESCROW_STATUS.INSPECTION, label: "Inspection window" },
  { key: ESCROW_STATUS.RELEASED, label: "Funds released" },
];

export default function CheckoutPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [tx, setTx] = useState(null);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      router.push(`/auth/login?redirect=/checkout/${id}`);
      return;
    }
    load();
  }, [id, user]);

  async function load() {
    const txSnap = await getDoc(doc(db, COLLECTIONS.TRANSACTIONS, id));
    if (!txSnap.exists()) {
      setLoading(false);
      return;
    }
    const txData = { id: txSnap.id, ...txSnap.data() };
    setTx(txData);
    if (txData.adId) {
      const adSnap = await getDoc(doc(db, COLLECTIONS.ADS, txData.adId));
      if (adSnap.exists()) setAd({ id: adSnap.id, ...adSnap.data() });
    }
    setLoading(false);
  }

  async function confirmPayment() {
    if (!receiptFile) {
      setMessage("Upload payment receipt screenshot.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const { secureUrl } = await uploadImageToCloudinary(receiptFile, {
        folder: "trustkar/receipts",
      });
      const inspectionEnds = new Date();
      inspectionEnds.setHours(inspectionEnds.getHours() + INSPECTION_PERIOD_HOURS);

      await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, id), {
        status: ESCROW_STATUS.FUNDS_HELD,
        paymentMethod,
        receiptUrl: secureUrl,
        fundsHeldAt: serverTimestamp(),
        notifications: [
          { type: "payment_held", at: new Date().toISOString(), channel: "simulated_sms_email" },
        ],
        updatedAt: serverTimestamp(),
      });
      setMessage("Payment recorded. Funds are now held in TRUSTKAR escrow.");
      await load();
    } catch (err) {
      setMessage(err.message || "Failed to confirm payment.");
    } finally {
      setUploading(false);
    }
  }

  async function markDispatched() {
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, id), {
      status: ESCROW_STATUS.DISPATCHED,
      dispatchedAt: serverTimestamp(),
      notifications: [
        ...(tx.notifications || []),
        { type: "item_dispatched", at: new Date().toISOString(), channel: "simulated_sms_email" },
      ],
      updatedAt: serverTimestamp(),
    });
    await load();
  }

  async function startInspection() {
    const inspectionEnds = new Date();
    inspectionEnds.setHours(inspectionEnds.getHours() + INSPECTION_PERIOD_HOURS);
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, id), {
      status: ESCROW_STATUS.INSPECTION,
      inspectionStartedAt: serverTimestamp(),
      inspectionEndsAt: inspectionEnds.toISOString(),
      notifications: [
        ...(tx.notifications || []),
        { type: "inspection_start", at: new Date().toISOString(), channel: "simulated_sms_email" },
      ],
      updatedAt: serverTimestamp(),
    });
    await load();
  }

  async function verifyAndRelease() {
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, id), {
      status: ESCROW_STATUS.RELEASED,
      verifiedAt: serverTimestamp(),
      releasedAt: serverTimestamp(),
      notifications: [
        ...(tx.notifications || []),
        { type: "funds_released", at: new Date().toISOString(), channel: "simulated_sms_email" },
      ],
      updatedAt: serverTimestamp(),
    });
    setMessage("Funds released to seller. Transaction complete.");
    await load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p>Transaction not found.</p>
        <Link href="/dashboard" className="mt-4 text-teal-600">
          My Deals
        </Link>
      </div>
    );
  }

  const isBuyer = user?.uid === tx.buyerId;
  const isSeller = user?.uid === tx.sellerId;
  const stepIndex = STEPS.findIndex((s) => s.key === tx.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-2 text-teal-800">
        <Shield className="h-8 w-8" />
        <h1 className="text-2xl font-bold">TRUSTKAR Escrow Checkout</h1>
      </div>

      {ad && (
        <div className="mt-6 flex gap-4 rounded-xl border bg-white p-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            <Image
              src={ad.mainImage || ad.images?.[0] || "/placeholder-ad.svg"}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold">{ad.title || tx.adTitle}</p>
            <p className="text-lg font-bold text-teal-700">{formatPrice(tx.amount)}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      <ol className="mt-8 space-y-2">
        {STEPS.map((step, i) => (
          <li
            key={step.key}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              i <= stepIndex ? "bg-teal-50 text-teal-900" : "text-slate-400"
            }`}
          >
            {i < stepIndex ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <span className="flex h-4 w-4 items-center justify-center rounded-full border text-xs">
                {i + 1}
              </span>
            )}
            {step.label}
          </li>
        ))}
      </ol>

      {tx.milestonePlan && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">
          Milestone: {formatPrice(tx.milestonePlan.upfrontAmount)} upfront,{" "}
          {formatPrice(tx.milestonePlan.finalAmount)} on release.
        </div>
      )}

      {message && (
        <p className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{message}</p>
      )}

      {/* Buyer: pay */}
      {isBuyer && tx.status === ESCROW_STATUS.PAYMENT_PENDING && (
        <div className="mt-8 space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Complete payment</h2>
          <p className="text-sm text-slate-600">
            Pay via EasyPaisa, JazzCash, or bank transfer. Upload receipt for automated
            reconciliation.
          </p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  paymentMethod === m.id
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-200"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-300 p-6 hover:border-teal-400">
            <Upload className="h-8 w-8 text-slate-400" />
            <span className="mt-2 text-sm">Upload receipt screenshot</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setReceiptFile(e.target.files?.[0])}
            />
          </label>
          {receiptFile && <p className="text-xs text-slate-500">{receiptFile.name}</p>}
          <button
            type="button"
            onClick={confirmPayment}
            disabled={uploading}
            className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Confirm — Hold funds in escrow"}
          </button>
        </div>
      )}

      {/* Seller: dispatch */}
      {isSeller && tx.status === ESCROW_STATUS.FUNDS_HELD && (
        <button
          type="button"
          onClick={markDispatched}
          className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white"
        >
          Mark item dispatched
        </button>
      )}

      {/* Buyer: start inspection */}
      {isBuyer && tx.status === ESCROW_STATUS.DISPATCHED && (
        <button
          type="button"
          onClick={startInspection}
          className="mt-6 w-full rounded-xl bg-amber-500 py-3 font-semibold text-white"
        >
          Item received — Start {INSPECTION_PERIOD_HOURS}h inspection
        </button>
      )}

      {/* Buyer: release */}
      {isBuyer && tx.status === ESCROW_STATUS.INSPECTION && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={verifyAndRelease}
            className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white"
          >
            Verified / Received — Release funds
          </button>
          <Link
            href={`/disputes/new?tx=${id}`}
            className="block text-center text-sm text-red-600 hover:underline"
          >
            Raise dispute instead
          </Link>
        </div>
      )}

      {tx.status === ESCROW_STATUS.RELEASED && (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-center text-green-800">
          <CheckCircle className="mx-auto h-8 w-8" />
          <p className="mt-2 font-semibold">TRUSTKAR escrow complete</p>
        </div>
      )}

      <Link href="/dashboard" className="mt-8 block text-center text-sm text-teal-600">
        ← Back to My Deals
      </Link>
    </div>
  );
}
