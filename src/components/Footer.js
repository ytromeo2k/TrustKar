import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Smartphone,
  Scale,
  Lock,
  Truck,
  Star,
} from "lucide-react";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";
import { getCategoryNavLinks, getFooterSubLinks } from "@/lib/categories";

const trustLinks = [
  { label: "Why TrustKar vs Others", href: "/compare" },
  { label: "Escrow How It Works", href: "/compare#escrow" },
  { label: "My Dashboard", href: "/dashboard" },
  { label: "Dispute Center", href: "/disputes" },
  { label: "Verify KYC", href: "/auth/kyc" },
  { label: "Support & Password Help", href: "/support" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/support#terms" },
  { label: "Privacy Policy", href: "/support#privacy" },
  { label: "Escrow Policy", href: "/compare#escrow" },
];

export default function Footer() {
  const mainCats = getCategoryNavLinks();
  const subCats = getFooterSubLinks().slice(0, 8);

  return (
    <footer className="mt-auto bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="border-b border-white/10 bg-cyan-600/20">
        <div className="tk-container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Smartphone className="h-10 w-10 text-cyan-300" />
            <div>
              <p className="text-lg font-black">TrustKar Mobile App — Coming Soon</p>
              <p className="text-sm text-white/70">
                Web2App ready · Install from browser · Same escrow account
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
              Android (Soon)
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
              iOS (Soon)
            </span>
            <Link href="/" className="tk-btn-primary !text-xs">
              Use Web App Now
            </Link>
          </div>
        </div>
      </div>

      <div className="tk-container py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-black">{BRAND_NAME}</span>
            </div>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-white/65">{BRAND_TAGLINE}</p>
            <p className="mb-6 text-xs leading-relaxed text-white/45">
              Pakistan&apos;s escrow marketplace — payment held until you verify delivery. 48-hour inspection,
              dispute resolution, and verified sellers.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                [Lock, "Escrow Safe"],
                [Truck, "Courier OK"],
                [Star, "Seller Reviews"],
                [Scale, "Fair Disputes"],
              ].map(([Icon, t]) => (
                <span key={t} className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
                  <Icon size={12} className="text-cyan-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-cyan-400">Categories</h3>
            <ul className="space-y-2">
              {mainCats.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 transition hover:text-cyan-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-cyan-400">Browse More</h3>
            <ul className="space-y-2">
              {subCats.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-white/55 transition hover:text-cyan-300">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/post-ad" className="text-sm font-bold text-cyan-400 hover:text-cyan-300">
                  + Post Your Ad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-cyan-400">Trust & Help</h3>
            <ul className="space-y-2">
              {trustLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 transition hover:text-cyan-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2.5 text-sm text-white/55">
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-400" /> +92 300 TRUSTKAR
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-400" /> help@trustkar.pk
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-cyan-400" /> Karachi · Lahore · Islamabad
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved. 🇵🇰</p>
          <div className="flex flex-wrap justify-center gap-4">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-white/45 hover:text-cyan-300">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
