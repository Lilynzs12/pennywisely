/* account.js - account page */
"use strict";
const fillProfile = () => { $("#accName").textContent = profile.name; $("#accEmail").textContent = profile.email; $("#avatarBig").textContent = initials(profile.name); };
fillProfile();
$("#pName").value = profile.name; $("#pEmail").value = profile.email; $("#pPhone").value = profile.phone; $("#pIncome").value = profile.income;

// switches save straight away
const prefs = { sAlerts: "alerts", sBills: "bills", sWeekly: "weekly" };
Object.keys(prefs).forEach(id => { $("#" + id).checked = profile[prefs[id]]; $("#" + id).onchange = e => { profile[prefs[id]] = e.target.checked; store.set("pw_profile", profile); }; });

$("#profileForm").addEventListener("submit", e => {
  e.preventDefault();
  Object.assign(profile, { name: $("#pName").value.trim() || profile.name, email: $("#pEmail").value.trim(), phone: $("#pPhone").value.trim(), income: +$("#pIncome").value || profile.income });
  store.set("pw_profile", profile); fillProfile(); $("#topAv").textContent = initials(profile.name);
  const msg = $("#saveMsg"); msg.classList.remove("d-none"); setTimeout(() => msg.classList.add("d-none"), 3000);
});
$("#logoutBtn2").onclick = logout;

/* backup, restore and reset (data saved as "pw_...") */
const DATA_KEYS = ["pw_profile", "pw_extra", "pw_budgets", "pw_goals", "pw_gadd", "pw_billpaid", "pw_dpay", "pw_dextra", "pw_wd"];
$("#backupBtn").onclick = () => {
  const data = {}; DATA_KEYS.forEach(k => { const v = store.get(k); if (v !== null) data[k] = v; });
  download("pennywisely-backup.json", JSON.stringify({ app: "pennywisely", version: 1, data }, null, 2), "application/json");
};
$("#restoreFile").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.app !== "pennywisely" || typeof parsed.data !== "object") throw new Error("bad file");
    DATA_KEYS.forEach(k => { if (k in parsed.data) store.set(k, parsed.data[k]); });
    flash("Backup restored"); location.reload();
  } catch (err) { alert("That file is not a valid Pennywisely backup."); }
  e.target.value = "";
});
$("#resetBtn").onclick = () => {
  if (!confirm("Remove everything you added (transactions, goals, payments, budget edits)? Demo data stays.")) return;
  DATA_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
  flash("Data reset"); location.reload();
};
