/* budgets.js - budgets page */
"use strict";
const spent = spentByCat(), keys = Object.keys(PW.budgets);
const totalBudget = sum(keys, k => PW.budgets[k]), totalSpent = sum(keys, k => spent[k]);
const daysLeft = DAYS_IN_MONTH - TODAY_DAY + 1;

$("#bSummary").innerHTML = [
  ["Total budget", fmt(totalBudget), ""], ["Spent so far", fmt(totalSpent), ""],
  ["Remaining", fmt(totalBudget - totalSpent), totalBudget - totalSpent < 0 ? "text-danger" : "text-success"]
].map(k => `<div class="card kpi"><div class="label">${k[0]}</div><div class="value ${k[2]}">${k[1]}</div></div>`).join("");

$("#bGrid").innerHTML = keys.map(c => {
  const limit = PW.budgets[c], p = Math.round(spent[c] / limit * 100), left = limit - spent[c], perDay = Math.max(left, 0) / daysLeft;
  return `<article class="card lift">
    <div class="bud-head">${catBadge(c)}<div class="wrap-any"><h2>${c}</h2><span class="small text-secondary">Limit ${fmt(limit)}</span></div>
      <span class="badge ${p >= 100 ? "text-bg-danger" : p >= 80 ? "text-bg-warning" : "text-bg-success"}">${p}%</span>
      <button class="btn btn-sm btn-outline-secondary" data-edit="${c}" aria-label="Edit ${c} budget"><i class="bi bi-pencil-square"></i></button></div>
    ${progress(p)}
    <div class="bud-foot"><span>Spent <b>${fmt(spent[c])}</b></span><span class="${left < 0 ? "text-danger" : "text-secondary"}">${left < 0 ? "Over by " + fmt(-left) : fmt(left) + " left"}</span></div>
    <div class="forecast insight gold">${left <= 0 ? "Pause spending here until next month." : `You can spend about <b>${fmt(perDay)}</b> a day for the next ${daysLeft} days.`}</div>
  </article>`; }).join("");

// edit a limit: check, save, reload
let editing = null;
$("#bGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-edit]"); if (!b) return;
  editing = b.dataset.edit; $("#ebTitle").textContent = `Edit ${editing} budget`;
  $("#ebAmt").value = PW.budgets[editing]; $("#ebErr").classList.add("d-none");
  bootstrap.Modal.getOrCreateInstance($("#editBudget")).show();
});
$("#editBudget").addEventListener("shown.bs.modal", () => $("#ebAmt").select());
$("#ebForm").addEventListener("submit", e => {
  e.preventDefault(); const v = parseFloat($("#ebAmt").value);
  if (!(v > 0) || v > 100000) { $("#ebErr").textContent = "Enter a limit between RM 1 and RM 100,000."; return $("#ebErr").classList.remove("d-none"); }
  const saved = store.get("pw_budgets") || {}; saved[editing] = Math.round(v * 100) / 100;
  store.set("pw_budgets", saved); flash(`${editing} budget updated`); location.reload();
});
$("#ebReset").onclick = () => { store.set("pw_budgets", null); flash("Budgets reset to default"); location.reload(); };

new Chart($("#budgetChart"), { type: "bar",
  data: { labels: keys, datasets: [
    { label: "Budget", data: keys.map(k => PW.budgets[k]), backgroundColor: "#c9d8d6", borderRadius: 6 },
    { label: "Spent", data: keys.map(k => spent[k]), backgroundColor: keys.map(k => spent[k] > PW.budgets[k] ? "#d64545" : "#1fa37a"), borderRadius: 6 }] },
  options: { maintainAspectRatio: false, indexAxis: "y", plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${fmt(c.parsed.x)}` } } } } });
