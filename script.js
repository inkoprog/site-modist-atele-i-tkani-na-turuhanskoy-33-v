/* общие настройки */
const PHONE = "+79514780479";
const PHONE_VIEW = "+7 951 478-04-79";
const root = document.documentElement;
root.classList.add("js");

/* тема */
const themeBtn = document.getElementById("themeBtn");
const THEME_KEY = "modist-theme";

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeBtn) themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#12161c" : "#f2f3f0");
}

(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
})();

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* хранилище недоступно */ }
  });
}

/* меню */
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

function setMenu(open) {
  if (!burger || !nav) return;
  nav.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
}

if (burger && nav) {
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
}

/* тень шапки */
const header = document.getElementById("header");
if (header && "IntersectionObserver" in window) {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-stuck", !entry.isIntersecting);
  }).observe(sentinel);
}

/* подсветка пункта меню */
const navLinks = Array.from(document.querySelectorAll(".nav a"));
if ("IntersectionObserver" in window && navLinks.length) {
  const map = new Map();
  navLinks.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (section) map.set(section, a);
  });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.remove("is-active"));
      const link = map.get(entry.target);
      if (link) link.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, section) => spy.observe(section));
}

/* плавное появление блоков */
const revealItems = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  revealItems.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });
} else {
  revealItems.forEach((el) => el.classList.add("is-visible"));
}

/* форма заявки: открывает SMS мастеру */
const form = document.getElementById("requestForm");
const statusEl = document.getElementById("formStatus");

if (form && statusEl) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const task = String(data.get("task") || "").trim();

    let valid = true;
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("is-error"));
    if (name.length < 2) { form.elements.name.closest(".field").classList.add("is-error"); valid = false; }
    if (phone.replace(/\D/g, "").length < 10) { form.elements.phone.closest(".field").classList.add("is-error"); valid = false; }

    if (!valid) {
      statusEl.textContent = "Укажите имя и телефон, чтобы мастер мог перезвонить.";
      const firstBad = form.querySelector(".is-error input");
      if (firstBad) firstBad.focus();
      return;
    }

    const lines = [
      "Здравствуйте! Заявка с сайта ателье.",
      "Имя: " + name,
      "Телефон: " + phone,
      task ? "Что нужно сделать: " + task : "Прошу связаться со мной."
    ];
    statusEl.textContent = "Открываем сообщение для мастера. Если оно не открылось, позвоните: " + PHONE_VIEW + ".";
    window.location.href = "sms:" + PHONE + "?&body=" + encodeURIComponent(lines.join("\n"));
  });

  form.addEventListener("input", (e) => {
    const field = e.target.closest(".field");
    if (field) field.classList.remove("is-error");
  });
}

/* год в подвале */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
