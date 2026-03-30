const USER_KEY = "fundrise_user";
const FLASH_KEY = "fundrise_flash_message";

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function getNextId(records) {
  return (
    records.reduce((maxId, record) => {
      const numericId = Number(record.id);
      return Number.isNaN(numericId) ? maxId : Math.max(maxId, numericId);
    }, 0) + 1
  );
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
// XSS Attack (اختراق عن طريق إدخال كود)
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sameId(left, right) {
  if (left == null || right == null) return false;
  return String(left) === String(right);
}

export function showTopMessage(message, type = "success") {
  let container = document.getElementById("topMessage");

  if (!container) {
    container = document.createElement("div");
    container.id = "topMessage";
    container.className = "top-message hidden";
    document.body.appendChild(container);
  }

  container.className = `top-message top-message--${type}`;
  container.textContent = message;

  window.clearTimeout(container.hideTimer);
  container.hideTimer = window.setTimeout(() => {
    container.className = "top-message hidden";
    container.textContent = "";
  }, 3200);
}

export function setFlashMessage(message, type = "success") {
  sessionStorage.setItem(
    FLASH_KEY,
    JSON.stringify({
      message,
      type,
    }),
  );
}

export function renderFlashMessage() {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return;

  sessionStorage.removeItem(FLASH_KEY);

  try {
    const flash = JSON.parse(raw);
    if (!flash.message) return;
    showTopMessage(flash.message, flash.type || "success");
  } catch {
    showTopMessage(raw, "success");
  }
}
