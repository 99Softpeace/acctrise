"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ChevronDown, Globe2, Mail, Menu, Phone, ShieldCheck, Sparkles, WalletCards, X } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/social-icons";
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
const faqs = [
  { question: "What services can I buy on Acctrise?", answer: "You can buy social media growth services, rent virtual and USA premium numbers, purchase eSIM plans, and manage everything from one wallet." },
  { question: "How do I fund my wallet?", answer: "Log in, open Fund Wallet in your dashboard, choose an available payment method, and follow the payment instructions. Your balance updates after confirmation." },
  { question: "How quickly are orders delivered?", answer: "Delivery time depends on the service you choose. You can follow the live status of every purchase from My Orders in your dashboard." },
  { question: "Where will I receive my verification code?", answer: "Keep the number order open after renting it. Your verification code will appear on that screen as soon as the provider delivers it." },
  { question: "What should I do if an order is delayed?", answer: "Check My Orders for an updated status first. If it remains delayed beyond the expected delivery window, contact support with your order reference." },
  { question: "How can I contact support?", answer: "Email support@acctrise.com with your account email and order reference. Never include your password or sensitive verification codes." }
];

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

      <section id="faq" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><ShieldCheck size={25} /></span>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">Frequently asked questions</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">We answered some of the most frequently asked questions about our panel.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Everything you need to know about your wallet, orders, virtual numbers, delivery, and support.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition open:border-blue-200 open:bg-white open:shadow-lg open:shadow-blue-950/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-extrabold text-slate-900 marker:hidden">
                  {faq.question}
                  <ChevronDown className="h-5 w-5 shrink-0 text-blue-600 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-4 border-t border-slate-200 pt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="act-footer">
        <div className="act-footer-brand">
          <img src="/acctrise-wordmark.jpeg" alt="Acctrise" />
          <h2>Acctrise</h2>
          <p>Boost your digital presence today.</p>
          <div className="act-social-links" aria-label="Social media links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon className="h-4 w-4" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon className="h-4 w-4" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInIcon className="h-4 w-4" /></a>
            <a href="mailto:support@acctrise.com" aria-label="Email support"><Mail size={18} /></a>
          </div>
        </div>

        <div className="act-footer-column">
          <h3>Quick Links</h3>
          <a href="#services">All Services</a>
          <Link href="/auth/signup">Create Account</Link>
          <Link href="/auth/login">Login</Link>
          <a href="#faq">Frequently Asked Questions</a>
          <Link href={"/privacy" as any}>Privacy Policy</Link>
          <Link href={"/terms" as any}>Terms of Service</Link>
        </div>

        <div className="act-footer-column">
          <h3>Contact Us</h3>
          <a href="mailto:support@acctrise.com">support@acctrise.com</a>
          <span>Available for wallet, orders, and service support.</span>
        </div>

        <div className="act-footer-bottom">
          <span>&copy; 2026 Acctrise. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
