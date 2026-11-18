/* goals.js - goals and bills page
   Sections: 1 summary  2 goal cards  3 add-goal form + date pickers  4 top-up  5 bills */
"use strict";
const ICONS = { Savings: "bi-piggy-bank", Emergency: "bi-shield-check", Travel: "bi-airplane", "Hajj / Umrah": "bi-moon-stars", Camera: "bi-camera", Home: "bi-house-heart", Car: "bi-car-front", Gadget: "bi-laptop", Education: "bi-mortarboard", Gift: "bi-gift" };
const pad = n => String(n).padStart(2, "0");
const P = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const ISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDay = (iso, n) => { const d = P(iso); d.setDate(d.getDate() + n); return ISO(d); };
const dLab = iso => P(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const myGoals = () => store.get("pw_goals") || [];

/* Summary tiles + planning insight */
const renderGoals = () => {
  const goals = getGoals(), saved = sum(goals, g => g.s), target = sum(goals, g => g.t);
  const needed = sum(goals.filter(g => g.s < g.t), g => g.need), capacity = savingsCapacity();
  const billsLeft = sum(getBills().filter(b => !b.paid), b => b.a);
  $("#gKpis").innerHTML = [
    ["Total saved", fmt(saved), "bi-piggy-bank", "#dff5ec", "text-success"],
    ["Total of all goals", fmt(target), "bi-bullseye", "#e1ecff", "text-primary"],
    ["Needed per month", fmt(needed), "bi-calendar-check", "#fff1c9", "text-warning"],
    ["Bills still to pay", fmt(billsLeft), "bi-receipt", "#fde5e5", "text-danger"]
  ].map(k => `<div class="card kpi lift"><div class="top"><span class="label">${k[0]}</span><span class="ico" style="background:${k[3]}"><i class="bi ${k[2]} ${k[4]}"></i></span></div><div class="value">${k[1]}</div></div>`).join("");
  $("#gAdvice").innerHTML = needed > capacity
    ? `Your goals need <b>${fmt(needed)}</b> a month but you usually save about <b>${fmt(capacity)}</b>. Try moving a target date later or trimming the biggest goal.`
    : `Your goals need <b>${fmt(needed)}</b> a month and you usually save about <b>${fmt(capacity)}</b>. You are on a good path.`;

  /* Goal cards */
  $("#goalGrid").innerHTML = goals.map(g => {
    const p = Math.min(Math.round(g.s / g.t * 100), 100), when = g.until ? `${dLab(g.from)} – ${dLab(g.until)}` : g.due;
    const left = g.until ? Math.max(Math.ceil((P(g.until) - P(REAL_ISO)) / 864e5), 0) : g.monthsLeft * 30;
    const next = [25, 50, 75, 100].find(m => m > p), toNext = next ? Math.max(g.t * next / 100 - g.s, 0) : 0;
    return `<article class="card lift goal-card">
      ${goalArt(g, p)}
      <div class="goal-head">
        <div><h3>${esc(g.n)}</h3><div class="sub">Target: ${when}</div></div>
        <div class="ring" style="--p:${p}"><b>${p}%</b></div>
      </div>
      ${bar(p, p >= 100 ? "bg-success" : "bg-primary")}
      <div class="goal-nums"><span>Saved <b>${fmt(g.s)}</b></span><span class="text-secondary">Goal ${fmt(g.t)}</span></div>
      <div class="goal-miles" aria-label="Milestones">${[25, 50, 75, 100].map(m => `<span class="${p >= m ? "hit" : ""}" title="${m}%"><i class="bi ${p >= m ? "bi-star-fill" : "bi-star"}"></i>${m}%</span>`).join("")}</div>
      <div class="goal-next">${g.s >= g.t ? "All milestones done" : `<b>${fmt(toNext)}</b> more to reach ${next}%`} · <i class="bi bi-hourglass-split"></i> ${left >= 60 ? Math.round(left / 30) + " months" : left + " days"} left</div>
      <div class="goal-plan"><span class="pill ${g.status[1]}">${g.status[0]}</span>${g.s >= g.t ? "<span>Goal complete 🎉</span>" : `<span>Save <b>${fmt(g.need)}</b> / month</span>`}</div>
      <div class="goal-foot">
        <button class="btn btn-outline-secondary btn-sm" data-fund="${g.id}" ${g.s >= g.t ? "disabled" : ""}><i class="bi bi-plus-circle me-1"></i>Add money</button>
        ${g.user ? `<button class="btn-del" data-del="${g.id}" aria-label="Delete ${esc(g.n)}"><i class="bi bi-trash"></i></button>` : ""}
      </div></article>`; }).join("");
};
renderGoals();

/* Add-goal form (with small calendar pickers) */
$("#gIcon").innerHTML = Object.keys(ICONS).map(k => `<option>${k}</option>`).join("");
$("#gChips").innerHTML = [1000, 5000, 10000, 20000].map(v => `<button type="button" class="btn btn-outline-secondary btn-sm" data-amt="${v}">${fmt(v).replace(".00", "")}</button>`).join("");
const showPlan = () => {
  const t = parseFloat($("#gTarget").value), sv = parseFloat($("#gSaved").value) || 0, f = $("#gFrom").value, u = $("#gUntil").value;
  if (!(t > 0 && f && u)) return ($("#gPlan").textContent = "Enter an amount and both dates to see what to save each month.");
  const n = monthsBetween(f, u);
  $("#gPlan").innerHTML = sv >= t ? "You have already reached this target." : `Save <b>${fmt((t - sv) / n)}</b> a month for ${n} month${n > 1 ? "s" : ""}.`;
};
["#gTarget", "#gSaved"].forEach(i => $(i).addEventListener("input", showPlan));
$("#gChips").addEventListener("click", e => { const b = e.target.closest("[data-amt]"); if (b) { $("#gTarget").value = b.dataset.amt; showPlan(); } });

// small calendar (click the title to change month / year)
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"], MAX_YEAR = 2060, pickers = {};
const closeAll = except => Object.values(pickers).forEach(k => k !== except && k.close());
const makePicker = (key, minOf, onPick) => {
  const hidden = $("#g" + key), btn = $("#g" + key + "Btn"), txt = $("#g" + key + "Txt"), pop = $("#g" + key + "Pop"), placeholder = txt.textContent;
  let vy = 2026, vm = 11, mode = "d";                       // year, month and mode (d = days, m = months, y = years)
  const draw = () => {
    const sel = hidden.value, min = minOf(), yearStart = 2026 + Math.floor((vy - 2026) / 12) * 12;
    const nav = (d, off, label) => `<button type="button" class="dp-nav" data-nav="${d}" aria-label="${label}" ${off ? "disabled" : ""}><i class="bi bi-chevron-${d < 0 ? "left" : "right"}"></i></button>`;
    let title, prev, next, body;
    if (mode === "d") {
      const lead = (new Date(vy, vm - 1, 1).getDay() + 6) % 7, dim = new Date(vy, vm, 0).getDate();
      title = `${MONTH_NAMES[vm - 1]} ${vy}`; prev = nav(-1, ISO(new Date(vy, vm - 1, 0)) < min, "Previous month"); next = nav(1, vy >= MAX_YEAR && vm === 12, "Next month");
      body = `<div class="dp-grid dp-wd">${WEEKDAYS.map(w => `<span>${w}</span>`).join("")}</div><div class="dp-grid">${"<span></span>".repeat(lead)}${Array.from({ length: dim }, (_, i) => { const v = `${vy}-${pad(vm)}-${pad(i + 1)}`;
        return `<button type="button" class="dp-day ${v === sel ? "sel" : ""} ${v === REAL_ISO ? "today" : ""}" data-d="${v}" ${v < min ? "disabled" : ""} aria-label="${dLab(v)}" aria-pressed="${v === sel}">${i + 1}</button>`; }).join("")}</div>`;
    } else if (mode === "m") {
      title = vy; prev = nav(-1, vy <= 2026, "Previous year"); next = nav(1, vy >= MAX_YEAR, "Next year");
      body = `<div class="dp-grid dp-3">${MONTHS_SHORT.map((n, i) => `<button type="button" class="dp-cell ${sel.slice(0, 7) === `${vy}-${pad(i + 1)}` ? "sel" : ""}" data-m="${i + 1}" ${ISO(new Date(vy, i + 1, 0)) < min ? "disabled" : ""}>${n}</button>`).join("")}</div>`;
    } else {
      title = yearStart + " – " + (yearStart + 11); prev = nav(-12, yearStart <= 2026, "Earlier years"); next = nav(12, yearStart + 12 > MAX_YEAR, "Later years");
      body = `<div class="dp-grid dp-3">${Array.from({ length: 12 }, (_, i) => yearStart + i).map(y => `<button type="button" class="dp-cell ${y === vy ? "sel" : ""}" data-y="${y}" ${y > MAX_YEAR || y < +min.slice(0, 4) ? "disabled" : ""}>${y}</button>`).join("")}</div>`;
    }
    pop.innerHTML = `<div class="dp-head">${prev}<button type="button" class="dp-title" data-mode ${mode === "y" ? "disabled" : ""} aria-label="Change month or year">${title}</button>${next}</div>${body}`;
  };
  const api = {
    close(focus) { pop.classList.add("d-none"); btn.setAttribute("aria-expanded", "false"); if (focus) btn.focus(); },
    set(v) { hidden.value = v; txt.textContent = v ? dLab(v) : placeholder; showPlan(); },
    toggle() {
      if (!pop.classList.contains("d-none")) return api.close();
      closeAll(api); const base = hidden.value || minOf(); vy = +base.slice(0, 4); vm = +base.slice(5, 7); mode = "d";
      draw(); pop.classList.remove("d-none"); btn.setAttribute("aria-expanded", "true");
    }
  };
  btn.onclick = api.toggle;
  pop.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t || t.disabled) return;
    if (t.dataset.nav) { const n = +t.dataset.nav; if (mode === "d") { vm += n; if (vm < 1) { vm = 12; vy--; } if (vm > 12) { vm = 1; vy++; } } else vy = Math.min(Math.max(vy + n, 2026), MAX_YEAR); }
    else if ("mode" in t.dataset) mode = mode === "d" ? "m" : "y";
    else if (t.dataset.y) { vy = +t.dataset.y; mode = "m"; }
    else if (t.dataset.m) { vm = +t.dataset.m; mode = "d"; }
    else if (t.dataset.d) { api.set(t.dataset.d); api.close(true); return onPick && onPick(); }
    draw();
  });
  pop.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); api.close(true); } });
  return (pickers[key] = api);
};
makePicker("From", () => REAL_ISO, () => { const f = $("#gFrom").value; if ($("#gUntil").value && $("#gUntil").value <= f) pickers.Until.set(""); });
makePicker("Until", () => addDay($("#gFrom").value || REAL_ISO, 1));
document.addEventListener("click", e => { if (!e.composedPath().some(n => n.classList && n.classList.contains("dp-wrap"))) closeAll(); });

