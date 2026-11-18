/* login.js - login page */
"use strict";
const form = $("#loginForm"), err = $("#loginError"), userIn = $("#username"), passIn = $("#password");

const clearError = () => { err.classList.add("d-none"); [userIn, passIn].forEach(i => i.classList.remove("is-invalid")); };
const fail = (message, field) => {
  err.innerHTML = `<i class="bi bi-exclamation-circle me-2"></i>${message}`;
  err.classList.remove("d-none"); field.classList.add("is-invalid"); field.focus();
};
[userIn, passIn].forEach(i => i.addEventListener("input", clearError));

form.addEventListener("submit", e => {
  e.preventDefault(); clearError();
  const u = userIn.value.trim(), p = passIn.value;
  if (!u && !p) { passIn.classList.add("is-invalid"); return fail("Please enter your username and password.", userIn); }
  if (!u) return fail("Username is required.", userIn);
  if (!p) return fail("Password is required.", passIn);
  if (u !== PW.user.username) return fail("Invalid username. Check for typos and try again.", userIn);
  if (p !== PW.user.password) { passIn.value = ""; return fail("Incorrect password. Please try again.", passIn); }
  // fake loading (no real server)
  const btn = $("#loginBtn"); btn.disabled = true;
  $(".spinner-border", btn).classList.remove("d-none"); $(".bi-arrow-right", btn).classList.add("d-none"); $(".btn-label", btn).textContent = "Signing in…";
  setTimeout(login, 700);
});

// auto-fill the test account
$("#demoFill").addEventListener("click", () => { userIn.value = PW.user.username; passIn.value = PW.user.password; clearError(); passIn.focus(); });
// Show / hide password
$("#togglePw").addEventListener("click", () => {
  const show = passIn.type === "password"; passIn.type = show ? "text" : "password";
  $("#togglePw i").className = "bi " + (show ? "bi-eye-slash" : "bi-eye");
  $("#togglePw").setAttribute("aria-label", show ? "Hide password" : "Show password");
});

// year in footer
$("#yr").textContent = new Date().getFullYear();

/* ---- Greeting and Caps Lock warning ---- */
const hr = new Date().getHours();
$("#greet").textContent = hr < 5 ? "Still up?" : hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
passIn.addEventListener("keydown", e => $("#capsWarn").classList.toggle("d-none", !e.getModifierState("CapsLock")));
passIn.addEventListener("keyup", e => $("#capsWarn").classList.toggle("d-none", !e.getModifierState("CapsLock")));
