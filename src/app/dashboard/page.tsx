import { ArrowUpRight, ArrowDownLeft, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  // Mock data - In production, fetch from API
  const stats = [
    {
      label: "Wallet Balance",
      value: "$1,234.50",
      icon: "💰",
      trend: "+5.2%",
      positive: true
    },
    {
      label: "Total Spent",
      value: "$8,945.00",
      icon: "📊",
      trend: "+12.5%",
      positive: true
    },
    {
      label: "Active Orders",
      value: "24",
      icon: "📦",
      trend: "+2",
      positive: true
    },
    {
      label: "This Month",
      value: "$3,421.00",
      icon: "📈",
      trend: "+18.2%",
      positive: true
    }
  ];

  const recentOrders = [
    {
      id: "AC-20240115-ABC",
      service: "Instagram Followers",
      quantity: 1000,
      amount: "$5.60",
      status: "completed",
      date: "2024-01-15"
    },
    {
      id: "AC-20240115-DEF",
      service: "TikTok Views",
      quantity: 5000,
      amount: "$4.00",
      status: "processing",
      date: "2024-01-15"
    },
    {
      id: "AC-20240114-GHI",
      service: "Telegram Members",
      quantity: 500,
      amount: "$4.55",
      status: "pending",
      date: "2024-01-14"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500/20 text-green-400 border border-green-500/30",
      processing: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      failed: "bg-red-500/20 text-red-400 border border-red-500/30"
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group relative p-6 rounded-2xl bg-dark-surface/50 border border-dark-border hover:border-primary-500/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black">{stat.value}</p>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.positive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4" />
                  )}
                  {stat.trend}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-dark-surface/50 border border-dark-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <a href="/dashboard/orders" className="text-primary-400 hover:text-primary-300 text-sm font-semibold">
              View All →
            </a>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-dark-bg/50 hover:bg-dark-bg transition-colors border border-dark-border/50"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">{order.service}</p>
                  <p className="text-sm text-gray-400">{order.id}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{order.quantity.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">{order.amount}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-600/20 to-secondary-600/20 border border-primary-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-primary-400" />
              <h3 className="font-bold">Quick Actions</h3>
            </div>

            <div className="space-y-2">
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-glow transition-all text-sm">
                Fund Wallet
              </button>
              <button className="w-full px-4 py-2 rounded-lg border border-primary-500/30 text-white font-semibold hover:bg-primary-500/10 transition-all text-sm">
                Place Order
              </button>
              <button className="w-full px-4 py-2 rounded-lg border border-primary-500/30 text-white font-semibold hover:bg-primary-500/10 transition-all text-sm">
                Check History
              </button>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="p-6 rounded-2xl bg-dark-surface/50 border border-dark-border">
            <p className="text-sm font-semibold text-primary-400 mb-2">💡 Tip</p>
            <p className="text-sm text-gray-300">
              Invite friends and earn 5% commission on their orders. No limits!
            </p>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="p-6 rounded-2xl bg-dark-surface/50 border border-dark-border">
        <h2 className="text-xl font-bold mb-6">Spending Trend</h2>
        <div className="flex items-center justify-center h-60 rounded-lg bg-dark-bg/50 border border-dark-border/50">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-primary-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">Chart will be displayed here</p>
            <p className="text-sm text-gray-500 mt-2">Using Recharts for visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