$("#goalModal").addEventListener("show.bs.modal", () => { $("#goalForm").reset(); $("#gErr").classList.add("d-none"); closeAll(); pickers.From.set(""); pickers.Until.set(""); });
$("#goalModal").addEventListener("shown.bs.modal", () => $("#gName").focus());
$("#goalForm").addEventListener("submit", e => {
  e.preventDefault();
  const n = $("#gName").value.trim(), t = parseFloat($("#gTarget").value), sv = parseFloat($("#gSaved").value) || 0, f = $("#gFrom").value, u = $("#gUntil").value;
  const bad = !n ? "Enter a name for your goal." : !(t > 0) ? "Enter a target amount greater than zero." : t > 10000000 ? "Target amount is too large." : sv < 0 ? "Saved amount cannot be negative." : sv > t ? "Saved amount cannot be more than the target." : !f ? "Pick a Target from date." : !u ? "Pick a Target until date." : u <= f ? "Target until must be after Target from." : "";
  if (bad) { $("#gErr").textContent = bad; return $("#gErr").classList.remove("d-none"); }
  const list = myGoals(); list.push({ id: "g" + Date.now(), n, t: Math.round(t * 100) / 100, s: Math.round(sv * 100) / 100, from: f, until: u, i: ICONS[$("#gIcon").value] });
  store.set("pw_goals", list); flash("Goal added"); location.reload();
});

