/* dashboard.js - dashboard page */
"use strict";
const hour = new Date().getHours(), hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
$("#greet").textContent = `${hello}, ${profile.name.split(" ")[0]}!`;

const spent = spentByCat(), { inc, exp } = totals();
const net = inc - exp, rate = Math.round(net / inc * 100);
const octRate = Math.round((PW.history.income[4] - PW.history.expense[4]) / PW.history.income[4] * 100);

/* ---- KPI tiles ---- */
const kpi = (label, value, icon, bg, delta, up, extra = "") =>
  `<div class="card kpi lift ${extra}"><div class="top"><span class="label">${label}</span><span class="ico" style="background:${bg}">${icon}</span></div><div class="value">${value}</div><span class="delta ${up ? "up" : "down"}">${delta}</span></div>`;
$("#kpis").innerHTML =
  kpi("Total balance", fmt(sum(getWallets().filter(w => LIQUID.includes(w.id)), w => w.bal)), '<i class="bi bi-wallet2 text-warning"></i>', "rgba(255,255,255,.12)", "▲ 3.1% vs last month", true, "hero") +
  kpi("Income this month", fmt(inc), '<i class="bi bi-arrow-down-left text-success"></i>', "#dff5ec", "▲ 1.9% vs Oct", true) +
  kpi("Expenses this month", fmt(exp), '<i class="bi bi-arrow-up-right text-danger"></i>', "#fde5e5", exp < PW.history.expense[4] ? "On track so far" : "Above Oct", exp < PW.history.expense[4]) +
  kpi("Savings rate", rate + "%", '<i class="bi bi-piggy-bank text-primary"></i>', "#e1ecff", (rate >= octRate ? "▲ " : "▼ ") + Math.abs(rate - octRate) + " pts vs Oct", rate >= octRate);

/* ---- How much can I spend per day ---- */
const budgetTotal = sum(Object.keys(PW.budgets), k => PW.budgets[k]), budgetSpent = sum(Object.keys(PW.budgets), k => spent[k]);
const daysLeft = DAYS_IN_MONTH - TODAY_DAY + 1, safePerDay = Math.max(budgetTotal - budgetSpent, 0) / daysLeft;
const unpaid = getBills().filter(b => !b.paid && b.status !== "Upcoming");
$("#heroChips").innerHTML = [
  ["bi-shield-check", "Safe to spend / day", budgetSpent > budgetTotal ? "Over budget" : fmt(safePerDay)],
  ["bi-calendar-event", "Days left this month", daysLeft],
  ["bi-bell", "Bills to pay soon", `${unpaid.length} · ${fmt(sum(unpaid, b => b.a))}`]
].map(c => `<div class="chip-stat"><i class="bi ${c[0]}"></i><div><div class="chip-label">${c[1]}</div><div class="chip-val">${c[2]}</div></div></div>`).join("");

/* ---- Charts ---- */
const BS = { primary: "#0d6efd", success: "#198754", warning: "#ffc107", danger: "#dc3545", info: "#0dcaf0" };
const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, "0");
const money = v => "RM " + (v >= 1000 ? v / 1000 + "k" : v);
const monthLabels = PW.months.map((m, i) => i === PW.months.length - 1 ? m + "*" : m);   // * = month so far
const tipY = c => `${c.dataset.label}: ${fmt(c.parsed.y)}`, noGrid = { display: false };

// 1) Income vs expenses (3M / 6M switch)
let flowChart;
const drawFlow = n => {
  if (flowChart) flowChart.destroy();
  flowChart = new Chart($("#flowChart"), { type: "bar",
    data: { labels: monthLabels.slice(-n), datasets: [
      { label: "Income", data: PW.history.income.slice(-n), backgroundColor: BS.success, borderRadius: 6, maxBarThickness: 40 },
      { label: "Expenses", data: PW.history.expense.slice(-n), backgroundColor: BS.danger, borderRadius: 6, maxBarThickness: 40 }] },
    options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
      plugins: { tooltip: { callbacks: { label: tipY, footer: items => "Net: " + fmt(items[0].parsed.y - items[1].parsed.y) } } },
      scales: { x: { grid: noGrid }, y: { ticks: { callback: money } } } } });
};
drawFlow(6);
$$("[data-range]").forEach(b => b.onclick = () => { $$("[data-range]").forEach(x => x.classList.remove("active")); b.classList.add("active"); drawFlow(+b.dataset.range); });

