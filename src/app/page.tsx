"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type ViewId = "overview" | "orders" | "numbers" | "catalog" | "wallet";
type StatusCell = { label: string; variant?: string };
type TableCell = string | StatusCell;

const heroOrders = [
  ["Instagram followers", "Processing"],
  ["Telegram OTP", "Code ready"],
  ["Wallet top-up", "Complete"]
];

const navItems: Array<{ id: ViewId; label: string }> = [
  { id: "overview", label: "Home" },
  { id: "orders", label: "Orders" },
  { id: "numbers", label: "OTP Inbox" },
  { id: "catalog", label: "Services" },
  { id: "wallet", label: "Wallet" }
];

const orders = [
  ["AC-9201", "Instagram followers", "7,500", "$42.60", "Processing", ""],
  ["AC-9200", "Telegram members", "2,000", "$18.10", "Waiting", "waiting"],
  ["AC-9199", "TikTok views", "50,000", "$31.40", "Delivered", "done"],
  ["AC-9198", "YouTube watch time", "900h", "$74.20", "Processing", ""]
];

const numbers = [
  { id: "VN-2048", app: "Telegram", country: "Poland", number: "+48 572 118 904", code: "482-901", time: "41s" },
  { id: "VN-2047", app: "WhatsApp", country: "Brazil", number: "+55 11 98422 7710", code: "918-044", time: "2m 12s" },
  { id: "VN-2046", app: "Google", country: "United States", number: "+1 415 290 1774", code: "663-210", time: "5m 03s" }
];

const services = [
  ["Instagram followers", "High-retention social growth", "$0.0056 / unit"],
  ["TikTok views", "Fast views for campaigns", "$0.0008 / unit"],
  ["Telegram members", "Group and channel growth", "$0.0091 / unit"],
  ["USA SMS verification", "Recommended number route", "$0.84 / rental"],
  ["Poland SMS verification", "Fresh OTP inventory", "$0.42 / rental"],
  ["Reseller bundle", "Services for client sellers", "$115 / pack"]
];

