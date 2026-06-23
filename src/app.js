const navItems = [
  { id: "overview", label: "Overview", count: "24" },
  { id: "orders", label: "Orders", count: "128" },
  { id: "numbers", label: "Numbers inbox", count: "17" },
  { id: "catalog", label: "Service catalog", count: "286" },
  { id: "wallet", label: "Balance history", count: "$12.8k" }
];

const orders = [
  ["AC-88192", "Instagram followers", "Social", "7,500", "$42.60", "Processing", "good"],
  ["AC-88191", "Telegram members", "Social", "2,000", "$18.10", "Queued", "warn"],
  ["AC-88190", "TikTok views", "Social", "50,000", "$31.40", "Delivered", "dark"],
  ["AC-88189", "YouTube watch time", "Social", "900h", "$74.20", "Processing", "good"],
  ["AC-88188", "Reseller service bundle", "Marketplace", "1 pack", "$115.00", "Delivered", "dark"]
];

const transactions = [
  ["TX-55018", "Balance top-up", "Card", "+$3,000.00", "Complete", "good"],
  ["TX-55017", "Social order AC-88192", "Balance", "-$42.60", "Paid", "dark"],
  ["TX-55016", "Number rental refund", "Auto-credit", "+$0.48", "Complete", "good"],
  ["TX-55015", "Rent a verification number", "Balance", "-$2.10", "Paid", "dark"],
  ["TX-55014", "Reseller payout", "Margin", "+$218.40", "Pending", "warn"]
];

const numbers = [
  {
    id: "VN-2048",
    app: "Telegram",
    country: "Poland",
    number: "+48 572 118 904",
    code: "482-901",
    time: "41s",
    state: "OTP received"
  },
  {
    id: "VN-2047",
    app: "WhatsApp",
    country: "Brazil",
    number: "+55 11 98422 7710",
    code: "918-044",
    time: "2m 12s",
    state: "Waiting retry"
  },
  {
    id: "VN-2046",
    app: "Google",
    country: "United States",
    number: "+1 415 290 1774",
    code: "663-210",
    time: "5m 03s",
    state: "Verified"
  },
  {
    id: "VN-2045",
    app: "OpenAI",
    country: "France",
    number: "+33 7 56 18 43 19",
    code: "041-772",
    time: "7m 45s",
    state: "OTP received"
  }
];

const services = [
  ["Instagram high-retention followers", "Social", "$0.0056 / unit", "Starts in seconds"],
  ["TikTok geo-targeted views", "Social", "$0.0008 / unit", "99.2% completion"],
  ["YouTube watch hours", "Social", "$0.079 / hour", "Refill eligible"],
  ["Telegram premium members", "Social", "$0.0091 / unit", "Slow drip available"],
  ["USA SMS verification", "Numbers", "$0.84 / rental", "Recommended number"],
  ["Poland SMS verification", "Numbers", "$0.42 / rental", "Fresh inventory"],
  ["Reseller service bundle", "Reseller", "$115 / pack", "Good reseller margin"],
  ["Account recovery assist", "Marketplace", "$4.70 / case", "Manual review"]
];

const activity = [
  ["Number availability", "Brazil WhatsApp numbers are available again."],
  ["Balance", "Auto-refill rule evaluated. Balance remains above threshold."],
  ["Catalog", "3 social media services received updated prices."],
  ["Reseller tools", "Your reseller connection handled 1,204 orders in the last hour."]
];

const heroStream = [
  ["AC-88192", "Instagram followers", "processing"],
  ["VN-2048", "Telegram OTP received", "41s"],
  ["TX-55018", "Balance top-up settled", "+$3k"],
  ["SYNC-774", "Service list updated", "286"]
];

const appState = {
  view: "overview",
  selectedNumber: numbers[0]
};

const appContent = document.querySelector("#app-content");
const nav = document.querySelector("#app-nav");
const toastRegion = document.querySelector("#toast-region");
const modalRoot = document.querySelector("#modal-root");

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHeroStream() {
  const target = document.querySelector("#hero-stream");
  if (!target) return;
  target.innerHTML = heroStream
    .map(
      ([id, label, state]) => `
        <div class="stream-row">
          <span>${id}</span>
          <strong>${label}</strong>
          <span>${state}</span>
        </div>
      `
    )
    .join("");
}

function renderNav() {
  nav.innerHTML = navItems
    .map(
      (item) => `
        <button class="nav-button" type="button" data-view="${item.id}" aria-current="${
          appState.view === item.id ? "page" : "false"
        }">
          <span>${item.label}</span>
          <span class="nav-count">${item.count}</span>
        </button>
      `
    )
    .join("");
}

function statePill(label, variant = "") {
  return `<span class="state ${variant}">${label}</span>`;
}

