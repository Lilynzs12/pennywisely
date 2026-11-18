/* core.js - code used by every page (date, login check, sidebar, notifications) */
"use strict";

/* Helpers & formatting */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const page = document.body.dataset.page;
/* Date: top bar shows the real date. The sample data is only for Nov 2026,
   so if today is not in Nov 2026 the bills / daily spend use 1 or 30 Nov. */
const _now = new Date();
const _pad = n => String(n).padStart(2, "0");
const _DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const _MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const REAL_ISO = `${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-${_pad(_now.getDate())}`;
const TODAY = `${_DAYS[_now.getDay()]}, ${_now.getDate()} ${_MONTHS[_now.getMonth()]} ${_now.getFullYear()}`;
const TODAY_ISO = REAL_ISO.startsWith("2026-11") ? REAL_ISO : REAL_ISO < "2026-11-01" ? "2026-11-01" : "2026-11-30";
const TODAY_DAY = +TODAY_ISO.slice(8);
const DAYS_IN_MONTH = 30;
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = n => "RM " + Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sum = (arr, pick = x => x) => arr.reduce((total, item) => total + pick(item), 0);
const esc = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = name => name.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
const dateFmt = iso => new Date(iso + "T00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

// save and get data from the browser (localStorage)
const store = {
  get: key => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ } }
};
// message that shows after the page reloads
const flash = message => { try { sessionStorage.setItem("pw_flash", message); } catch (e) { /* ignore */ } };
// download a file (csv / json)
const download = (filename, text, type = "text/csv") => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

/* Theme & profile */
document.documentElement.dataset.bsTheme = store.get("pw_theme") || "light";
const isDark = () => document.documentElement.dataset.bsTheme === "dark";
const profile = Object.assign(
  { name: "User", email: "user@pennywisely.com", phone: "017-xxxx-xxx", income: 5300, alerts: true, bills: true, weekly: false },
  store.get("pw_profile") || {}
);
Object.assign(PW.budgets, store.get("pw_budgets") || {});   // budget limits that the user edited

/* Login check */
const login = () => { sessionStorage.setItem("pw_auth", "1"); location.href = "dashboard.html"; };
const logout = () => { sessionStorage.removeItem("pw_auth"); location.href = "index.html"; };
if (page !== "login" && !sessionStorage.getItem("pw_auth")) location.replace("index.html");
if (page === "login" && sessionStorage.getItem("pw_auth")) location.replace("dashboard.html");

/* Data helpers */
// sample transactions + the ones the user added
const allTx = () => [...PW.tx, ...(store.get("pw_extra") || [])].sort((a, b) => b.d.localeCompare(a.d));
const spentByCat = () => {
  const out = {}; Object.keys(PW.budgets).forEach(c => out[c] = 0);
  allTx().filter(t => t.t === "out").forEach(t => out[t.c] = (out[t.c] || 0) + t.a);
  return out;
};
const totals = () => { const t = allTx(); return { inc: sum(t.filter(x => x.t === "in"), x => x.a), exp: sum(t.filter(x => x.t === "out"), x => x.a) }; };
const T = totals();
// this month's income and expenses (from transactions)
PW.history.expense = PW.months.map((_, i) => i < 5 ? sum(Object.keys(PW.catHistory), k => PW.catHistory[k][i]) : T.exp);
PW.history.income[5] = T.inc;

const LIQUID = ["mbb", "cimb", "tng"];
const getWallets = () => {
  const moved = store.get("pw_wd") || {}, net = T.inc - T.exp;
  return PW.wallets.map(w => ({ ...w, bal: w.bal + (moved[w.id] || 0) + (w.id === "mbb" ? net : 0) }));
};
const catBadge = (cat, cls = "") => {
  const k = PW.cats[cat] || PW.cats.Shopping;
  return `<span class="cat-ico ${cls}" style="background:${k.c}22;color:${k.c}"><i class="bi ${k.i}"></i></span>`;
};
const pctColor = p => p >= 100 ? "bg-danger" : p >= 80 ? "bg-warning" : "bg-success";
const progress = p => `<div class="progress" role="progressbar" aria-valuenow="${Math.min(p, 100)}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar ${pctColor(p)}" style="width:${Math.min(p, 100)}%"></div></div>`;

