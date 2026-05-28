import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import BackToTop from "@/components/BackToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "TrustKar | Buy & Sell Securely with Escrow",
  description:
    "Pakistan's escrow-protected marketplace. Funds held until delivery verified. Buy phones, vehicles, electronics & more with confidence.",
  keywords: ["TrustKar", "escrow", "marketplace", "Pakistan", "OLX alternative", "safe buying"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrustKar",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00b4d8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 pb-mobile-nav md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
            <BackToTop />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
