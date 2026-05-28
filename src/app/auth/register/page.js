"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BRAND_NAME } from "@/lib/constants";
import { Shield, Loader2 } from "lucide-react";

function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, displayName, phone);
      if (typeof window !== "undefined") sessionStorage.removeItem("tk_logged_out");
      router.replace(redirect);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-sky-600" />
        <h1 className="mt-4 text-2xl font-bold">Join {BRAND_NAME}</h1>
        <p className="text-sm text-slate-600">Escrow-protected buying & selling</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <input
          required
          placeholder="Full name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          placeholder="Phone (+92...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-teal-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-20 h-10 w-10 animate-spin" />}>
      <RegisterForm />
    </Suspense>
  );
}