// 2) Spending: needs vs wants
const group = cats => PW.months.map((_, i) => sum(cats, k => i < 5 ? PW.catHistory[k][i] : spent[k]));
const area = (label, data, color) => ({ label, data, borderColor: color, backgroundColor: alpha(color, .2), fill: true, tension: .4, pointRadius: 4, pointHoverRadius: 7, pointBackgroundColor: color });
new Chart($("#trendChart"), { type: "line",
  data: { labels: monthLabels, datasets: [area("Essentials", group(["Housing", "Bills", "Health", "Transport"]), BS.primary), area("Lifestyle", group(["Food", "Shopping", "Leisure", "Pets"]), BS.warning)] },
  options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, plugins: { tooltip: { callbacks: { label: tipY } } }, scales: { x: { grid: noGrid }, y: { beginAtZero: true, ticks: { callback: money } } } } });

// 3) Expense categories
const catKeys = Object.keys(spent).filter(c => spent[c] > 0), totalSpent = sum(catKeys, c => spent[c]);
const centreText = { id: "centre", afterDraw(chart) {
  const { ctx, chartArea: a } = chart, x = (a.left + a.right) / 2, y = (a.top + a.bottom) / 2;
  ctx.save(); ctx.textAlign = "center";
  ctx.fillStyle = Chart.defaults.color; ctx.font = "600 12px Plus Jakarta Sans"; ctx.fillText("Total spent", x, y - 10);
  ctx.fillStyle = isDark() ? "#e5efee" : "#12292b"; ctx.font = "700 18px Plus Jakarta Sans"; ctx.fillText(fmt(totalSpent), x, y + 14); ctx.restore(); } };
new Chart($("#catChart"), { type: "doughnut", plugins: [centreText],
  data: { labels: catKeys, datasets: [{ data: catKeys.map(c => spent[c]), backgroundColor: catKeys.map(c => PW.cats[c].c), borderWidth: 3, borderColor: getComputedStyle(document.body).getPropertyValue("--card").trim() || "#fff", hoverOffset: 12 }] },
  options: { maintainAspectRatio: false, cutout: "68%", plugins: { tooltip: { callbacks: { label: c => `${c.label}: ${fmt(c.parsed)} (${Math.round(c.parsed / totalSpent * 100)}%)` } } } } });

// 4) Budget vs spent
const budgetKeys = Object.keys(PW.budgets), used = k => spent[k] / PW.budgets[k];
new Chart($("#budgetChart"), { type: "bar",
  data: { labels: budgetKeys, datasets: [
    { label: "Budget", data: budgetKeys.map(k => PW.budgets[k]), backgroundColor: alpha(BS.primary, .3), borderRadius: 5 },
    { label: "Actual", data: budgetKeys.map(k => spent[k]), backgroundColor: budgetKeys.map(k => used(k) >= 1 ? BS.danger : used(k) >= .8 ? BS.warning : BS.success), borderRadius: 5 }] },
  options: { maintainAspectRatio: false, indexAxis: "y", interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "top", labels: { generateLabels: () => [{ text: "Budget", fillStyle: alpha(BS.primary, .3), strokeStyle: "transparent", pointStyle: "circle" }, { text: "Actual", fillStyle: BS.success, strokeStyle: "transparent", pointStyle: "circle" }] } },
      tooltip: { callbacks: { label: c => `${c.dataset.label}: ${fmt(c.parsed.x)}`, footer: items => "Used: " + Math.round(used(items[0].label) * 100) + "%" } } },
    scales: { x: { ticks: { callback: money } }, y: { grid: noGrid } } } });