// progress bar
const bar = (p, color = "bg-primary") => `<div class="progress" role="progressbar" aria-valuenow="${Math.min(p, 100)}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar ${color}" style="width:${Math.min(p, 100)}%"></div></div>`;

// ---- Bills ----
const getBills = () => {
  const override = store.get("pw_billpaid") || {};
  return PW.bills.map(b => {
    const paid = b.key in override ? override[b.key] : b.st === "Paid";
    const daysLeft = b.day - TODAY_DAY;
    const status = paid ? "Paid" : daysLeft < 0 ? "Overdue" : daysLeft <= 14 ? "Due soon" : "Upcoming";
    return { ...b, paid, status, daysLeft };
  });
};
// ---- Goals ----
const monthsUntilLabel = due => {                      // months left until the due date
  const [m, y] = due.split(" ");
  return Math.max((+y - 2026) * 12 + MONTHS_SHORT.indexOf(m) - 10, 1);
};
const monthsBetween = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 864e5 / 30.4375));
const savingsCapacity = () => {                         // average saving per month (last 5 months)
  const h = PW.history; return sum([0, 1, 2, 3, 4], i => h.income[i] - h.expense[i]) / 5;
};
const getGoals = () => {
  const added = store.get("pw_gadd") || {}, mine = store.get("pw_goals") || [];
  return [...PW.goals, ...mine].map(g => {
    const id = g.id || g.key, saved = g.s + (added[id] || 0);
    const monthsLeft = g.until ? monthsBetween(g.from > REAL_ISO ? g.from : REAL_ISO, g.until) : monthsUntilLabel(g.due);
    const need = Math.max(g.t - saved, 0) / monthsLeft;
    const load = need / savingsCapacity();              // how much of your normal saving this goal needs
    const status = saved >= g.t ? ["Reached", "ok"] : load < .35 ? ["On track", "ok"] : load < .6 ? ["Stretch", "warn"] : ["Needs a boost", "bad"];
    return { ...g, id, user: !!g.id, s: saved, monthsLeft, need, status };
  });
};

/* Shared layout */
// menu list (for sidebar and bottom bar)
const NAV = [
  ["dashboard", "Dashboard", "bi-grid-1x2"], ["transactions", "Transactions", "bi-arrow-left-right"],
  ["budgets", "Budgets", "bi-pie-chart"], ["goals", "Goals & Bills", "bi-bullseye"],
  ["debts", "Debts & Loans", "bi-bank"], ["reports", "Reports", "bi-bar-chart-line"],
  ["account", "Account", "bi-person-circle"]
];
const logo = (color = "currentColor", size = 34) => `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8v26" stroke="${color}"/><path d="M29 17a8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8" stroke="${color}"/><path d="M21 9a8 8 0 0 1 8 8" stroke="#d4a62a"/></svg>`;

