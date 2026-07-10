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
          <Link href="/" className="flex items-center">
            <Image
              src="/acctrise-logo.jpeg"
              alt="Acctrise"
              width={190}
              height={64}
              className="h-12 w-36 object-contain object-left mix-blend-multiply sm:h-14 sm:w-44"
              priority
            />
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
