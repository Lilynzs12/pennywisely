/* debts.js - debts page */
"use strict";
  const PAL = ["#0d6efd", "#fd7e14", "#dc3545", "#6610f2", "#198754", "#d63384", "#0dcaf0"];
  const TYPES = { Education: "bi-mortarboard", "Car loan": "bi-car-front", "Credit card": "bi-credit-card", "Buy now, pay later": "bi-bag-check", "Personal loan": "bi-cash-coin", Other: "bi-receipt" };
  const when = m => new Date(2026, 10 + m, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const span = m => { const y = Math.floor(m / 12), r = m % 12; return (y ? y + " yr " : "") + (r || !y ? r + " mo" : "").trim(); };
  const card = () => getComputedStyle(document.body).getPropertyValue("--card").trim() || "#fff";
  const getDebts = () => { const paid = store.get("pw_dpay") || {}; return [...PW.debts, ...(store.get("pw_dextra") || [])].map((d, i) => ({ ...d, bal: Math.max(Math.round((d.bal - (paid[d.id] || 0)) * 100) / 100, 0), color: PAL[i % PAL.length], icon: d.i || TYPES[d.type] || TYPES.Other })); };
  // calculate month by month: add interest, pay minimum, extra money goes to one debt
  const sim = (list, extra, strat, roll) => {
    const D = list.filter(d => d.bal > 0).map(d => ({ id: d.id, bal: d.bal, r: d.rate / 1200, m: d.pay, int: 0 }));
    const budget = sum(D, d => d.m) + extra, series = [sum(D, d => d.bal)], done = {}, ints = {}; let m = 0, tot = 0;
    while (D.some(d => d.bal > 0.005) && m < 600) {
      m++;
      D.forEach(d => { if (d.bal > 0.005) { const i = d.bal * d.r; d.bal += i; d.int += i; tot += i; } });
      let paid = 0;
      D.forEach(d => { if (d.bal > 0.005) { const p = Math.min(d.m, d.bal); d.bal -= p; paid += p; } });
      let pool = roll || extra > 0 ? budget - paid : 0;
      D.filter(d => d.bal > 0.005).sort((x, y) => strat === "av" ? y.r - x.r : x.bal - y.bal).forEach(d => { const p = Math.min(pool, d.bal); d.bal -= p; pool -= p; });
      D.forEach(d => { if (d.bal <= 0.005 && done[d.id] === undefined) done[d.id] = m; });
      series.push(Math.max(sum(D, d => d.bal), 0));
    }
    D.forEach(d => ints[d.id] = d.int);
    return { months: m, interest: tot, series, done, ints, never: m >= 600 };
  };
  let strat = "av", extra = 300, roll = true, charts = [];
  const NOTE = { av: "Avalanche clears the highest interest rate first. It costs the least interest.", sn: "Snowball clears the smallest balance first. Quick wins keep you motivated." };
  const render = () => {
    const L = getDebts(), act = L.filter(d => d.bal > 0), base = sim(L, 0, strat, false), plan = sim(L, extra, strat, roll);
    const owed = sum(act, d => d.bal), monthly = sum(act, d => d.pay), dsr = Math.round(monthly / profile.income * 100);
    $("#xtraVal").textContent = fmt(extra); $("#stratNote").textContent = NOTE[strat];
    $("#dKpis").innerHTML = [["Total debt", fmt(owed), "bi-bank", "primary", `${act.length} active debts`], ["Monthly payments", fmt(monthly), "bi-calendar-check", "warning", `${dsr}% of income · ${dsr <= 40 ? "healthy" : "high"}`], ["Interest still to pay", fmt(base.interest), "bi-percent", "danger", "at your current payments"], ["Debt-free by", base.never ? "Not on track" : when(base.months), "bi-flag", "success", base.never ? "Payments too low" : span(base.months) + " from now"]]
      .map(k => `<div class="card kpi lift"><div class="top"><span class="label">${k[0]}</span><span class="ico bg-${k[3]}-subtle text-${k[3]}-emphasis"><i class="bi ${k[2]}"></i></span></div><div class="value">${k[1]}</div><span class="small text-secondary">${k[4]}</span></div></div>`).join("");
    const saved = base.months - plan.months, sInt = base.interest - plan.interest;
    $("#plan").innerHTML = [["Debt-free by", plan.never ? "–" : when(plan.months), "primary"], ["Time saved", saved > 0 ? span(saved) : "None yet", "success"], ["Interest saved", fmt(Math.max(sInt, 0)), "success"]].map(x => `<div><div class="k">${x[0]}</div><div class="v">${x[1]}</div></div>`).join("");
    charts.forEach(c => c.destroy());
    const labels = base.series.map((_, i) => when(i)), pad = base.series.map((_, i) => plan.series[i] ?? 0);
    const line = (label, data, c, fill) => ({ label, data, borderColor: c, backgroundColor: c + "26", fill, tension: .3, pointRadius: 0, pointHoverRadius: 6, borderWidth: 2.5 });
    charts = [new Chart($("#payoffChart"), { type: "line", data: { labels, datasets: [line("Current payments", base.series, "#dc3545", false), line("With plan", pad, "#198754", true)] },
      options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${fmt(c.parsed.y)}` } } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } }, y: { beginAtZero: true, ticks: { callback: v => "RM " + v / 1000 + "k" } } } } }),
      new Chart($("#splitChart"), { type: "bar", data: { labels: act.map(d => d.n.split(" ")[0]), datasets: [{ label: "Principal owed", data: act.map(d => d.bal), backgroundColor: "#0d6efd", borderRadius: 5 }, { label: "Interest on plan", data: act.map(d => plan.ints[d.id] || 0), backgroundColor: "#dc3545", borderRadius: 5 }] },
        options: { maintainAspectRatio: false, indexAxis: "y", interaction: { mode: "index", intersect: false }, plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${fmt(c.parsed.x)}` } } }, scales: { x: { stacked: true, ticks: { callback: v => "RM " + v / 1000 + "k" } }, y: { stacked: true, grid: { display: false } } } } })];
    $("#dGrid").innerHTML = L.map(d => { const p = Math.max(0, Math.min(100, Math.round((d.orig - d.bal) / d.orig * 100))), left = base.done[d.id];
      return `<article class="card lift goal-card">${debtArt(d)}<div class="debt-head"><span class="cat-ico lg" style="background:${d.color}22;color:${d.color};"><i class="bi ${d.icon} fs-5"></i></span><div><h3>${esc(d.n)}</h3><span class="small text-secondary">${esc(d.type)} · ${d.rate}% a year</span></div>${String(d.id).startsWith("x") ? `<button class="btn-del" data-del="${d.id}" aria-label="Remove ${esc(d.n)}"><i class="bi bi-trash"></i></button>` : ""}</div>
        <div class="debt-bal">${fmt(d.bal)}</div><div class="progress mb-1" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar bg-success" style="width:${p}%"></div></div><div class="small text-secondary mb-3">${p}% paid off</div>
        <div class="d-flex justify-content-between small mb-3"><span>${fmt(d.pay)} / month</span><span class="fw-semibold">${d.bal <= 0 ? "Settled" : left ? "Clear by " + when(left) : "Payment too low"}</span></div>
        ${d.bal > 0 ? `<button class="btn btn-outline-secondary btn-sm w-100" data-pay="${d.id}"><i class="bi bi-cash-coin me-1"></i>Record payment</button>` : '<span class="badge text-bg-success">Debt cleared</span>'}</article>`; }).join("");
    const ord = act.filter(d => plan.done[d.id]).sort((a, b) => plan.done[a.id] - plan.done[b.id]);
    $("#order").innerHTML = ord.length ? ord.map((d, i) => `<li><span class="badge rounded-pill text-bg-primary">${i + 1}</span><span class="cat-ico" style="background:${d.color}22;color:${d.color}"><i class="bi ${d.icon}"></i></span><div class="grow"><div class="title">${esc(d.n)}</div><div class="sub">Interest paid ${fmt(plan.ints[d.id])}</div></div><b>${when(plan.done[d.id])}</b></li>`).join("") : '<li class="text-secondary py-3">No active debts. Great job!</li>';
  };
  $$("[data-strat]").forEach(b => b.onclick = () => { strat = b.dataset.strat; $$("[data-strat]").forEach(x => x.classList.toggle("active", x === b)); render(); });
  $("#xtra").addEventListener("input", e => { extra = +e.target.value; render(); });
  $("#roll").onchange = e => { roll = e.target.checked; render(); };
  // Record payment
  const pm = () => bootstrap.Modal.getOrCreateInstance($("#payModal"));
  const openPay = id => { $("#pErr").classList.add("d-none"); $("#pAmt").value = ""; $("#pDebt").innerHTML = getDebts().filter(d => d.bal > 0).map(d => `<option value="${d.id}">${esc(d.n)} (${fmt(d.bal)})</option>`).join(""); if (id) $("#pDebt").value = id; pm().show(); };
  $("#payBtn").onclick = () => openPay();
  $("#dGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-pay]"); if (b) return openPay(b.dataset.pay);
    const x = e.target.closest("[data-del]"); if (x && confirm("Remove this debt?")) { store.set("pw_dextra", (store.get("pw_dextra") || []).filter(d => d.id !== x.dataset.del)); flash("Debt removed"); location.reload(); }
  });
  $("#payModal").addEventListener("shown.bs.modal", () => $("#pAmt").focus());
  $("#payForm").addEventListener("submit", e => {
    e.preventDefault(); const id = $("#pDebt").value, amt = parseFloat($("#pAmt").value), d = getDebts().find(x => x.id === id);
    const bad = !d ? "No active debts to pay." : !(amt > 0) ? "Enter an amount greater than zero." : amt > d.bal ? `${d.n} only has ${fmt(d.bal)} left.` : "";
    if (bad) { $("#pErr").textContent = bad; return $("#pErr").classList.remove("d-none"); }
    const paid = store.get("pw_dpay") || {}; paid[id] = (paid[id] || 0) + amt; store.set("pw_dpay", paid); flash(`Payment of ${fmt(amt)} recorded`); location.reload();
  });
  // Add debt
  $("#dType").innerHTML = Object.keys(TYPES).map(t => `<option>${t}</option>`).join("");
  $("#debtModal").addEventListener("show.bs.modal", () => { $("#debtForm").reset(); $("#dErr").classList.add("d-none"); });
  $("#debtForm").addEventListener("submit", e => {
    e.preventDefault(); const n = $("#dName").value.trim(), bal = parseFloat($("#dBal").value), rate = parseFloat($("#dRate").value) || 0, pay = parseFloat($("#dPay").value);
    const bad = !n ? "Enter a name for this debt." : !(bal > 0) ? "Enter the balance you owe." : !(pay > 0) ? "Enter your monthly payment." : pay <= bal * rate / 1200 ? "The monthly payment must be higher than the monthly interest, or the debt never ends." : "";
    if (bad) { $("#dErr").textContent = bad; return $("#dErr").classList.remove("d-none"); }
    const ex = store.get("pw_dextra") || []; ex.push({ id: "x" + Date.now(), n, type: $("#dType").value, orig: bal, bal, rate, pay }); store.set("pw_dextra", ex); flash("Debt added"); location.reload();
  });
  render();
