"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, BRAND_NAME } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { Shield, Phone, CreditCard, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function KycPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [cnic, setCnic] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  async function verifyPhone() {
    if (otp.length !== 6) {
      setMessage("Enter 6-digit OTP (demo: any 6 digits).");
      return;
    }
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { phoneVerified: true });
    setStep(2);
    setMessage("Phone verified via SMS OTP (simulated).");
  }

  async function submitCnic() {
    if (!cnic.match(/^\d{5}-?\d{7}-?\d$/)) {
      setMessage("Enter valid CNIC format (e.g. 35202-1234567-1)");
      return;
    }
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      cnicVerified: true,
      cnicLast4: cnic.slice(-4),
    });
    setMessage("CNIC validation submitted for high-value seller status.");
    setStep(3);
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Link href="/auth/login?redirect=/auth/kyc" className="text-teal-600">
          Sign in to verify identity
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Shield className="h-8 w-8 text-teal-600" />
        {BRAND_NAME} Identity Verification
      </h1>
      <p className="mt-2 text-slate-600">
        Multi-factor KYC: SMS OTP required. CNIC recommended for high-value sellers.
      </p>

      <div className="mt-8 space-y-6">
        <div
          className={`rounded-xl border p-4 ${profile?.phoneVerified ? "border-green-300 bg-green-50" : "bg-white"}`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Phone className="h-5 w-5" />
            Step 1: Phone verification (required)
            {profile?.phoneVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          {!profile?.phoneVerified && step === 1 && (
            <div className="mt-4">
              <p className="text-sm text-slate-500">Demo OTP sent to your phone. Enter any 6 digits.</p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="mt-2 w-full rounded-lg border px-3 py-2 tracking-widest"
              />
              <button
                type="button"
                onClick={verifyPhone}
                className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
              >
                Verify OTP
              </button>
            </div>
          )}
        </div>

        <div
          className={`rounded-xl border p-4 ${profile?.cnicVerified ? "border-green-300 bg-green-50" : "bg-white"}`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-5 w-5" />
            Step 2: CNIC (optional, high-value sellers)
            {profile?.cnicVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          {profile?.phoneVerified && !profile?.cnicVerified && step >= 2 && (
            <div className="mt-4">
              <input
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="35202-1234567-1"
                className="w-full rounded-lg border px-3 py-2"
              />
              <button
                type="button"
                onClick={submitCnic}
                className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
              >
                Submit CNIC
              </button>
            </div>
          )}
        </div>
      </div>

      {message && <p className="mt-6 text-sm text-teal-700">{message}</p>}

      <p className="mt-8 text-center text-sm text-slate-500">
        Your Trust Rating: <strong>{profile?.trustRating ?? 5.0}</strong> / 5
      </p>
    </div>
  );
}
