"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Globe2,
  Headphones,
  Layers3,
  LockKeyhole,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Zap
} from "lucide-react";

type ViewId = "overview" | "boosting" | "logs" | "foreign" | "ukpremium" | "esim" | "wallet";
type StatusCell = { label: string; variant?: string };
type TableCell = string | StatusCell;

const navItems: Array<{ id: ViewId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "boosting", label: "Boosting" },
  { id: "logs", label: "Logs" },
  { id: "foreign", label: "Foreign numbers" },
  { id: "ukpremium", label: "UK premium" },
  { id: "esim", label: "eSIM" },
  { id: "wallet", label: "Wallet" }
];

const heroOrders = [
  ["Instagram followers", "Processing"],
  ["Telegram OTP", "Code ready"],
  ["Wallet top-up", "Complete"]
];

const summaryCards = [
  ["Wallet balance", "$12,840", "Ready for new orders"],
  ["Active orders", "24", "Live tracking enabled"],
  ["Live numbers", "17", "Country routing active"],
  ["Available services", "620+", "Updated hourly"]
];

const recentOrders = [
  ["AC-9201", "Instagram followers", "7,500", "$42.60", "Processing", ""],
  ["AC-9200", "Telegram members", "2,000", "$18.10", "Waiting", "waiting"],
  ["AC-9199", "TikTok views", "50,000", "$31.40", "Delivered", "done"],
  ["AC-9198", "YouTube watch time", "900h", "$74.20", "Processing", ""]
];

const boostingPackages = [
  {
    title: "Instagram engagement",
    description: "Followers, likes, comments, story views with fast delivery.",
    price: "$0.0056 / unit",
    status: "Priority boosting"
  },
  {
    title: "Telegram growth",
    description: "Members, channel joiners and post impressions for any audience.",
    price: "$0.0091 / unit",
    status: "Reseller ready"
  },
  {
    title: "TikTok visibility",
    description: "Views, watch time, and engagement for trending content.",
    price: "$0.0008 / unit",
    status: "High retention"
  }
];

const logRows = [
  ["LOG-2041", "Inventory refresh", "Account marketplace", { label: "Completed", variant: "done" }, "Jun 24"],
  ["LOG-2037", "Number sync", "Verification services", { label: "Live", variant: "" }, "Jun 24"],
  ["LOG-2032", "Service update", "Digital accounts", { label: "Pending", variant: "waiting" }, "Jun 23"],
  ["LOG-2028", "Premium batch", "UK numbers", { label: "Completed", variant: "done" }, "Jun 22"]
];

const foreignNumbers = [
  { id: "VN-2048", app: "Telegram", country: "Poland", number: "+48 572 118 904", price: "$0.82/hr" },
  { id: "VN-2047", app: "WhatsApp", country: "Brazil", number: "+55 11 98422 7710", price: "$0.96/hr" },
  { id: "VN-2046", app: "Google", country: "United States", number: "+1 415 290 1774", price: "$1.20/hr" }
];

const ukPremiumNumbers = [
  { id: "UKP-021", service: "WhatsApp", number: "+44 7894 112345", price: "$4.50/hr" },
  { id: "UKP-022", service: "Telegram", number: "+44 7700 900123", price: "$4.80/hr" },
  { id: "UKP-023", service: "Google", number: "+44 7400 330122", price: "$5.20/hr" }
];

const esimPlans = [
  { title: "UK Data Pass", amount: "8 GB", validity: "15 days", price: "$24.00" },
  { title: "EU Travel Pass", amount: "12 GB", validity: "30 days", price: "$28.00" },
  { title: "Global Connect", amount: "4 GB", validity: "10 days", price: "$18.00" }
];

const walletHistoryRows = [
  ["Wallet top-up", "Card", "+$3,000", { label: "Complete", variant: "done" }],
  ["Instagram order", "Wallet", "-$42.60", { label: "Paid", variant: "done" }],
  ["OTP rental", "Wallet", "-$2.10", { label: "Paid", variant: "done" }],
  ["Refund", "Auto", "+$0.48", { label: "Complete", variant: "done" }]
];

const platformFeatures = [
  {
    icon: <Zap size={21} />,
    title: "Instant service discovery",
    text: "Browse boosting, numbers, logs, and eSIM options with clear categories and guided next steps."
  },
  {
    icon: <WalletCards size={21} />,
    title: "One wallet workflow",
    text: "Keep orders, funding, renewals, and delivery updates inside a calm user dashboard."
  },
  {
    icon: <ShieldCheck size={21} />,
    title: "Friendly fulfilment states",
    text: "Users see clean availability, support, and status messages instead of technical error details."
  }
];

