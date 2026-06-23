const heroOrders = [
  ["Instagram followers", "Processing"],
  ["Telegram OTP", "Code ready"],
  ["Wallet top-up", "Complete"]
];

const navItems = [
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

let currentView = "overview";
let selectedNumber = numbers[0];

const dashboardNav = document.querySelector("#dashboard-nav");
const dashboardContent = document.querySelector("#dashboard-content");
const toastRegion = document.querySelector("#toast-region");

function renderHeroOrders() {
  const target = document.querySelector("#hero-orders");
  if (!target) return;
  target.innerHTML = heroOrders
    .map(([label, state]) => `<div class="mini-order"><b>${label}</b><span>${state}</span></div>`)
    .join("");
}

function renderNav() {
  dashboardNav.innerHTML = navItems
    .map(
      (item) => `<button class="nav-button ${item.id === currentView ? "active" : ""}" type="button" data-view="${item.id}">${item.label}</button>`
    )
    .join("");
}

function status(label, variant = "") {
  return `<span class="status ${variant}">${label}</span>`;
}

function table(columns, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows
            .map(
              (row) => `<tr>${row
                .map((cell) => (Array.isArray(cell) ? `<td>${status(cell[0], cell[1])}</td>` : `<td>${cell}</td>`))
                .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function overviewView() {
  return `
    <section class="app-grid" aria-label="Account summary">
      <article class="app-card"><span>Wallet balance</span><strong>$12,840</strong><small>Ready for new orders</small></article>
      <article class="app-card"><span>Active orders</span><strong>24</strong><small>12 moving fast today</small></article>
      <article class="app-card"><span>OTP numbers</span><strong>17</strong><small>6 codes received</small></article>
      <article class="app-card"><span>Services</span><strong>600+</strong><small>Updated daily</small></article>
    </section>
    <section class="preview-grid">
      <article class="table-card">
        <div class="card-title"><h3>Recent orders</h3><button class="btn btn-soft" data-action="refresh">Refresh</button></div>
        ${table(["Order", "Service", "Qty", "Cost", "Status"], orders.map(([id, service, qty, cost, state, variant]) => [id, service, qty, cost, [state, variant]]))}
      </article>
      ${quickOrder()}
    </section>
  `;
}

function quickOrder() {
  return `
    <aside class="order-box">
      <div class="card-title" style="padding:0;border:0"><h3>Quick order</h3></div>
      <label class="field"><span>Service</span><select><option>Instagram followers</option><option>TikTok views</option><option>Telegram OTP number</option><option>Reseller bundle</option></select></label>
      <label class="field"><span>Link or app</span><input placeholder="Paste profile link or choose app" /></label>
      <label class="field"><span>Quantity</span><input type="number" value="2500" /></label>
      <div class="quote"><span>Estimated price</span><strong>$14.00</strong></div>
      <button class="btn btn-primary" data-action="submit-order">Place order</button>
    </aside>
  `;
}

function ordersView() {
  return `
    <section class="preview-grid">
      <article class="table-card">
        <div class="card-title"><h3>All orders</h3><button class="btn btn-primary" data-action="new-order">New order</button></div>
        ${table(["Order", "Service", "Qty", "Cost", "Status"], orders.map(([id, service, qty, cost, state, variant]) => [id, service, qty, cost, [state, variant]]))}
      </article>
      ${quickOrder()}
    </section>
  `;
}

function numbersView() {
  return `
    <section class="otp-layout">
      <div class="otp-list">
        ${numbers
          .map(
            (item) => `<button class="otp-item ${item.id === selectedNumber.id ? "active" : ""}" type="button" data-number="${item.id}"><b>${item.app} - ${item.country}</b><span>${item.number}</span><span>${item.time} remaining</span></button>`
          )
          .join("")}
      </div>
      <article class="otp-view">
        <div>
          <span class="badge light">${selectedNumber.app} code</span>
          <div class="code">${selectedNumber.code}</div>
          <p>${selectedNumber.country} number ${selectedNumber.number} is active for ${selectedNumber.time}. Copy the code before it expires.</p>
          <button class="btn btn-primary" data-action="copy-code">Copy OTP</button>
        </div>
      </article>
    </section>
  `;
}

function catalogView() {
  return `
    <section class="catalog-grid">
      ${services
        .map(
          ([title, desc, price]) => `<article class="catalog-item"><b>${title}</b><span>${desc}</span><strong>${price}</strong><button class="btn btn-soft" data-action="new-order" style="margin-top:16px">Order now</button></article>`
        )
        .join("")}
    </section>
  `;
}

function walletView() {
  return `
    <section class="preview-grid">
      <article class="order-box">
        <div class="quote"><span>Available balance</span><strong>$12,840.55</strong></div>
        <label class="field"><span>Add amount</span><input value="$1,000.00" /></label>
        <label class="field"><span>Payment method</span><select><option>Bank transfer</option><option>Card payment</option><option>Crypto invoice</option></select></label>
        <button class="btn btn-primary" data-action="fund">Add funds</button>
      </article>
      <article class="table-card">
        <div class="card-title"><h3>Wallet history</h3><span class="status done">Secure</span></div>
        ${table(["Item", "Method", "Amount", "Status"], [
          ["Wallet top-up", "Card", "+$3,000", ["Complete", "done"]],
          ["Instagram order", "Wallet", "-$42.60", ["Paid", "done"]],
          ["OTP rental", "Wallet", "-$2.10", ["Paid", "done"]],
          ["Refund", "Auto", "+$0.48", ["Complete", "done"]]
        ])}
      </article>
    </section>
  `;
}

function renderDashboard() {
  const views = { overview: overviewView, orders: ordersView, numbers: numbersView, catalog: catalogView, wallet: walletView };
  dashboardContent.innerHTML = views[currentView]();
  bindLocalEvents();
}

function bindLocalEvents() {
  document.querySelectorAll("[data-number]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedNumber = numbers.find((item) => item.id === button.dataset.number) || numbers[0];
      renderDashboard();
    });
  });
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  toastRegion.append(node);
  window.setTimeout(() => node.remove(), 3400);
}

document.addEventListener("click", (event) => {
  const scrollTarget = event.target.closest("[data-scroll]")?.dataset.scroll;
  if (scrollTarget) document.querySelector(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const view = event.target.closest("[data-view]")?.dataset.view;
  if (view && navItems.some((item) => item.id === view)) {
    currentView = view;
    renderNav();
    renderDashboard();
    document.querySelector("#dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  const messages = {
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
});

renderHeroOrders();
renderNav();
renderDashboard();