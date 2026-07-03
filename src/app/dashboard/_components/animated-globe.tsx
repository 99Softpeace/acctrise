"use client";

const metricPanels = [
  { label: "Total orders", value: "2.4k+", detail: "+12% this week", className: "network-panel top-left" },
  { label: "Parcels in flow", value: "24 / 75", detail: "+15% this month", className: "network-panel bottom-left" },
  { label: "Live services", value: "620+", detail: "Updated recently", className: "network-panel top-right" }
];

const serviceDots = [
  { left: "28%", top: "36%", delay: "0s" },
  { left: "42%", top: "30%", delay: "0.35s" },
  { left: "57%", top: "42%", delay: "0.7s" },
  { left: "63%", top: "55%", delay: "1.05s" },
  { left: "48%", top: "63%", delay: "1.4s" },
  { left: "35%", top: "52%", delay: "1.75s" },
  { left: "71%", top: "35%", delay: "2.1s" }
];

export function AnimatedGlobe() {
  return (
    <div className="network-globe-card" aria-label="Animated global service network visual">
      <div className="network-globe-grid" />
      <div className="network-globe-aurora" />
      <div className="network-topbar">
        <div>
          <span className="network-kicker">Global network</span>
          <strong>Acctrise live flow</strong>
        </div>
        <span className="network-live">Live</span>
      </div>

      {metricPanels.map((panel) => (
        <div className={panel.className} key={panel.label}>
          <span>{panel.label}</span>
          <strong>{panel.value}</strong>
          <small>{panel.detail}</small>
        </div>
      ))}

      <div className="network-side-list" aria-hidden="true">
        <span><i className="blue" /> Boosting</span>
        <span><i className="green" /> Numbers</span>
        <span><i className="amber" /> eSIM</span>
      </div>

      <div className="network-globe-stage">
        <div className="network-globe-halo halo-one" />
        <div className="network-globe-halo halo-two" />
        <div className="network-globe-orbit orbit-one" />
        <div className="network-globe-orbit orbit-two" />
        <div className="network-globe-orbit orbit-three" />
        <div className="network-globe">
          <div className="network-globe-light" />
          <div className="network-globe-map">
            <span className="land land-one" />
            <span className="land land-two" />
            <span className="land land-three" />
            <span className="land land-four" />
            <span className="land land-five" />
            <span className="land land-six" />
            <span className="land land-seven" />
            <span className="land land-eight" />
          </div>
          <div className="network-globe-lines" />
          <svg className="network-routes" viewBox="0 0 360 360" aria-hidden="true">
            <path d="M74 186 C118 120 225 105 294 154" />
            <path d="M82 220 C154 175 222 184 290 238" />
            <path d="M128 90 C170 132 218 171 270 190" />
            <path d="M112 260 C156 225 209 215 252 248" />
          </svg>
          {serviceDots.map((dot) => (
            <span
              className="network-dot"
              key={`${dot.left}-${dot.top}`}
              style={{ left: dot.left, top: dot.top, animationDelay: dot.delay }}
            />
          ))}
          <span className="network-core" />
        </div>
      </div>

      <div className="network-chart-panel">
        <span>Quantity</span>
        <div className="network-bars" aria-hidden="true">
          <i style={{ height: "64%" }} />
          <i style={{ height: "88%" }} />
          <i style={{ height: "46%" }} />
          <i style={{ height: "72%" }} />
        </div>
      </div>

      <div className="network-rings" aria-hidden="true">
        <span>75%</span>
        <span>25%</span>
      </div>
    </div>
  );
}
