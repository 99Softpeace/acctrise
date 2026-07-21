import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../styles.css";

const GOOGLE_ANALYTICS_ID = "G-J5YPTDE29G";

export const metadata: Metadata = {
  title: "Acctrise | All your digital services in one wallet",
  description:
    "Acctrise helps you buy social media growth, rent verification numbers, and resell digital services from one colorful wallet.",
  icons: {
    icon: "/acctrise-mark.svg"
  },
  openGraph: {
    title: "Acctrise | All your digital services in one wallet",
    description: "Buy SMM services, rent OTP numbers, and manage orders from one account.",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Acctrise | All your digital services in one wallet",
    description: "Buy SMM services, rent OTP numbers, and manage orders from one account."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f9ff"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}


