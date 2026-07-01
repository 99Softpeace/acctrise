import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  variant?: "landing" | "dashboard";
  transparent?: boolean;
}

export function Header({ variant = "landing", transparent = false }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 p-1 flex items-center justify-center overflow-hidden">
              <Image
                src="/acctrise-logo.jpeg"
                alt="Acctrise"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-md drop-shadow-lg"
              />
            </div>
            <span className="text-base sm:text-lg font-800 font-display bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-cyan bg-clip-text text-transparent">
              acctrise
            </span>
          </Link>

          {/* Navigation Links - Hidden on mobile */}
          {variant === "landing" && (
            <nav className="hidden md:flex items-center gap-8">
              {["Services", "How it works", "API", "Pricing"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/auth/login"
              className="hidden sm:block px-4 sm:px-6 py-2 text-sm font-medium text-white rounded-lg hover:bg-dark-surface-light transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-glow transition-all duration-300 whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