function scrollToSection(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Status({ label, variant = "" }: StatusCell) {
  return <span className={`status ${variant}`}>{label}</span>;
}

function DataTable({ columns, rows }: { columns: string[]; rows: TableCell[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>
                  {typeof cell === "string" ? cell : <Status {...cell} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuickOrder({ onAction }: { onAction: (action: string) => void }) {
  return (
    <aside className="order-box">
      <div className="card-title" style={{ padding: 0, border: 0 }}>
        <h3>Quick order</h3>
      </div>
      <label className="field">
        <span>Service</span>
        <select defaultValue="Instagram followers">
          <option>Instagram followers</option>
          <option>TikTok views</option>
          <option>Telegram OTP number</option>
          <option>Reseller bundle</option>
        </select>
      </label>
      <label className="field">
        <span>Link or app</span>
        <input placeholder="Paste profile link or choose app" />
      </label>
      <label className="field">
        <span>Quantity</span>
        <input type="number" defaultValue="2500" />
      </label>
      <div className="quote">
        <span>Estimated price</span>
        <strong>$14.00</strong>
      </div>
      <button className="btn btn-primary" type="button" onClick={() => onAction("submit-order")}>
        Place order
      </button>
    </aside>
  );
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewId>("overview");
  const [selectedNumber, setSelectedNumber] = useState(numbers[0]);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);

  function toast(message: string) {
    const id = Date.now();
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3400);
  }

  function handleAction(action: string) {
    const messages: Record<string, string> = {
      start: "Account setup opened. Welcome to acctrise.",
      fund: "Funding screen ready. Add funds to start ordering.",
      "new-order": "Choose a service and place your order in seconds.",
      "submit-order": "Order placed. Your dashboard will track the progress.",
      "copy-code": `OTP ${selectedNumber.code} copied.`,
      "order-social": "Social media services are ready to order.",
      "rent-number": "Number rental is ready. Choose app and country.",
      "browse-market": "Marketplace opened. Pick a service to resell or buy.",
      refresh: "Orders refreshed.",
      support: "Support is online and ready to help."
    };

    toast(messages[action] || "Action ready.");
  }

  function switchView(view: ViewId) {
    setCurrentView(view);
    scrollToSection("#dashboard");
  }

  const orderRows = orders.map(([id, service, qty, cost, state, variant]) => [
    id,
    service,
    qty,
    cost,
    { label: state, variant }
  ]);

  const dashboardViews: Record<ViewId, ReactNode> = {
    overview: (
      <>
        <section className="app-grid" aria-label="Account summary">
          <article className="app-card"><span>Wallet balance</span><strong>$12,840</strong><small>Ready for new orders</small></article>
          <article className="app-card"><span>Active orders</span><strong>24</strong><small>12 moving fast today</small></article>
          <article className="app-card"><span>OTP numbers</span><strong>17</strong><small>6 codes received</small></article>
          <article className="app-card"><span>Services</span><strong>600+</strong><small>Updated daily</small></article>
        </section>
        <section className="preview-grid">
          <article className="table-card">
            <div className="card-title">
              <h3>Recent orders</h3>
              <button className="btn btn-soft" type="button" onClick={() => handleAction("refresh")}>Refresh</button>
            </div>
            <DataTable columns={["Order", "Service", "Qty", "Cost", "Status"]} rows={orderRows} />
          </article>
          <QuickOrder onAction={handleAction} />
        </section>
      </>
    ),
    orders: (
      <section className="preview-grid">
        <article className="table-card">
          <div className="card-title">
            <h3>All orders</h3>
            <button className="btn btn-primary" type="button" onClick={() => handleAction("new-order")}>New order</button>
          </div>
          <DataTable columns={["Order", "Service", "Qty", "Cost", "Status"]} rows={orderRows} />
        </article>
        <QuickOrder onAction={handleAction} />
      </section>
    ),
    numbers: (
      <section className="otp-layout">
        <div className="otp-list">
          {numbers.map((item) => (
            <button
              className={`otp-item ${item.id === selectedNumber.id ? "active" : ""}`}
              type="button"
              key={item.id}
              onClick={() => setSelectedNumber(item)}
            >
              <b>{item.app} - {item.country}</b>
              <span>{item.number}</span>
              <span>{item.time} remaining</span>
            </button>
          ))}
        </div>
        <article className="otp-view">
          <div>
            <span className="badge light">{selectedNumber.app} code</span>
            <div className="code">{selectedNumber.code}</div>
            <p>{selectedNumber.country} number {selectedNumber.number} is active for {selectedNumber.time}. Copy the code before it expires.</p>
            <button className="btn btn-primary" type="button" onClick={() => handleAction("copy-code")}>Copy OTP</button>
          </div>
        </article>
      </section>
    ),
    catalog: (
      <section className="catalog-grid">
        {services.map(([title, desc, price]) => (
          <article className="catalog-item" key={title}>
            <b>{title}</b>
            <span>{desc}</span>
            <strong>{price}</strong>
            <button className="btn btn-soft" type="button" style={{ marginTop: 16 }} onClick={() => handleAction("new-order")}>Order now</button>
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
            rows={[
              ["Wallet top-up", "Card", "+$3,000", { label: "Complete", variant: "done" }],
              ["Instagram order", "Wallet", "-$42.60", { label: "Paid", variant: "done" }],
              ["OTP rental", "Wallet", "-$2.10", { label: "Paid", variant: "done" }],
              ["Refund", "Auto", "+$0.48", { label: "Complete", variant: "done" }]
            ]}
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
              <span className="badge">#1 growth wallet for creators, vendors, and resellers</span>
              <h1>Boost your digital presence instantly.</h1>
              <p>
                Buy social media services, rent OTP numbers, fund your wallet, and manage every order from one bright,
                simple acctrise account.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary btn-large" href="/auth/signup">Create free account</Link>
                <button className="btn btn-white btn-large" type="button" onClick={() => scrollToSection("#services")}>View services</button>
              </div>
              <div className="hero-trust" aria-label="Platform highlights">
                <span>Instant delivery</span>
                <span>24/7 support</span>
                <span>Secure wallet</span>
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
                  <button type="button" onClick={() => switchView("orders")}><b>Social</b><span>Followers, likes, views</span></button>
                  <button type="button" onClick={() => switchView("numbers")}><b>Numbers</b><span>OTP inbox ready</span></button>
                  <button type="button" onClick={() => switchView("catalog")}><b>Market</b><span>Resell services</span></button>
                  <button type="button" onClick={() => switchView("wallet")}><b>Wallet</b><span>Track spending</span></button>
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
          <div><strong>600+</strong><span>Services available</span></div>
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
              <h3>Social media growth</h3>
              <p>Followers, likes, views, members, comments, watch time, and more for popular platforms.</p>
              <ul>
                <li>Instagram, TikTok, YouTube, X</li>
                <li>Fast starts and clear order status</li>
                <li>Great for creators, vendors, agencies</li>
              </ul>
              <button className="btn btn-card" type="button" onClick={() => handleAction("order-social")}>Order social service</button>
            </article>
            <article className="service-card number-card">
              <div className="service-icon">#</div>
              <h3>Verification numbers</h3>
              <p>Rent virtual numbers for SMS codes and view OTP messages from a clean inbox.</p>
              <ul>
                <li>WhatsApp, Telegram, Google, and more</li>
                <li>Country selection and rental timer</li>
                <li>Copy OTP with one click</li>
              </ul>
              <button className="btn btn-card" type="button" onClick={() => handleAction("rent-number")}>Rent number</button>
            </article>
            <article className="service-card market-card">
              <div className="service-icon">M</div>
              <h3>Digital marketplace</h3>
              <p>Buy or resell services with wallet history, pricing tools, and optional API access later.</p>
              <ul>
                <li>Ready-to-sell services</li>
                <li>Better rates for resellers</li>
                <li>Simple wallet and purchase records</li>
              </ul>
              <button className="btn btn-card" type="button" onClick={() => handleAction("browse-market")}>Browse marketplace</button>
            </article>
          </div>
        </section>

        <section id="how" className="section how-section">
          <div className="section-head">
            <span className="badge light">How it works</span>
            <h2>Three simple steps. That is the whole magic.</h2>
          </div>
          <div className="steps">
            <article><span>01</span><h3>Create account</h3><p>Sign up in seconds and enter your acctrise dashboard.</p></article>
            <article><span>02</span><h3>Add funds</h3><p>Top up your wallet with your preferred payment method.</p></article>
            <article><span>03</span><h3>Place order</h3><p>Choose a service, confirm the price, and track delivery live.</p></article>
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
                    onClick={() => switchView(item.id)}
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
                  <button className="btn btn-primary" type="button" onClick={() => handleAction("new-order")}>New order</button>
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
              acctrise is designed to feel alive. Service prices, number availability, wallet history, and order updates
              stay visible so users always have a reason to come back.
            </p>
          </div>
          <div className="update-list">
            <div><b>New</b><span>TikTok views restocked</span></div>
            <div><b>Hot</b><span>USA WhatsApp numbers available</span></div>
            <div><b>Deal</b><span>Reseller bundle discount active</span></div>
          </div>
        </section>

        <section id="faq" className="section faq-section">
          <div className="section-head center">
            <span className="badge light">Questions</span>
            <h2>Clear answers before users pay.</h2>
          </div>
          <div className="faq-grid">
            <details open><summary>What can I buy on acctrise?</summary><p>Social media growth services, virtual SMS numbers for verification, and digital marketplace services.</p></details>
            <details><summary>How do verification numbers work?</summary><p>Choose an app and country, rent a number, then copy the OTP code when it arrives in your inbox.</p></details>
            <details><summary>How fast do orders start?</summary><p>Many services start within seconds or minutes. Each order shows its current status in your dashboard.</p></details>
            <details><summary>Can I resell services?</summary><p>Yes. acctrise includes marketplace tools and reseller-friendly pricing for users who serve clients.</p></details>
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


