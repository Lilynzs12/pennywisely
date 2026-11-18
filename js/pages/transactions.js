/* transactions.js - transactions page */
"use strict";
const PER_PAGE = 10; let pageNo = 1, lastRows = [];
const catSelect = $("#fCat");
Object.keys(PW.cats).forEach(c => catSelect.insertAdjacentHTML("beforeend", `<option>${c}</option>`));

// links from Reports open the filtered list
{ const qs = new URLSearchParams(location.search), cat = qs.get("cat"), q = qs.get("q");
  if (cat && PW.cats[cat]) catSelect.value = cat; if (q) $("#fSearch").value = q; }

const nameCell = t => `<span class="tx-name fw-semibold">${esc(t.n)}</span>${t.id ? '<span class="badge text-bg-light border ms-1 align-middle">Manual</span>' : ""}`;

// page buttons
const drawPager = pages => {
  const li = (label, p, cls = "", aria = "") => `<li class="page-item ${cls}"><button class="page-link" data-pg="${p}" ${aria}>${label}</button></li>`;
  let html = li('<i class="bi bi-chevron-left"></i><span class="visually-hidden">Previous</span>', pageNo - 1, pageNo === 1 ? "disabled" : "");
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - pageNo) <= 1) html += li(p, p, p === pageNo ? "active" : "", p === pageNo ? 'aria-current="page"' : "");
    else if (Math.abs(p - pageNo) === 2) html += '<li class="page-item disabled"><span class="page-link">…</span></li>';
  }
  html += li('<i class="bi bi-chevron-right"></i><span class="visually-hidden">Next</span>', pageNo + 1, pageNo === pages ? "disabled" : "");
  $("#pager").innerHTML = pages > 1 ? html : "";
};

const draw = () => {
  const q = $("#fSearch").value.toLowerCase(), cat = catSelect.value, type = $("#fType").value, order = $("#fSort").value;
  const rows = allTx().filter(t => (!q || t.n.toLowerCase().includes(q)) && (!cat || t.c === cat) && (!type || t.t === type));
  if (order === "hi") rows.sort((a, b) => b.a - a.a);
  if (order === "lo") rows.sort((a, b) => a.a - b.a);
  if (order === "old") rows.reverse();
  const pages = Math.max(Math.ceil(rows.length / PER_PAGE), 1); pageNo = Math.min(pageNo, pages);
  const view = rows.slice((pageNo - 1) * PER_PAGE, pageNo * PER_PAGE);

  $("#txBody").innerHTML = view.length ? view.map(t => `<tr>
      <td class="text-nowrap">${dateFmt(t.d)}</td>
      <td><div class="d-flex align-items-center gap-2">${catBadge(t.c)}<div class="grow" style="min-width:0">${nameCell(t)}<div class="small text-secondary d-md-none">${t.c} · ${t.m}</div></div></div></td>
      <td class="d-none d-md-table-cell">${t.c}</td><td class="d-none d-lg-table-cell">${t.m}</td>
      <td class="text-end fw-bold ${t.t === "in" ? "text-success" : ""}">${t.t === "in" ? "+" : "-"}${fmt(t.a)}${t.id ? `<button class="btn-del" data-del="${t.id}" aria-label="Delete ${esc(t.n)}" title="Delete"><i class="bi bi-trash3"></i></button>` : ""}</td></tr>`).join("")
    : '<tr><td colspan="5"><div class="empty"><i class="bi bi-inbox"></i>No transactions match your filters.</div></td></tr>';
  $("#pgInfo").textContent = rows.length ? `Showing ${(pageNo - 1) * PER_PAGE + 1}–${(pageNo - 1) * PER_PAGE + view.length} of ${rows.length}` : "No results";
  drawPager(pages);

  const i = sum(rows.filter(r => r.t === "in"), r => r.a), o = sum(rows.filter(r => r.t === "out"), r => r.a);
  $("#sumIn").textContent = fmt(i); $("#sumOut").textContent = fmt(o); $("#sumNet").textContent = fmt(i - o); $("#sumCount").textContent = rows.length;
  lastRows = rows;                                         // csv uses all filtered rows
};

["input", "change"].forEach(ev => $$("#fSearch,#fCat,#fType,#fSort").forEach(el => el.addEventListener(ev, () => { pageNo = 1; draw(); })));
$("#pager").addEventListener("click", e => {
  const b = e.target.closest("[data-pg]"); if (!b || b.parentElement.classList.contains("disabled")) return;
  pageNo = +b.dataset.pg; draw(); $("#txCard").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#clearFilters").addEventListener("click", () => { $("#fSearch").value = ""; catSelect.value = ""; $("#fType").value = ""; $("#fSort").value = "new"; pageNo = 1; draw(); });
// delete your own transaction (sample ones cannot be deleted)
$("#txBody").addEventListener("click", e => {
  const b = e.target.closest("[data-del]"); if (!b || !confirm("Delete this transaction?")) return;
  store.set("pw_extra", (store.get("pw_extra") || []).filter(x => String(x.id) !== b.dataset.del)); flash("Transaction deleted"); location.reload();
});
$("#exportBtn").onclick = () => download("pennywisely-transactions.csv",
  "Date,Description,Category,Type,Method,Amount\n" + lastRows.map(r => [r.d, `"${r.n.replace(/"/g, '""')}"`, r.c, r.t, r.m, r.a].join(",")).join("\n"));
draw();
