const SESSION_KEY = "playlearn:session";

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getGoogleClientId() {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
}

export function isGoogleConfigured() {
  return getGoogleClientId().length > 0;
}

let currentUser = readSession();
const listeners = new Set();
let scriptPromise = null;
let initialized = false;

export function getCurrentUser() {
  return currentUser;
}

export function subscribeAuth(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn(currentUser));
}

export function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      resolve();
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function signInWithCredential(credential) {
  const payload = decodeJwt(credential);
  if (!payload || !payload.sub) return null;
  const user = {
    sub: payload.sub,
    email: payload.email || "",
    name: payload.name || "",
    picture: payload.picture || "",
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    return null;
  }
  currentUser = user;
  emit();
  return user;
}

export async function initGoogleAuth() {
  if (!isGoogleConfigured()) return;
  await loadGoogleScript();
  if (!window.google || !window.google.accounts || !window.google.accounts.id)
    return;
  if (initialized) return;
  initialized = true;
  window.google.accounts.id.initialize({
    client_id: getGoogleClientId(),
    callback: (resp) => signInWithCredential(resp.credential),
    auto_select: false,
  });
}

export async function renderGoogleButton(el, opts = {}) {
  if (!el || !isGoogleConfigured()) return;
  await initGoogleAuth();
  if (!window.google || !window.google.accounts || !window.google.accounts.id)
    return;
  el.innerHTML = "";
  window.google.accounts.id.renderButton(el, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "pill",
    width: 250,
    ...opts,
  });
}

export function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
  currentUser = null;
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  emit();
}