// 5) Savings per month
const saved = PW.months.map((_, i) => PW.history.income[i] - PW.history.expense[i]); let running = 0; const runTotal = saved.map(v => (running += v));
new Chart($("#saveChart"), { data: { labels: monthLabels, datasets: [
  { type: "bar", label: "Saved this month", data: saved, backgroundColor: alpha(BS.info, .85), borderRadius: 6, maxBarThickness: 40 },
  { type: "line", label: "Total saved", data: runTotal, borderColor: BS.primary, backgroundColor: alpha(BS.primary, .1), fill: true, tension: .35, pointRadius: 4, pointHoverRadius: 7, pointBackgroundColor: BS.primary }] },
  options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, plugins: { tooltip: { callbacks: { label: tipY } } }, scales: { x: { grid: noGrid }, y: { beginAtZero: true, ticks: { callback: money } } } } });

/* ---- Money health score and tips ---- */
const goals = getGoals();
const withinBudget = budgetKeys.filter(c => spent[c] <= PW.budgets[c]).length;
const goalProgress = goals.reduce((s, g) => s + Math.min(g.s / g.t, 1), 0) / goals.length;
const score = Math.round(Math.min(rate / 30, 1) * 40 + withinBudget / budgetKeys.length * 40 + goalProgress * 20);
$("#score").style.setProperty("--s", score);
$("#score div").innerHTML = `${score}<small>out of 100</small>`;
$("#scoreLabel").textContent = score >= 80 ? "Excellent" : score >= 65 ? "Healthy" : "Needs attention";

const over = budgetKeys.filter(c => spent[c] > PW.budgets[c]), topCat = [...budgetKeys].sort((a, b) => spent[b] - spent[a])[0];
const tips = [];
over.forEach(c => tips.push(`<b>${c}</b> is ${fmt(spent[c] - PW.budgets[c])} over budget. Consider pausing spending there.`));
tips.push(`You are saving <b>${rate}%</b> of income, ${rate >= 20 ? "above" : "below"} the 20% rule of thumb.`);
tips.push(`<b>${unpaid.length} bill${unpaid.length === 1 ? "" : "s"}</b> worth ${fmt(sum(unpaid, b => b.a))} ${unpaid.length === 1 ? "is" : "are"} due soon. Keep cash ready.`);
tips.push(`Biggest expense category: <b>${topCat}</b> at ${fmt(spent[topCat])}.`);
$("#insights").innerHTML = tips.map(t => `<div class="insight">${t}</div>`).join("");

/* ---- Lists ---- */
$("#recentTx").innerHTML = allTx().slice(0, 6).map(t =>
  `<li>${catBadge(t.c)}<div class="grow"><div class="title">${esc(t.n)}</div><div class="sub">${dateFmt(t.d)} · ${t.c}</div></div><b class="${t.t === "in" ? "text-success" : ""}">${t.t === "in" ? "+" : "-"}${fmt(t.a)}</b></li>`).join("");
$("#upBills").innerHTML = getBills().filter(b => !b.paid).map(b =>
  `<li>${catBadge(b.c)}<div class="grow"><div class="title">${esc(b.n)}</div><div class="sub">${b.due} · ${b.f}</div></div><b>${fmt(b.a)}</b></li>`).join("") || '<li class="text-secondary">All bills are paid. Nice!</li>';
$("#goalList").innerHTML = goals.slice(0, 4).map(g => { const p = Math.min(Math.round(g.s / g.t * 100), 100);
  return `<li><div class="grow"><div class="d-flex justify-content-between gap-2 mb-1"><span class="title">${esc(g.n)}</span><b>${p}%</b></div>${bar(p, p >= 100 ? "bg-success" : "bg-primary")}</div></li>`; }).join("");
