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
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject = t;
              var ttq = w[t] = w[t] || [];
              ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
              ttq.setAndDefer = function (t, e) {
                t[e] = function () {
                  t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                };
              };
              for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
              ttq.instance = function (t) {
                for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
                return e;
              };
              ttq.load = function (e, n) {
                var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
                var o = n && n.partner;
                ttq._i = ttq._i || {};
                ttq._i[e] = [];
                ttq._i[e]._u = r;
                ttq._t = ttq._t || {};
                ttq._t[e] = +new Date;
                ttq._o = ttq._o || {};
                ttq._o[e] = n || {};
                n = document.createElement("script");
                n.type = "text/javascript";
                n.async = !0;
                n.src = r + "?sdkid=" + e + "&lib=" + t;
                e = document.getElementsByTagName("script")[0];
                e.parentNode.insertBefore(n, e);
              };
              ttq.load("D9SOVH3C77U75PNH499G");
              ttq.page();
            }(window, document, "ttq");
          `}
        </Script>
      </body>
    </html>
  );
}


