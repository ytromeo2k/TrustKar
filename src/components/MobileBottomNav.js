"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, PlusCircle, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/?browse=1", icon: LayoutGrid, label: "Browse" },
  { href: "/post-ad", icon: PlusCircle, label: "Sell", accent: true },
  { href: "/dashboard?tab=chats", icon: MessageCircle, label: "Deals" },
  { href: "/dashboard", icon: User, label: "Account" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-1 pb-[max(0.5rem,var(--safe-bottom))] pt-2">
        {items.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname === href || (href === "/dashboard" && pathname.startsWith("/dashboard"));
          const loginHref = !user && (href === "/dashboard" || href === "/post-ad");
          const link = loginHref ? `/auth/login?redirect=${encodeURIComponent(href)}` : href;
          return (
            <Link
              key={href}
              href={link}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 text-[10px] font-semibold",
                accent ? "text-cyan-600" : active ? "text-cyan-600" : "text-slate-500"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  accent && "bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-md"
                )}
              >
                <Icon size={accent ? 22 : 20} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