function dataTable(columns, rows) {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>${columns.map((column) => `<th scope="col">${column}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${row
                    .map((cell) => {
                      if (Array.isArray(cell)) return `<td>${statePill(cell[0], cell[1])}</td>`;
                      return `<td>${escapeHtml(cell)}</td>`;
                    })
                    .join("")}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function dashboardOverview() {
  return `
    <section class="kpi-grid" aria-label="Business metrics">
      ${[
        ["Available balance", "$12,840.55", "+$3,218 this week"],
        ["Active orders", "128", "24 processing now"],
        ["SMS rentals", "17", "6 OTPs waiting"],
        ["Reseller orders", "84,209", "running smoothly"]
      ]
        .map(
          ([label, value, note]) => `
            <article class="kpi-card">
              <span>${label}</span>
              <strong>${value}</strong>
              <small>${note}</small>
            </article>
          `
        )
        .join("")}
    </section>

    <section class="module-grid" aria-label="Service modules">
      ${[
        ["Social media orders", "Buy followers, views, likes, members, and watch time with clear progress updates.", "New social order"],
        ["Rent a verification number", "Pick an app and country, rent a number, and copy the OTP when it arrives.", "Rent number"],
        ["Digital services marketplace", "Purchase, resell, and map Digital marketplace services with margin-aware operational logs.", "Browse services"]
      ]
        .map(
          ([title, body, action]) => `
            <article class="module-card">
              <div class="module-head">
                <span>Service</span>
                <span class="tag">Ready</span>
              </div>
              <h3>${title}</h3>
              <p>${body}</p>
              <div class="module-actions">
                <button class="btn btn-dark" data-action="order">${action}</button>
                <button class="btn btn-line" data-action="sync">Refresh</button>
              </div>
            </article>
          `
        )
        .join("")}
    </section>

    <section class="panel-grid">
      <article class="data-panel">
        <div class="table-headline">
          <h3>Real-time order tracking</h3>
          <span class="tag">Updated now</span>
        </div>
        ${dataTable(
          ["Order", "Service", "Type", "Quantity", "Cost", "State"],
          orders.map(([id, service, type, qty, cost, state, variant]) => [id, service, type, qty, cost, [state, variant]])
        )}
      </article>
      <aside class="data-panel">
        <div class="card-head">
          <h3>Activity feed</h3>
          <span class="tag">Ready</span>
        </div>
        <div class="activity-list">
          ${activity
            .map(
              ([label, body]) => `
                <div class="activity-item">
                  <strong>${label}</strong>
                  <span>${body}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </aside>
    </section>
  `;
}

function ordersView() {
  return `
    <section class="panel-grid">
      <article class="data-panel">
        <div class="table-headline">
          <h3>Orders</h3>
          <button class="btn btn-dark" data-action="order">Create order</button>
        </div>
        ${dataTable(
          ["Order", "Service", "Type", "Quantity", "Cost", "State"],
          orders.map(([id, service, type, qty, cost, state, variant]) => [id, service, type, qty, cost, [state, variant]])
        )}
      </article>
      ${quickOrderCard()}
    </section>
  `;
}

function quickOrderCard() {
  return `
    <aside class="quick-order">
      <div class="card-head" style="padding-left:0;padding-right:0;padding-top:0">
        <h3>Quick order</h3>
        <span class="tag">Balance</span>
      </div>
      <form data-quick-order>
        <label class="field">
          <span>Service</span>
          <select name="service">
            <option>Instagram high-retention followers</option>
            <option>Telegram premium members</option>
            <option>USA SMS verification</option>
            <option>Reseller service bundle</option>
          </select>
        </label>
        <label class="field">
          <span>Target / link</span>
          <input name="target" placeholder="https://instagram.com/acctrise" required />
        </label>
        <label class="field">
          <span>Quantity</span>
          <input name="quantity" type="number" min="1" value="2500" required />
        </label>
        <div class="quote-box">
          <span>Estimated charge</span>
          <strong>${money(14.0)}</strong>
        </div>
        <button class="btn btn-dark" type="submit">Submit order</button>
      </form>
    </aside>
  `;
}

function numbersView() {
  return `
    <section class="inbox-layout">
      <div class="otp-list">
        <div class="card-head">
          <h3>Numbers inbox</h3>
          <button class="btn btn-line" data-action="rent">Rent number</button>
        </div>
        ${numbers
          .map(
            (item) => `
              <button class="otp-item ${item.id === appState.selectedNumber.id ? "active" : ""}" type="button" data-number="${item.id}">
                <strong>${item.app} - ${item.country}</strong>
                <span>${item.number}</span>
                <span>${item.state} - ${item.time}</span>
              </button>
            `
          )
          .join("")}
      </div>
      <article class="otp-display" aria-live="polite">
        <span class="tag">${appState.selectedNumber.id}</span>
        <div class="code">${appState.selectedNumber.code}</div>
        <p>
          ${appState.selectedNumber.app} verification number from ${appState.selectedNumber.country}.
          Number ${appState.selectedNumber.number} remains reserved for ${appState.selectedNumber.time}.
        </p>
        <div class="hero-actions">
          <button class="btn btn-dark" data-action="copy-code">Copy OTP</button>
          <button class="btn btn-line" data-action="release">Release number</button>
        </div>
      </article>
    </section>
  `;
}

function catalogView() {
  return `
    <section class="catalog-grid" aria-label="Service catalog">
      ${services
        .map(
          ([title, type, price, meta]) => `
            <article class="catalog-card">
              <span class="tag">${type}</span>
              <h3>${title}</h3>
              <p>${meta}</p>
              <div class="module-head">
                <strong>${price}</strong>
                <button class="btn btn-line" data-action="order">Order</button>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function walletView() {
  return `
    <section class="panel-grid">
      <article class="ledger-card">
        <div class="card-head" style="padding-left:0;padding-right:0;padding-top:0">
          <h3>Balance controls</h3>
          <span class="tag">Auto-refill active</span>
        </div>
        <div class="field-stack">
          <div class="quote-box">
            <span>Available balance</span>
            <strong>$12,840.55</strong>
          </div>
          <label class="field">
            <span>Auto-refill threshold</span>
            <input value="$2,500.00" />
          </label>
          <label class="field">
            <span>Monthly spending limit</span>
            <input value="$48,000.00" />
          </label>
          <button class="btn btn-dark" data-action="fund">Fund wallet</button>
        </div>
      </article>
      <article class="data-panel">
        <div class="table-headline">
          <h3>Transactions</h3>
          <span class="tag">History</span>
        </div>
        ${dataTable(
          ["Transaction", "Description", "Rail", "Amount", "State"],
          transactions.map(([id, desc, rail, amount, state, variant]) => [id, desc, rail, amount, [state, variant]])
        )}
      </article>
    </section>
  `;
}

function renderView() {
  const views = {
    overview: dashboardOverview,
    orders: ordersView,
    numbers: numbersView,
    catalog: catalogView,
    wallet: walletView
  };
  appContent.innerHTML = views[appState.view]();
  appContent.focus({ preventScroll: true });
  bindViewEvents();
}

function bindViewEvents() {
  document.querySelectorAll("[data-number]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedNumber = numbers.find((item) => item.id === button.dataset.number) || numbers[0];
      renderView();
    });
  });

  document.querySelectorAll("[data-quick-order]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      toast("Order submitted. Balance reserved and order started.");
    });
  });
}

