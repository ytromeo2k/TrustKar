"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createSupportTicket } from "@/lib/firestore-helpers";
import { useToast } from "@/context/ToastContext";
import { Mail, KeyRound, MessageCircle, Loader2 } from "lucide-react";

export default function SupportPage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Please write your message", "error");
      return;
    }
    setLoading(true);
    try {
      await createSupportTicket({
        userId: user?.uid || "guest",
        email: user?.email || profile?.email || "not provided",
        subject: subject.trim() || "Support request",
        message: message.trim(),
        type,
      });
      showToast("Message sent! Our team will contact you.", "success");
      setSubject("");
      setMessage("");
    } catch {
      showToast("Could not send. Email help@trustkar.pk", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tk-container py-10">
      <h1 className="text-3xl font-black text-slate-900">Help & Support</h1>
      <p className="mt-2 text-slate-600">Forgot password? Account issues? Escrow questions? We are here.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="tk-card space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-cyan-50 p-4">
            <KeyRound className="h-6 w-6 shrink-0 text-cyan-600" />
            <div>
              <h2 className="font-bold text-slate-900">Forgot password?</h2>
              <p className="mt-1 text-sm text-slate-600">
                Use our automated reset — or contact us if you no longer have email access.
              </p>
              <Link href="/auth/forgot-password" className="mt-2 inline-block text-sm font-bold text-cyan-700 hover:underline">
                Reset password →
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Mail className="h-6 w-6 shrink-0 text-slate-600" />
            <div>
              <p className="font-bold">help@trustkar.pk</p>
              <p className="text-sm text-slate-500">Mon–Sat 9am–6pm PKT</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="tk-card space-y-4">
          <h2 className="flex items-center gap-2 font-bold">
            <MessageCircle size={20} /> Contact support
          </h2>
          <select value={type} onChange={(e) => setType(e.target.value)} className="tk-input">
            <option value="general">General</option>
            <option value="password">Password / Login</option>
            <option value="escrow">Escrow / Payment</option>
            <option value="dispute">Dispute</option>
            <option value="account">Account ban / verification</option>
          </select>
          <input
            className="tk-input"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="tk-input min-h-[140px]"
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="tk-btn-primary w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send to TrustKar team"}
          </button>
        </form>
      </div>

      <section id="terms" className="tk-card mt-10 max-w-3xl text-sm text-slate-600">
        <h2 className="text-lg font-bold text-slate-900">Terms of Service</h2>
        <p className="mt-2">Use TrustKar responsibly. Fraudulent listings result in permanent bans. Escrow terms apply to all protected transactions.</p>
      </section>

      <section id="privacy" className="tk-card mt-6 max-w-3xl text-sm text-slate-600">
        <h2 className="text-lg font-bold text-slate-900">Privacy Policy</h2>
        <p className="mt-2">We store account, listing, and transaction data in Firebase. Images are hosted on Cloudinary. We do not sell your data.</p>
      </section>
    </div>
  );
}
