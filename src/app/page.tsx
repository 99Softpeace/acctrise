"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Globe2, Menu, Phone, ShieldCheck, Sparkles, WalletCards, X } from "lucide-react";
import { useState } from "react";

const services = [
  {
    icon: BarChart3,
    title: "Social boosting",
    text: "Buy followers, likes, views, watch time, and platform growth services with clear order status."
  },
  {
    icon: Phone,
    title: "Virtual numbers",
    text: "Rent numbers for OTP verification, including USA premium options and copy-ready codes."
  },
  {
    icon: Globe2,
    title: "eSIM plans",
    text: "Activate travel data plans from the same wallet without jumping between tools."
  },
  {
    icon: WalletCards,
    title: "Wallet checkout",
    text: "Fund once, place orders faster, and keep every transaction in one simple dashboard."
  }
];

const categories = ["Social growth", "Virtual numbers", "USA premium", "eSIM plans"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="act-page">
      <header className="act-nav">
        <Link className="act-logo" href="/" aria-label="Acctrise home" onClick={() => setMenuOpen(false)}>
          <img src="/acctrise-wordmark.jpeg" alt="Acctrise" />
        </Link>

        <nav className="act-links" aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#platform">Platform</a>
          <a href="#faq">FAQ</a>
          <Link href="/auth/login">Login</Link>
        </nav>

        <Link className="act-nav-cta" href="/auth/signup">Sign up</Link>

        <button className="act-menu" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className={`act-mobile-menu ${menuOpen ? "open" : ""}`}>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
        </div>
      </header>

      <section className="act-hero" aria-labelledby="hero-title">
        <div className="act-floating-icons" aria-hidden="true">
          <span><BarChart3 size={20} /></span>
          <span><Phone size={20} /></span>
          <span><Globe2 size={20} /></span>
          <span><WalletCards size={20} /></span>
        </div>

        <div className="act-pill"><Sparkles size={14} /> All your digital services in one wallet</div>
        <h1 id="hero-title">Your simple wallet for digital services.</h1>
        <p>Buy social media services, virtual numbers, USA premium numbers, and eSIM plans from one clean Acctrise dashboard.</p>
        <div className="act-hero-actions">
          <Link className="act-primary" href="/auth/signup">Get started <ArrowRight size={16} /></Link>
          <Link className="act-secondary" href="/auth/login">Login</Link>
        </div>

        <div className="act-mini-trust" aria-label="Service categories">
          {categories.map((item) => <span key={item}>{item}</span>)}
        </div>

        <div className="act-landscape" aria-hidden="true">
          <div className="act-cloud cloud-one" />
          <div className="act-cloud cloud-two" />
          <div className="act-hill hill-back" />
          <div className="act-hill hill-front" />
          <div className="act-dashboard-card">
            <span>Wallet balance</span>
            <strong>Ready</strong>
            <small>Fast checkout enabled</small>
          </div>
        </div>
      </section>

      <section id="services" className="act-services">
        <div className="act-section-head">
          <span>Services</span>
          <h2>Everything Acctrise offers, kept clear.</h2>
        </div>
        <div className="act-service-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className="act-service-card" key={service.title}>
                <div><Icon size={24} /></div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="platform" className="act-platform">
        <div className="act-platform-copy">
          <span>Platform</span>
          <h2>Built for quick orders, wallet funding, and visible fulfillment.</h2>
          <p>No noisy marketplace layout. Choose a service, enter your link or number request, see the price, and track the order from your dashboard.</p>
          <Link className="act-primary" href="/auth/signup">Create account <ArrowRight size={16} /></Link>
        </div>
        <div className="act-platform-preview" aria-label="Acctrise dashboard preview">
          <div className="act-preview-top"><span>Acctrise</span><b>Live</b></div>
          <div className="act-preview-balance"><span>Available wallet</span><strong>NGN 0.00</strong></div>
          <div className="act-preview-row"><span>Instagram followers</span><b>Processing</b></div>
          <div className="act-preview-row"><span>USA premium number</span><b>Ready</b></div>
          <div className="act-preview-row"><span>eSIM plan</span><b>Active</b></div>
        </div>
      </section>

      <section id="faq" className="act-final">
        <ShieldCheck size={28} />
        <h2>Start with a secure wallet.</h2>
        <p>Create your account, fund your wallet, and buy the digital services you need without confusion.</p>
        <Link className="act-primary" href="/auth/signup">Sign up <ArrowRight size={16} /></Link>
      </section>

      <footer className="act-footer">
        <img src="/acctrise-wordmark.jpeg" alt="Acctrise" />
        <span>&copy; 2026 Acctrise. All rights reserved.</span>
      </footer>
    </main>
  );
}