function openModal(kind) {
  const isFunding = kind === "fund";
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation" data-modal-close>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head">
          <h2 id="modal-title">${isFunding ? "Fund wallet" : "Create service order"}</h2>
          <button class="icon-button" type="button" data-modal-close aria-label="Close modal">x</button>
        </div>
        <form class="modal-body" data-modal-form>
          ${
            isFunding
              ? `
                <label class="field">
                  <span>Amount</span>
                  <input name="amount" value="$1,000.00" />
                </label>
                <label class="field">
                  <span>Funding rail</span>
                  <select name="rail">
                    <option>Card settlement</option>
                    <option>Bank transfer</option>
                    <option>Crypto invoice</option>
                  </select>
                </label>
                <div class="quote-box"><span>Expected availability</span><strong>Instant</strong></div>
              `
              : `
                <label class="field">
                  <span>Service line</span>
                  <select name="service">
                    <option>Social media service</option>
                    <option>Verification number</option>
                    <option>Marketplace / Digital marketplace service</option>
                  </select>
                </label>
                <label class="field">
                  <span>Target</span>
                  <input name="target" placeholder="Profile, phone app, or service package" />
                </label>
                <label class="field">
                  <span>Quantity</span>
                  <input name="quantity" type="number" value="1000" min="1" />
                </label>
              `
          }
          <button class="btn btn-dark" type="submit">${isFunding ? "Create funding request" : "Continue"}</button>
        </form>
      </section>
    </div>
  `;

  modalRoot.querySelector(".modal-panel").addEventListener("click", (event) => event.stopPropagation());
  modalRoot.querySelectorAll("[data-modal-close]").forEach((item) => item.addEventListener("click", closeModal));
  modalRoot.querySelector("[data-modal-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    closeModal();
    toast(isFunding ? "Funding request created. Your balance history will update when it settles." : "Checkout started. Your price is held for 60 seconds.");
  });
  modalRoot.querySelector("input, select, button")?.focus();
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  toastRegion.append(node);
  window.setTimeout(() => node.remove(), 3600);
}

function bindGlobalEvents() {
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    appState.view = button.dataset.view;
    renderNav();
    renderView();
  });

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    if (action === "fund") openModal("fund");
    if (action === "order" || action === "rent") openModal("order");
    if (action === "sync") toast("Refresh complete. Orders, balance, and numbers are up to date.");
    if (action === "copy-code") toast(`OTP ${appState.selectedNumber.code} copied to clipboard.`);
    if (action === "release") toast(`${appState.selectedNumber.id} released and rental closed.`);
  });

  document.querySelectorAll("[data-open-console]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast("Dashboard ready. Choose a service or start an order.");
    });
  });

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelector("#global-search")?.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    if (query.length < 2) return;
    const matchedView = query.includes("otp") || query.includes("number") ? "numbers" : query.includes("wallet") || query.includes("transaction") ? "wallet" : query.includes("catalog") || query.includes("service") ? "catalog" : "orders";
    appState.view = matchedView;
    renderNav();
    renderView();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector("#global-search")?.focus();
    }
  });
}

renderHeroStream();
renderNav();
renderView();
bindGlobalEvents();