/* Add money to a goal / delete a goal */
let fundingId = null;
$("#goalGrid").addEventListener("click", e => {
  const del = e.target.closest("[data-del]");
  if (del && confirm("Delete this goal?")) { store.set("pw_goals", myGoals().filter(g => g.id !== del.dataset.del)); flash("Goal deleted"); return location.reload(); }
  const fund = e.target.closest("[data-fund]"); if (!fund) return;
  const g = getGoals().find(x => x.id === fund.dataset.fund); fundingId = g.id;
  $("#fTitle").textContent = `Add money to ${g.n}`; $("#fLeft").textContent = `${fmt(g.t - g.s)} left to reach your goal.`;
  $("#fAmt").value = ""; $("#fErr").classList.add("d-none"); bootstrap.Modal.getOrCreateInstance($("#fundModal")).show();
});
$("#fundModal").addEventListener("shown.bs.modal", () => $("#fAmt").focus());
$("#fundForm").addEventListener("submit", e => {
  e.preventDefault(); const amt = parseFloat($("#fAmt").value), g = getGoals().find(x => x.id === fundingId);
  const bad = !(amt > 0) ? "Enter an amount greater than zero." : amt > g.t - g.s + 0.005 ? `Only ${fmt(g.t - g.s)} is left for this goal.` : "";
  if (bad) { $("#fErr").textContent = bad; return $("#fErr").classList.remove("d-none"); }
  const added = store.get("pw_gadd") || {}; added[fundingId] = Math.round(((added[fundingId] || 0) + amt) * 100) / 100;
  store.set("pw_gadd", added); flash(`${fmt(amt)} added to ${g.n}`); location.reload();
});