if (page !== "login") {
  document.body.insertAdjacentHTML("afterbegin", '<a class="skip-link" href="#main">Skip to content</a>');

  // ---- Sidebar ----
  const side = $("#nav");
  side.className = "sidebar";
  side.setAttribute("aria-label", "Sidebar navigation");
  side.innerHTML = `
    <div class="side-panel">
      <div class="side-head">
        <a class="brand" href="dashboard.html" data-brand></a>
        <button class="btn-close btn-close-white side-close" id="sideClose" aria-label="Close menu"></button>
      </div>
      <nav class="side-nav" aria-label="Main">
        ${NAV.map(([id, label, icon]) => `<a class="nav-item ${id === page ? "active" : ""}" ${id === page ? 'aria-current="page"' : ""} href="${id}.html" title="${label}"><i class="bi ${icon}"></i><span class="lbl">${label}</span></a>`).join("")}
      </nav>
      <div class="side-tip"><strong class="text-white"><i class="bi bi-lightbulb text-warning"></i> Smart tip</strong><p>Pay yourself first: move savings out on payday, then budget what is left.</p></div>
      <button class="nav-item side-logout" id="logoutSide" title="Log out"><i class="bi bi-box-arrow-right"></i><span class="lbl">Log out</span></button>
    </div>
    <button class="side-toggle" id="sideToggle" aria-expanded="false" aria-controls="nav" aria-label="Keep sidebar expanded"><i class="bi bi-chevron-right"></i></button>`;
  document.body.insertAdjacentHTML("beforeend", '<div class="scrim" id="scrim"></div>');

  // desktop: hover to open the sidebar. phone: slide menu
  { const hoverable = matchMedia("(hover: hover)"), toggle = $("#sideToggle"), scrim = $("#scrim");
    let pinned = store.get("pw_side") === "pinned", timer;
    const setPin = v => { pinned = v; side.classList.toggle("pinned", v); toggle.setAttribute("aria-expanded", v); toggle.setAttribute("aria-label", v ? "Collapse sidebar" : "Keep sidebar expanded"); store.set("pw_side", v ? "pinned" : "auto"); };
    const hover = v => { clearTimeout(timer); timer = setTimeout(() => side.classList.toggle("open", v), v ? 40 : 180); };
    setPin(pinned);
    side.addEventListener("mouseenter", () => hoverable.matches && hover(true));
    side.addEventListener("mouseleave", () => hover(false));
    side.addEventListener("focusin", () => hover(true));
    side.addEventListener("focusout", e => { if (!side.contains(e.relatedTarget)) hover(false); });
    toggle.addEventListener("click", () => setPin(!pinned));
    const drawer = open => { side.classList.toggle("drawer-open", open); scrim.classList.toggle("show", open); document.body.style.overflow = open ? "hidden" : ""; };
    window.openDrawer = () => drawer(true);
    $("#sideClose").addEventListener("click", () => drawer(false));
    scrim.addEventListener("click", () => drawer(false));
    document.addEventListener("keydown", e => { if (e.key === "Escape") { drawer(false); side.classList.remove("open"); } });
  }

  // ---- Top bar ----
  $("#top").innerHTML = `
    <div class="topbar-in">
      <button class="icon-btn menu-btn" onclick="openDrawer()" aria-label="Open menu"><i class="bi bi-list"></i></button>
      <span class="date"><i class="bi bi-calendar3 me-1"></i>${TODAY}</span>
      <div class="topbar-actions">
        <div class="notif-wrap">
          <button class="icon-btn" id="bellBtn" aria-label="Notifications" aria-expanded="false"><i class="bi bi-bell"></i><span class="dot-badge d-none" id="bellCount">0</span></button>
          <div class="notif" id="notif" role="region" aria-label="Notifications"></div>
        </div>
        <button class="icon-btn d-none d-lg-inline-grid" data-bs-toggle="modal" data-bs-target="#txModal" aria-label="Add transaction" title="Add transaction (press N)"><i class="bi bi-plus-lg"></i></button>
        <button class="icon-btn" id="themeBtn" aria-label="Toggle dark mode"><i class="bi ${isDark() ? "bi-sun" : "bi-moon-stars"}"></i></button>
        <div class="dropdown">
          <button class="avatar-btn" data-bs-toggle="dropdown" aria-label="Account menu"><span class="coin" id="topAv">${initials(profile.name)}</span><span class="nm d-none d-md-inline">${esc(profile.name)}</span></button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="account.html"><i class="bi bi-person me-2"></i>My account</a></li>
            <li class="dropdown-item-text small text-secondary">${esc(profile.email)}</li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Log out</button></li>
          </ul>
        </div>
      </div>
    </div>`;

  // ---- Bottom bar (phone only) ----
  const tab = id => { const n = NAV.find(x => x[0] === id); return `<a class="bn-item ${id === page ? "active" : ""}" href="${id}.html"><i class="bi ${n[2]}"></i><span>${n[1].split(" ")[0]}</span></a>`; };
  document.body.insertAdjacentHTML("beforeend", `
    <nav class="bottom-nav" aria-label="Quick navigation">
      ${tab("dashboard")}${tab("transactions")}
      <button class="bn-item bn-add" data-bs-toggle="modal" data-bs-target="#txModal" aria-label="Add transaction"><i class="bi bi-plus-lg"></i></button>
      ${tab("goals")}
      <button class="bn-item" onclick="openDrawer()"><i class="bi bi-grid"></i><span>More</span></button>
    </nav>`);

  // ---- Footer ----
  $("#foot").innerHTML = `
    <div class="foot-simple">
      <div class="brand" data-brand></div>
      <p class="foot-pitch">Take control of your money in minutes. Track every ringgit, hit your savings goals faster and feel confident about your future.</p>
      <a class="foot-mail" href="mailto:support@pennywisely.com"><i class="bi bi-envelope-heart me-2"></i>Contact us: support@pennywisely.com</a>
      <div class="foot-copy">© ${_now.getFullYear()} Pennywisely. All rights reserved.</div>
    </div>`;
  $("#logoutBtn").onclick = logout; $("#logoutSide").onclick = logout;
  $("#themeBtn").onclick = () => { store.set("pw_theme", isDark() ? "light" : "dark"); location.reload(); };

  /* Quick-add transaction modal, toast, shortcuts */
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal fade" id="txModal" tabindex="-1" aria-labelledby="txTitle" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><form class="modal-content" id="txForm">
      <div class="modal-header"><h5 class="modal-title" id="txTitle">Add transaction</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body form-grid two">
        <div class="span-2"><div class="btn-group w-100" role="group"><input type="radio" class="btn-check" name="t" id="tOut" value="out" checked><label class="btn btn-outline-danger" for="tOut">Expense</label><input type="radio" class="btn-check" name="t" id="tIn" value="in"><label class="btn btn-outline-success" for="tIn">Income</label></div></div>
        <div class="span-2"><label class="form-label fw-semibold" for="txName">Description</label><input class="form-control" id="txName" required maxlength="80" placeholder="e.g. Dinner with family"></div>
        <div><label class="form-label fw-semibold" for="txAmt">Amount (RM)</label><input type="number" min="0.01" step="0.01" inputmode="decimal" class="form-control" id="txAmt" required></div>
        <div><label class="form-label fw-semibold" for="txCat">Category</label><select class="form-select" id="txCat">${Object.keys(PW.cats).filter(c => c !== "Income").map(c => `<option>${c}</option>`).join("")}</select></div>
        <div><label class="form-label fw-semibold" for="txDate">Date</label><input type="date" class="form-control" id="txDate" min="2026-11-01" max="2026-11-30" value="${TODAY_ISO}" required></div>
        <div><label class="form-label fw-semibold" for="txMethod">Paid with</label><select class="form-select" id="txMethod">${["Cash", "Card", "E-wallet", "FPX", "DuitNow", "Bank transfer"].map(m => `<option>${m}</option>`).join("")}</select></div>
      </div><div class="modal-footer"><button class="btn btn-ink" type="submit">Save transaction</button></div></form></div></div>
    <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3"><div id="pwToast" class="toast align-items-center text-bg-dark border-0" role="status" aria-live="polite" aria-atomic="true"><div class="d-flex"><div class="toast-body"><i class="bi bi-check-circle-fill text-success me-2"></i><span id="pwToastMsg"></span></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div></div>`);

  $("#txModal").addEventListener("show.bs.modal", e => {
    $("#txForm").reset();
    $(e.relatedTarget && e.relatedTarget.dataset.quick === "in" ? "#tIn" : "#tOut").checked = true;
    $("#txDate").value = TODAY_ISO;
  });
  $("#txModal").addEventListener("shown.bs.modal", () => $("#txName").focus());
  $("#txForm").addEventListener("submit", e => {
    e.preventDefault();
    const type = $("input[name=t]:checked").value, list = store.get("pw_extra") || [];
    list.push({ id: Date.now(), d: $("#txDate").value || TODAY_ISO, n: $("#txName").value.trim(), c: type === "in" ? "Income" : $("#txCat").value, t: type, a: parseFloat($("#txAmt").value), m: $("#txMethod").value });
    store.set("pw_extra", list); flash(type === "in" ? "Income added" : "Expense added"); location.reload();
  });
  // show the message after reload
  const message = sessionStorage.getItem("pw_flash");
  if (message) { sessionStorage.removeItem("pw_flash"); $("#pwToastMsg").textContent = message; bootstrap.Toast.getOrCreateInstance($("#pwToast"), { delay: 3000 }).show(); }

  /* Notifications bell */
  { const items = [], spent = spentByCat();
    getBills().filter(b => !b.paid).sort((a, b) => a.day - b.day).slice(0, 3).forEach(b =>
      items.push(["bi-bell text-warning", `<b>${esc(b.n)}</b> ${b.status === "Overdue" ? "is overdue" : "is due " + b.due} · ${fmt(b.a)}`, "goals.html"]));
    Object.keys(PW.budgets).forEach(c => { const p = Math.round(spent[c] / PW.budgets[c] * 100);
      if (p >= 80) items.push(["bi-exclamation-triangle text-danger", `<b>${c}</b> budget is ${p >= 100 ? "over the limit" : "at " + p + "%"}`, "budgets.html"]); });
    const paidDebt = store.get("pw_dpay") || {};
    PW.debts.filter(d => d.rate >= 10 && d.bal - (paidDebt[d.id] || 0) > 0).forEach(d => items.push(["bi-percent text-primary", `<b>${esc(d.n)}</b> charges ${d.rate}% a year – pay it down first`, "debts.html"]));
    $("#notif").innerHTML = `<h3>Notifications</h3>` + (items.length ? items.map(i => `<a class="notif-item" href="${i[2]}"><i class="bi ${i[0]}"></i><span>${i[1]}</span></a>`).join("") : '<div class="empty"><i class="bi bi-check2-circle"></i>You are all caught up.</div>');
    const badge = $("#bellCount"); if (items.length) { badge.textContent = items.length; badge.classList.remove("d-none"); }
    const bell = $("#bellBtn"), panel = $("#notif");
    bell.addEventListener("click", e => { e.stopPropagation(); const open = panel.classList.toggle("show"); bell.setAttribute("aria-expanded", open); });
    document.addEventListener("click", e => { if (!panel.contains(e.target)) { panel.classList.remove("show"); bell.setAttribute("aria-expanded", "false"); } });
  }

  /* 8. Keyboard shortcuts: N = add transaction, / = focus the search box on the Transactions page */
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === "/" && $("#fSearch")) { e.preventDefault(); $("#fSearch").focus(); }
    if (e.key.toLowerCase() === "n") { e.preventDefault(); bootstrap.Modal.getOrCreateInstance($("#txModal")).show(); }
  });

  /* Chart defaults */
  if (window.Chart) {
    Chart.defaults.font.family = "Plus Jakarta Sans, sans-serif";
    Chart.defaults.color = isDark() ? "#8fa7ab" : "#62767a";
    Chart.defaults.borderColor = isDark() ? "#1d3a3e" : "#e2eae8";
    Chart.defaults.responsive = true;
    Chart.defaults.animation.duration = 900;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.position = "bottom";
    Object.assign(Chart.defaults.plugins.tooltip, { backgroundColor: "#0b3b3c", padding: 12, cornerRadius: 10, titleFont: { weight: "700" }, boxPadding: 4 });
  }
}

// logo (put at the end so the page is ready)
$$("[data-brand]").forEach(el => el.innerHTML = logo("currentColor", 34) + "<span>pennywisely</span>");
