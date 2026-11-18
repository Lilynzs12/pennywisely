/* goal-art.js - photos for goals and debts.
   Each photo is looked up in the folder  assets/img/photos/<name>.jpg  first.
   If that file is not there, the same photo is loaded from Unsplash (free under the Unsplash License).
   If neither loads, a soft gradient with an icon is shown (never a broken image). */
"use strict";
const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=400&q=80`;
const PHOTOS = {            // name: [online link, credit]
  hajj:      [U("1580418827493-f2b22c0a76cb"), "Kaaba with pilgrims, Mecca"],
  macbook:   [U("1608459266648-6f317872e914"), "MacBook Pro – Marc Mintel"],
  japan:     [U("1748582903466-2adc948723cf"), "Mount Fuji, Japan – Gab Pili"],
  maldives:  [U("1602217401731-1b9d5c2384f7"), "Maldives overwater villas – Upgraded Points"],
  camera:    [U("1678185507222-354e154ec848"), "Sony camera on a wooden table"],
  watch:     [U("1762708052123-7332966eaecb"), "Omega Planet Ocean – Charlie Mitchell"],
  savings:   [U("1701187260871-b18bfd010239"), "Piggy bank – Alla Kemelmakher"],
  home:      [U("1754962850942-5700d2939917"), "Modern house – Brandee Taylor"],
  car:       [U("1600112218627-1a108bf83e1a"), "Car at sunset – Jeff Vanderspank"],
  graduation:[U("1761781342506-821be95168c5"), "Graduation – Ethan Gowans"],
  card:      [U("1556742502-ec7c0e9f34b1"), "Visa card payment"]
};
const photoFor = (name, icon) => {                       // check the name first, then the icon
  const n = (name || "").toLowerCase();
  if (/haj|umrah|kaabah|kaaba|mecca|makkah|mekah/.test(n)) return "hajj";
  if (/japan|jepun|tokyo|kyoto|osaka|sakura/.test(n)) return "japan";
  if (/maldiv|bali|beach|honeymoon|island/.test(n)) return "maldives";
  if (/macbook|laptop|mac\b/.test(n)) return "macbook";
  if (/camera|kamera|sony/.test(n)) return "camera";
  if (/watch|jam tangan|rolex|omega/.test(n)) return "watch";
  return { "bi-moon-stars": "hajj", "bi-airplane": "japan", "bi-laptop": "macbook", "bi-house-heart": "home", "bi-car-front": "car", "bi-mortarboard": "graduation", "bi-credit-card": "card", "bi-piggy-bank": "savings", "bi-shield-check": "savings", "bi-gift": "watch" }[icon] || null;
};
const artFail = img => { if (!img.dataset.tried) { img.dataset.tried = 1; img.src = img.dataset.remote; } else img.remove(); };
window.artFail = artFail;
const banner = (key, icon, alt, pr, chip, chipIcon, done) => {
  const p = key && PHOTOS[key];
  return `<div class="goal-art ${done ? "done" : ""}" style="--pr:${pr}"><i class="bi ${icon} ga-fallback" aria-hidden="true"></i>
  ${p ? `<img src="assets/img/photos/${key}.jpg" data-remote="${p[0]}" alt="${esc(alt)}" title="Photo: ${p[1]} / Unsplash" loading="lazy" referrerpolicy="no-referrer" onerror="artFail(this)">` : ""}
  <span class="ga-chip"><i class="bi ${chipIcon}"></i>${chip}</span></div>`;
};
// Goals: photo gets more colour as you save
const goalArt = (g, p) => banner(photoFor(g.n, g.i), g.i, g.n, Math.min(p, 100) / 100, p >= 100 ? "Unlocked" : p + "% unlocked", p >= 100 ? "bi-unlock-fill" : "bi-lock-fill", p >= 100);
// Debts: full colour, shows how much is paid
const debtArt = d => { const p = Math.max(0, Math.min(100, Math.round((1 - d.bal / d.orig) * 100))); return banner(photoFor(d.n, d.icon), d.icon, d.n, 1, p + "% paid off", "bi-check2-circle", false); };