/* Recurring bills: filter tabs, mark paid, status chart */
let billFilter = "all", billChart;
const PILL = { Paid: "ok", "Due soon": "warn", Upcoming: "mute", Overdue: "bad" };
const renderBills = () => {
  const bills = getBills(), shown = bills.filter(b => billFilter === "all" || (billFilter === "paid" ? b.paid : !b.paid));
  $("#billList").innerHTML = shown.length ? shown.map(b => `<div class="bill">
      ${catBadge(b.c)}
      <div class="b-name">${esc(b.n)}</div><div class="b-amt">${fmt(b.a)}</div>
      <div class="b-meta">${b.due} · ${b.f}</div>
      <div class="b-act"><span class="pill ${PILL[b.status]}">${b.status}</span><button class="check-btn ${b.paid ? "done" : ""}" data-pay="${b.key}" aria-pressed="${b.paid}" aria-label="${b.paid ? "Mark " + esc(b.n) + " as unpaid" : "Mark " + esc(b.n) + " as paid"}" title="${b.paid ? "Mark as unpaid" : "Mark as paid"}"><i class="bi bi-check-lg"></i></button></div>
    </div>`).join("") : '<div class="empty"><i class="bi bi-check2-all"></i>Nothing here.</div>';
  const paid = sum(bills.filter(b => b.paid), b => b.a), total = sum(bills, b => b.a);
  $("#billTotal").innerHTML = `<span>Paid <b>${fmt(paid)}</b></span><span>Still to pay <b>${fmt(total - paid)}</b></span><span>Total <b>${fmt(total)}</b></span>`;

  // bills chart
  const buckets = ["Paid", "Overdue", "Due soon", "Upcoming"], colors = ["#198754", "#dc3545", "#ffc107", "#9fb3b1"];
  if (billChart) billChart.destroy();
  billChart = new Chart($("#billChart"), { type: "doughnut",
    data: { labels: buckets, datasets: [{ data: buckets.map(s => sum(bills.filter(b => b.status === s), b => b.a)), backgroundColor: colors, borderWidth: 3, borderColor: getComputedStyle(document.body).getPropertyValue("--card").trim() || "#fff" }] },
    options: { maintainAspectRatio: false, cutout: "66%", plugins: { tooltip: { callbacks: { label: c => `${c.label}: ${fmt(c.parsed)}` } } } } });
};
$$("#billTabs button").forEach(b => b.onclick = () => { billFilter = b.dataset.f; $$("#billTabs button").forEach(x => x.classList.toggle("active", x === b)); renderBills(); });
$("#billList").addEventListener("click", e => {
  const b = e.target.closest("[data-pay]"); if (!b) return;
  const map = store.get("pw_billpaid") || {}, bill = getBills().find(x => x.key === b.dataset.pay);
  map[bill.key] = !bill.paid; store.set("pw_billpaid", map);
  renderBills(); renderGoals();                             // refresh the page parts
});
renderBills();
