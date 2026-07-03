"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

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
  ["LOG-2041", "Bulkacc", "Account import", { label: "Completed", variant: "done" }, "Jun 24"],
  ["LOG-2037", "SMSPool", "Number sync", { label: "Live", variant: "" }, "Jun 24"],
  ["LOG-2032", "Bulkacc", "Usage report", { label: "Pending", variant: "waiting" }, "Jun 23"],
  ["LOG-2028", "SMSPool", "UK premium batch", { label: "Completed", variant: "done" }, "Jun 22"]
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
          <h3>Provider logs</h3>
          <button className="btn btn-soft" type="button" onClick={() => handleAction("refresh")}>Sync logs</button>
        </div>
        <DataTable
          columns={["Log", "Provider", "Task", "Status", "Date"]}
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
            <span>{plan.amount} • {plan.validity}</span>
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
        <Link className="brand" href="/" aria-label="acctrise home">
          <img src="/acctrise-logo.jpeg" alt="acctrise" />
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="top-actions">
          <Link className="btn btn-soft" href="/auth/login">Login</Link>
          <Link className="btn btn-primary" href="/auth/signup">Get Started</Link>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-bg hero-bg-one" />
          <div className="hero-bg hero-bg-two" />
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="badge">Boosting, logs, numbers, and eSIM in one place</span>
              <h1>Professional digital services without the dark interface.</h1>
              <p>
                Manage boosting, verification numbers, UK premium lines, and eSIM plans from a clean light dashboard built for vendors and resellers.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary btn-large" href="/auth/signup">Create free account</Link>
                <button className="btn btn-white btn-large" type="button" onClick={() => scrollToSection("#dashboard")}>Open dashboard</button>
              </div>
              <div className="hero-trust" aria-label="Platform highlights">
                <span>Best-in-class providers</span>
                <span>Fast service sync</span>
                <span>Clean light design</span>
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
            <span className="badge light">Everything in one wallet</span>
            <h2>Pick what you need and order in seconds.</h2>
            <p>No confusing panels. No boring screens. Just clear services, fast checkout, and visible progress.</p>
          </div>
          <div className="service-grid">
            <article className="service-card social-card">
              <div className="service-icon">S</div>
              <h3>Boosting</h3>
              <p>High-performance growth packages for social accounts and reseller clients.</p>
              <ul>
                <li>Instagram, TikTok, Telegram, YouTube</li>
                <li>Fast delivery and daily status updates</li>
                <li>Vendor-ready workflows</li>
              </ul>
              <button className="btn btn-card" type="button" onClick={() => setCurrentView("boosting")}>View boosting</button>
            </article>
            <article className="service-card number-card">
              <div className="service-icon">#</div>
              <h3>Verification numbers</h3>
              <p>Rent foreign, UK premium, and SMSPool number inventory with live OTP support.</p>
              <ul>
                <li>eSIM, virtual numbers, UK premium routing</li>
                <li>Simple OTP inbox and copy options</li>
                <li>Fast onboarding for all providers</li>
              </ul>
              <button className="btn btn-card" type="button" onClick={() => setCurrentView("foreign")}>Browse numbers</button>
            </article>
            <article className="service-card market-card">
              <div className="service-icon">P</div>
              <h3>Partner logs</h3>
              <p>Track provider syncs, number inventory, and service logs from Bulkacc and SMSPool.</p>
              <ul>
                <li>Audit-ready event history</li>
                <li>Provider status and sync details</li>
                <li>Clear log structure for teams</li>
              </ul>
              <button className="btn btn-card" type="button" onClick={() => setCurrentView("logs")}>Open logs</button>
            </article>
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
                  <h2>Your acctrise dashboard</h2>
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
            <span className="badge">Daily updates</span>
            <h2>Fresh services, cleaner prices, better delivery.</h2>
            <p>
              acctrise is designed to feel alive. Service prices, number availability, wallet history, and order updates stay visible so users always have a reason to come back.
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
            <span className="badge light">Questions</span>
            <h2>Clear answers before users pay.</h2>
          </div>
          <div className="faq-grid">
            <details open><summary>What can I buy on acctrise?</summary><p>Social media growth, virtual SMS numbers, UK premium numbers, and eSIM plans.</p></details>
            <details><summary>How do verification numbers work?</summary><p>Choose an app and country, rent a number, then copy the OTP code when it arrives.</p></details>
            <details><summary>How fast do orders start?</summary><p>Many services start within seconds or minutes. Each order shows its current status.</p></details>
            <details><summary>Can I resell services?</summary><p>Yes. acctrise supports reseller workflows and provider logs for accountability.</p></details>
          </div>
        </section>
      </main>

      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => (
          <div className="toast" key={item.id}>{item.message}</div>
        ))}
      </div>
    </>
  );
}