const serviceCards = [
  {
    icon: <BarChart3 size={24} />,
    title: "Social media boosting",
    text: "Launch growth orders for Instagram, TikTok, YouTube, Telegram, Facebook, Spotify, and more.",
    bullets: ["Platform-first categories", "Clickable service cards", "Quantity and delivery guidance"],
    action: "Explore boosting",
    view: "boosting" as ViewId
  },
  {
    icon: <Smartphone size={24} />,
    title: "Numbers and eSIM",
    text: "Access virtual numbers, foreign OTP routes, UK premium lines, and travel-ready data plans.",
    bullets: ["Search by country or app", "Clear checkout panels", "Mobile-friendly listings"],
    action: "Browse numbers",
    view: "foreign" as ViewId
  },
  {
    icon: <Layers3 size={24} />,
    title: "Logs marketplace",
    text: "Discover premium accounts and digital inventory through a clean marketplace experience.",
    bullets: ["Search and filter inventory", "Stock and price signals", "Support-ready purchase flow"],
    action: "View logs",
    view: "logs" as ViewId
  }
];

function Status({ label, variant = "" }: StatusCell) {
  return <span className={`status ${variant}`}>{label}</span>;
}

function DataTable({ columns, rows }: { columns: string[]; rows: TableCell[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => (<th key={column}>{column}</th>))}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{typeof cell === "string" ? cell : <Status {...cell} />}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function scrollToSection(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewId>("overview");
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function toast(message: string) {
    const id = Date.now();
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  }

  function handleAction(action: string) {
    const messages: Record<string, string> = {
      start: "Account setup opened. Welcome to Acctrise.",
      fund: "Funding screen ready. Add funds to start ordering.",
      "new-order": "Choose a service and place your order in seconds.",
      submit: "Order placed. Your dashboard will track the progress.",
      "copy-code": "OTP code copied to clipboard.",
      "order-social": "Social service launch is ready.",
      "rent-number": "Number rental is ready. Choose app and country.",
      "browse-market": "Marketplace opened. Pick a service to resell or buy.",
      refresh: "Orders refreshed.",
      support: "Support is online and ready to help."
    };

    toast(messages[action] || "Action completed.");
  }

  const dashboardViews: Record<ViewId, ReactNode> = {
    overview: (
      <>
        <section className="app-grid" aria-label="dashboard summary">
          {summaryCards.map(([label, value, detail]) => (
            <article className="app-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </section>
        <section className="preview-grid">
          <article className="table-card">
            <div className="card-title">
              <h3>Recent activity</h3>
              <button className="btn btn-soft" type="button" onClick={() => handleAction("refresh")}>Refresh</button>
            </div>
            <DataTable
              columns={["Order", "Service", "Qty", "Cost", "Status"]}
              rows={recentOrders.map(([id, service, qty, cost, status, variant]) => [id, service, qty, cost, { label: status, variant }])}
            />
          </article>
          <article className="order-box">
            <div className="card-title"><h3>Quick actions</h3></div>
            <button className="btn btn-primary" type="button" onClick={() => handleAction("new-order")}>Place boosting order</button>
            <button className="btn btn-soft" type="button" onClick={() => setCurrentView("foreign")}>Browse numbers</button>
            <button className="btn btn-soft" type="button" onClick={() => setCurrentView("wallet")}>Open wallet</button>
          </article>
        </section>
      </>
    ),
    boosting: (
      <section className="catalog-grid">
        {boostingPackages.map((pack) => (
          <article className="catalog-item" key={pack.title}>
            <b>{pack.title}</b>
            <span>{pack.description}</span>
            <strong>{pack.price}</strong>
            <div className="quote"><span>{pack.status}</span></div>
            <button className="btn btn-soft" type="button" onClick={() => handleAction("order-social")}>Select package</button>
          </article>
        ))}
      </section>
    ),
    logs: (
      <article className="table-card">
        <div className="card-title">
          <h3>Service activity</h3>
          <button className="btn btn-soft" type="button" onClick={() => handleAction("refresh")}>Refresh</button>
        </div>
        <DataTable
          columns={["Log", "Update", "Area", "Status", "Date"]}
          rows={logRows}
        />
      </article>
    ),
    foreign: (
      <section className="catalog-grid">
        {foreignNumbers.map((item) => (
          <article className="catalog-item" key={item.id}>
            <b>{item.app}</b>
            <span>{item.country}</span>
            <strong>{item.number}</strong>
            <div className="quote"><span>{item.price}</span></div>
            <button className="btn btn-soft" type="button" onClick={() => handleAction("rent-number")}>Rent number</button>
          </article>
        ))}
      </section>
    ),
    ukpremium: (
      <section className="catalog-grid">
        {ukPremiumNumbers.map((item) => (
          <article className="catalog-item" key={item.id}>
            <b>{item.service}</b>
            <span>{item.id}</span>
            <strong>{item.number}</strong>
            <div className="quote"><span>{item.price}</span></div>
            <button className="btn btn-soft" type="button" onClick={() => handleAction("rent-number")}>Reserve UK number</button>
          </article>
        ))}
      </section>
    ),
    esim: (
      <section className="catalog-grid">
        {esimPlans.map((plan) => (
          <article className="catalog-item" key={plan.title}>
            <b>{plan.title}</b>
            <span>{plan.amount} - {plan.validity}</span>
            <strong>{plan.price}</strong>
            <button className="btn btn-soft" type="button" onClick={() => handleAction("fund")}>Activate eSIM</button>
          </article>
        ))}
      </section>
    ),
    wallet: (
      <section className="preview-grid">
        <article className="order-box">
          <div className="quote"><span>Available balance</span><strong>$12,840.55</strong></div>
          <label className="field"><span>Add amount</span><input defaultValue="$1,000.00" /></label>
          <label className="field"><span>Payment method</span><select defaultValue="Bank transfer"><option>Bank transfer</option><option>Card payment</option><option>Crypto invoice</option></select></label>
          <button className="btn btn-primary" type="button" onClick={() => handleAction("fund")}>Add funds</button>
        </article>
        <article className="table-card">
          <div className="card-title"><h3>Wallet history</h3><span className="status done">Secure</span></div>
          <DataTable
            columns={["Item", "Method", "Amount", "Status"]}
            rows={walletHistoryRows}
          />
        </article>
      </section>
    )
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="topbar">
        <Link className="brand" href="/" aria-label="acctrise home" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-mark"><img src="/acctrise-logo.jpeg" alt="" /></span>
          <span className="brand-word">Acctrise</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
          <a href="#dashboard">Preview</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="top-actions">
          <Link className="btn btn-soft" href="/auth/login">Login</Link>
          <Link className="btn btn-primary" href="/auth/signup">Get Started</Link>
        </div>
        <button className="mobile-menu-button" type="button" aria-expanded={mobileMenuOpen} aria-controls="mobile-home-menu" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileMenuOpen((open) => !open)}>
          <span />
          <span />
          <span />
        </button>
        <div id="mobile-home-menu" className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="#dashboard" onClick={() => setMobileMenuOpen(false)}>Preview</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <div className="mobile-menu-actions">
            <Link className="btn btn-soft" href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link className="btn btn-primary" href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-bg hero-bg-one" />
          <div className="hero-bg hero-bg-two" />
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="badge"><Sparkles size={14} /> Boosting, numbers, eSIM, logs, and digital services</span>
              <h1>Digital services that feel fast, clear, and premium.</h1>
              <p>
                Acctrise helps users buy social media boosting, rent virtual and UK premium numbers, activate eSIM plans, and access digital accounts from one polished wallet.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary btn-large" href="/auth/signup">Get Started <ArrowRight size={17} /></Link>
                <button className="btn btn-white btn-large" type="button" onClick={() => scrollToSection("#services")}>Explore Services</button>
              </div>
              <div className="hero-trust" aria-label="Platform highlights">
                <span><BadgeCheck size={15} /> Secure inventory</span>
                <span><Zap size={15} /> Fast order flow</span>
                <span><ShieldCheck size={15} /> Friendly fulfilment</span>
              </div>
            </div>

            <div className="phone-stage" aria-label="acctrise mobile dashboard preview">
              <div className="spark-card spark-one">+12,480 views</div>
              <div className="spark-card spark-two">OTP: 482-901</div>
              <div className="phone-shell">
                <div className="phone-top">
                  <img src="/acctrise-logo.jpeg" alt="" />
                  <span>Balance</span>
                </div>
                <div className="balance-card">
                  <span>Available balance</span>
                  <strong>$12,840.55</strong>
                  <button type="button" onClick={() => handleAction("fund")}>Add funds</button>
                </div>
                <div className="quick-grid">
                  <button type="button" onClick={() => setCurrentView("boosting")}><b>Boosting</b><span>Growth campaigns</span></button>
                  <button type="button" onClick={() => setCurrentView("foreign")}><b>Numbers</b><span>OTP rentals</span></button>
                  <button type="button" onClick={() => setCurrentView("esim")}><b>eSIM</b><span>Data plans</span></button>
                  <button type="button" onClick={() => setCurrentView("wallet")}><b>Wallet</b><span>Funding</span></button>
                </div>
                <div className="mini-orders">
                  {heroOrders.map(([label, state]) => (
                    <div className="mini-order" key={label}><b>{label}</b><span>{state}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-strip" aria-label="acctrise stats">
          <div><strong>120k+</strong><span>Orders completed</span></div>
          <div><strong>25k+</strong><span>Active users</span></div>
          <div><strong>620+</strong><span>Services available</span></div>
          <div><strong>98%</strong><span>Delivery success</span></div>
        </section>

        <section id="services" className="section services-section">
          <div className="section-head center">
            <span className="badge light"><Globe2 size={14} /> Everything in one wallet</span>
            <h2>Services arranged the way real users search.</h2>
            <p>Clear categories, polished cards, quick filters, and checkout flows that make digital services easy to understand.</p>
          </div>
          <div className="service-grid">
            {serviceCards.map((service, index) => (
              <article className={`service-card service-card-${index + 1}`} key={service.title}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <ul>
                  {service.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
                <button className="btn btn-card" type="button" onClick={() => setCurrentView(service.view)}>{service.action}</button>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="section how-section">
          <div className="section-head">
            <span className="badge light"><Search size={14} /> Built for simple buying</span>
            <h2>From discovery to delivery without confusion.</h2>
            <p>Acctrise keeps the technical work behind the scenes while users see clean choices, availability, and order progress.</p>
          </div>
          <div className="steps">
            {platformFeatures.map((feature, index) => (
              <article key={feature.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="step-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="dashboard" className="section dashboard-section">
          <div className="dashboard-shell">
            <aside className="dash-side">
              <img src="/acctrise-logo.jpeg" alt="acctrise" />
              <nav id="dashboard-nav" aria-label="Dashboard views">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-button ${item.id === currentView ? "active" : ""}`}
                    type="button"
                    onClick={() => setCurrentView(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="support-card">
                <strong>Need help?</strong>
                <span>Support is online 24/7.</span>
                <button className="btn btn-white" type="button" onClick={() => handleAction("support")}>Chat support</button>
              </div>
            </aside>
            <div className="dash-main">
              <div className="dash-header">
                <div>
                  <span className="badge light">Live preview</span>
                  <h2>Your Acctrise dashboard</h2>
                </div>
                <div className="dash-actions">
                  <button className="btn btn-soft" type="button" onClick={() => handleAction("fund")}>Add funds</button>
                  <button className="btn btn-primary" type="button" onClick={() => setCurrentView("boosting")}>New boosting order</button>
                </div>
              </div>
              <div>{dashboardViews[currentView]}</div>
            </div>
          </div>
        </section>

        <section className="section spotlight">
          <div>
            <span className="badge"><LockKeyhole size={14} /> Daily updates</span>
            <h2>Fresh services, cleaner pricing, better delivery.</h2>
            <p>
              Acctrise is designed to feel alive. Service availability, wallet history, and order updates stay visible so users know exactly what to do next.
            </p>
          </div>
          <div className="update-list">
            <div><b>New</b><span>TikTok views restocked</span></div>
            <div><b>Hot</b><span>UK premium numbers available</span></div>
            <div><b>Deal</b><span>Reseller bundle discount active</span></div>
          </div>
        </section>

        <section id="faq" className="section faq-section">
          <div className="section-head center">
            <span className="badge light"><Headphones size={14} /> Questions</span>
            <h2>Clear answers before users pay.</h2>
          </div>
          <div className="faq-grid">
            <details open><summary>What can I buy on Acctrise?</summary><p>Social media growth, virtual SMS numbers, UK premium numbers, logs, digital accounts, and eSIM plans.</p></details>
            <details><summary>How do verification numbers work?</summary><p>Choose an app and country, rent a number, then copy the OTP code when it arrives.</p></details>
            <details><summary>How fast do orders start?</summary><p>Many services start within seconds or minutes. Each order shows its current status.</p></details>
            <details><summary>Can I resell services?</summary><p>Yes. Acctrise supports reseller workflows, organized inventory, and clear order tracking for accountability.</p></details>
          </div>
        </section>

        <section className="section final-cta">
          <div>
            <span className="badge"><Sparkles size={14} /> Ready when users are</span>
            <h2>Launch a cleaner digital services experience.</h2>
            <p>Give customers a fast, mobile-friendly place to buy boosting, logs, numbers, eSIM, and wallet-funded services.</p>
          </div>
          <Link className="btn btn-primary btn-large" href="/auth/signup">Get Started <ArrowRight size={17} /></Link>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <Link className="brand" href="/" aria-label="acctrise home">
            <span className="brand-mark"><img src="/acctrise-logo.jpeg" alt="" /></span>
            <span className="brand-word">Acctrise</span>
          </Link>
          <p>Premium digital services, organized for normal users and built for repeat orders.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <Link href="/auth/login">Login</Link>
        </nav>
      </footer>

      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => (
          <div className="toast" key={item.id}>{item.message}</div>
        ))}
      </div>
    </>
  );
}

