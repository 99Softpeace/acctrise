import { Wallet, TrendingUp, Package, Bell, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-dark-bg text-white">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-dark-border">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-dark-border hover:bg-dark-surface-light transition-colors cursor-pointer">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 p-1 flex items-center justify-center overflow-hidden">
            <Image
              src="/acctrise-logo.jpeg"
              alt="Acctrise"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-sm">acctrise</h2>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: TrendingUp, label: "Overview", href: "/dashboard", active: true },
            { icon: Package, label: "Orders", href: "/dashboard/orders", active: false },
            { icon: Wallet, label: "Wallet", href: "/dashboard/wallet", active: false },
            { icon: Bell, label: "Notifications", href: "/dashboard/notifications", active: false }
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href as any}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.active
                  ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
                  : "text-gray-300 hover:bg-dark-surface-light"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-dark-border p-4 space-y-2">
          <Link
            href={"/dashboard/settings" as any}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-surface-light transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-surface-light transition-all">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-dark-border bg-dark-surface/50 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-sm text-gray-400">Here's your dashboard overview</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-dark-surface-light transition-colors">
                <Bell className="w-6 h-6 text-gray-400" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

