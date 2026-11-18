/* reports.js - reports page */
"use strict";
  const keys = Object.keys(PW.budgets), spent = spentByCat(), M = PW.months, inc = PW.history.income, exp = PW.history.expense;
  let stack, rate, N = 6;
  const draw = n => {
    N = n; const s = -n;
    [stack, rate].forEach(c => c && c.destroy());
    stack = new Chart($("#stackChart"), { type: "bar", data: { labels: M.slice(s), datasets: keys.map(k => ({ label: k, data: PW.catHistory[k].concat(spent[k]).slice(s), backgroundColor: PW.cats[k].c })) },
      options: { maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => "RM " + v / 1000 + "k" } } }, plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${fmt(c.parsed.y)}` } } } } });
    const r = inc.map((v, i) => Math.round((v - exp[i]) / v * 100)).slice(s);
    rate = new Chart($("#rateChart"), { type: "line", data: { labels: M.slice(s), datasets: [{ label: "Savings rate", data: r, borderColor: "#1fa37a", backgroundColor: "rgba(31,163,122,.15)", fill: true, tension: .35, pointRadius: 4 }, { label: "20% target", data: r.map(() => 20), borderColor: "#d4a62a", borderDash: [6, 4], pointRadius: 0 }] },
      options: { maintainAspectRatio: false, scales: { y: { ticks: { callback: v => v + "%" } } }, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y}%` } } } } });
    const I = inc.slice(s), E = exp.slice(s), best = r.indexOf(Math.max(...r));
    $("#repKpis").innerHTML = [["Average monthly spend", fmt(sum(E, x => x) / n)], ["Average monthly savings", fmt((sum(I, x => x) - sum(E, x => x)) / n)], ["Best savings month", `${M.slice(s)[best]} (${r[best]}%)`]].map(k => `<div class="card kpi"><div class="label">${k[0]}</div><div class="value">${k[1]}</div></div>`).join("");
    $("#repBody").innerHTML = M.slice(s).map((m, i) => { const j = M.length + s + i, nt = inc[j] - exp[j]; return `<tr><td class="fw-semibold">${m} 2026</td><td>${fmt(inc[j])}</td><td>${fmt(exp[j])}</td><td class="fw-bold ${nt >= 0 ? "text-success" : "text-danger"}">${fmt(nt)}</td><td class="text-end">${Math.round(nt / inc[j] * 100)}%</td></tr>`; }).join("");
  };
  $$("[data-range]").forEach(b => b.onclick = () => { $$("[data-range]").forEach(x => x.classList.remove("active")); b.classList.add("active"); draw(+b.dataset.range); });
  $("#topBody").innerHTML = allTx().filter(t => t.t === "out").sort((x, y) => y.a - x.a).slice(0, 5).map(t => `<tr><td><div class="d-flex align-items-center gap-2">${catBadge(t.c)}<span class="fw-semibold wrap-any">${esc(t.n)}</span></div></td><td class="d-none d-sm-table-cell">${t.c}</td><td class="text-end fw-bold">${fmt(t.a)}</td></tr>`).join("");
  $("#printBtn").onclick = () => window.print();
  $("#csvBtn").onclick = () => {
    const csv = "Month,Income,Expenses,Net\n" + M.slice(-N).map((m, i) => { const j = M.length - N + i; return [m + " 2026", inc[j], exp[j].toFixed(2), (inc[j] - exp[j]).toFixed(2)].join(","); }).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "pennywisely-report.csv"; a.click();
  };
  // reminders
  { const soon = getBills().filter(b => !b.paid && b.status !== "Upcoming"), hot = keys.map(k => [k, Math.round(spent[k] / PW.budgets[k] * 100)]).filter(x => x[1] >= 80).sort((x, y) => y[1] - x[1])[0];
    const paid = store.get("pw_dpay") || {}, debt = PW.debts.map(d => ({ ...d, bal: d.bal - (paid[d.id] || 0) })).filter(d => d.bal > 0).sort((x, y) => y.rate - x.rate)[0];
    const items = [];
    if (soon.length) items.push(["bi-bell", `${soon.length} bill${soon.length > 1 ? "s" : ""} due soon (${fmt(sum(soon))}). Keep cash ready.`, "goals.html", "View bills"]);
    if (hot) items.push(["bi-exclamation-triangle", hot[1] >= 100 ? `<b>${hot[0]}</b> is over budget.` : `<b>${hot[0]}</b> is almost at its limit (${hot[1]}%).`, "transactions.html?cat=" + encodeURIComponent(hot[0]), "See spending"]);
    if (debt && debt.rate >= 10) items.push(["bi-percent", `<b>${debt.n}</b> charges ${debt.rate}% a year. Pay it off first.`, "debts.html", "Open debts"]);
    $("#pattern").innerHTML = `<h2 class="mb-3"><i class="bi bi-lightbulb text-warning me-2"></i>Don't miss</h2>` + (items.length
      ? `<div class="d-grid gap-2">${items.map(i => `<div class="insight gold d-flex align-items-center gap-3"><i class="bi ${i[0]}"></i><span class="flex-grow-1">${i[1]}</span><a class="fw-bold text-decoration-none text-nowrap" href="${i[2]}">${i[3]} <i class="bi bi-arrow-right"></i></a></div>`).join("")}</div>`
      : '<p class="mb-0 text-secondary">Nothing to worry about. You are on track.</p>'); }
  draw(6);
