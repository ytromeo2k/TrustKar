"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BRAND_NAME } from "@/lib/constants";
import { Shield, Loader2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (typeof window !== "undefined") sessionStorage.removeItem("tk_logged_out");
      await login(email, password);
      router.replace(redirect);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-lg font-black text-white">
          TK
        </span>
        <h1 className="mt-4 text-2xl font-black">Welcome back</h1>
        <p className="text-sm text-slate-600">Sign in to {BRAND_NAME} — stays logged in on this device</p>
      </div>
      <form onSubmit={handleSubmit} className="tk-card mt-8 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="tk-input"
          autoComplete="email"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="tk-input"
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-sm font-bold text-cyan-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="tk-btn-primary w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        New?{" "}
        <Link href={`/auth/register?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-cyan-700 hover:underline">
          Create account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-500">
        Can&apos;t access email?{" "}
        <Link href="/support" className="text-cyan-600 hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto mt-20 h-10 w-10 animate-spin text-cyan-600" />}>
      <LoginForm />
    </Suspense>
  );
}
