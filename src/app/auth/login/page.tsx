"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    setMessage("Opening dashboard...");
    router.replace((result?.url || callbackUrl) as any);
  }

  return (
    <main className="auth-clean-page">
      <header className="auth-clean-header">
        <Link className="auth-clean-logo" href="/" aria-label="Acctrise home">
          <img src="/acctrise-logo.jpeg" alt="Acctrise" />
        </Link>
        <Link className="auth-clean-header-link" href="/auth/signup">Sign up</Link>
      </header>

      <form className="auth-clean-card" onSubmit={handleSubmit}>
        <div className="auth-clean-head">
          <span>Login</span>
          <h1>Access your wallet</h1>
        </div>

        <label className="auth-clean-field" htmlFor="email">
          <span>Email</span>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
        </label>

        <label className="auth-clean-field" htmlFor="password">
          <span>Password</span>
          <div className="auth-password-control">
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        <div className="auth-clean-row">
          <Link href="/auth/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className="auth-clean-alert error">{error}</p>}
        {message && <p className="auth-clean-alert success">{message}</p>}

        <button className="auth-clean-submit" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Login"}</button>
        <p className="auth-clean-switch">No account? <Link href="/auth/signup">Sign up</Link></p>
      </form>

      <footer className="auth-clean-footer">
        <div>
          <img src="/acctrise-logo.jpeg" alt="Acctrise" />
          <p>Boost your digital presence today.</p>
        </div>
        <nav aria-label="Auth footer quick links">
          <strong>Quick Links</strong>
          <Link href="/#services">All Services</Link>
          <Link href="/auth/signup">Create Account</Link>
          <Link href={"/terms" as any}>Terms of Service</Link>
          <Link href={"/privacy" as any}>Privacy Policy</Link>
        </nav>
        <div className="auth-clean-contact">
          <strong>Contact Us</strong>
          <a href="mailto:support@acctrise.com">support@acctrise.com</a>
          <span>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon className="h-4 w-4" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon className="h-4 w-4" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInIcon className="h-4 w-4" /></a>
            <a href="mailto:support@acctrise.com" aria-label="Email support"><Mail size={16} /></a>
          </span>
        </div>
      </footer>
    </main>
  );
}
