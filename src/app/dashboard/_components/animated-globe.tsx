"use client";

const nodes = [
  { left: "30%", top: "32%", delay: "0s" },
  { left: "56%", top: "26%", delay: "0.6s" },
  { left: "70%", top: "48%", delay: "1.2s" },
  { left: "42%", top: "66%", delay: "1.8s" },
  { left: "22%", top: "54%", delay: "2.4s" }
];

export function AnimatedGlobe() {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-blue-100 bg-[radial-gradient(circle_at_50%_35%,#eff6ff_0%,#ffffff_48%,#e0f2fe_100%)] p-6 shadow-sm shadow-blue-100/70">
      <div className="absolute inset-x-6 top-6 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
        <span>Live network</span>
        <span>Acctrise</span>
      </div>
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 sm:h-56 sm:w-56">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#dbeafe_28%,#60a5fa_58%,#1d4ed8_100%)] shadow-2xl shadow-blue-200/70" />
        <div className="absolute inset-0 rounded-full border border-white/80" />
        <div className="absolute inset-5 rounded-full border border-white/50" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/60" />
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/60" />
        <div className="absolute inset-x-4 top-[31%] h-px rotate-6 bg-white/45" />
        <div className="absolute inset-x-4 bottom-[31%] h-px -rotate-6 bg-white/45" />
        <div className="absolute inset-3 animate-spin rounded-full border border-dashed border-cyan-200/80" style={{ animationDuration: "22s" }} />
        <div className="absolute -inset-5 animate-spin rounded-full border border-blue-200/60" style={{ animationDuration: "34s", animationDirection: "reverse" }} />
        <div className="absolute left-10 top-12 h-10 w-20 rounded-full border border-white/50" />
        <div className="absolute bottom-12 right-8 h-12 w-24 rounded-full border border-white/40" />
        {nodes.map((node) => (
          <span
            key={`${node.left}-${node.top}`}
            className="absolute h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.95)] ring-4 ring-blue-300/40"
            style={{ left: node.left, top: node.top, animation: `pulse 2.8s ease-in-out ${node.delay} infinite` }}
          />
        ))}
      </div>
      <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2 text-center">
        {["Accounts", "Numbers", "Boosting"].map((item) => (
          <div key={item} className="rounded-lg border border-white/80 bg-white/75 px-2 py-2 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
