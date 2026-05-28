"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, ESCROW_STATUS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { uploadImagesToCloudinary } from "@/lib/cloudinary";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function NewDisputeForm() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("tx");
  const { user } = useAuth();
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!txId || !user) {
      setError("Missing transaction.");
      return;
    }

    setSubmitting(true);
    try {
      const txSnap = await getDoc(doc(db, COLLECTIONS.TRANSACTIONS, txId));
      if (!txSnap.exists()) throw new Error("Transaction not found");
      const tx = txSnap.data();

      let evidenceUrls = [];
      if (files.length) {
        const uploaded = await uploadImagesToCloudinary(files, { folder: "trustkar/disputes" });
        evidenceUrls = uploaded.map((u) => u.secureUrl);
      }

      const disputeRef = await addDoc(collection(db, COLLECTIONS.DISPUTES), {
        transactionId: txId,
        buyerId: tx.buyerId,
        sellerId: tx.sellerId,
        raisedBy: user.uid,
        reason,
        description,
        evidenceUrls,
        status: "open",
        adminAssigned: false,
        responseDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, txId), {
        status: ESCROW_STATUS.DISPUTED,
        disputeId: disputeRef.id,
        updatedAt: serverTimestamp(),
      });

      router.push(`/disputes/${disputeRef.id}`);
    } catch (err) {
      setError(err.message || "Failed to open dispute");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold">Raise Dispute</h1>
      <p className="mt-2 text-sm text-slate-600">
        This pauses fund release. Upload photos, unboxing video screenshots, or chat evidence.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border bg-white p-6">
        <input
          required
          placeholder="Short reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <textarea
          required
          rows={4}
          placeholder="Detailed description of the issue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <div>
          <label className="text-sm font-medium">Evidence (photos)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block w-full text-sm"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Open dispute — pause escrow"}
        </button>
      </form>
      <Link href="/dashboard" className="mt-4 block text-center text-sm text-teal-600">
        Cancel
      </Link>
    </div>
  );
}

export default function NewDisputePage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-20 h-10 w-10 animate-spin text-teal-600" />}>
      <NewDisputeForm />
    </Suspense>
  );
}
