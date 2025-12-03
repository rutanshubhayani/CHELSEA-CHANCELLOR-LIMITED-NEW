const loaderBaseURL = (() => {
  const override = document.documentElement.getAttribute("data-site-base");
  if (override) {
    return new URL(ensureTrailingSlash(override), window.location.origin);
  }
  const scriptEl = document.currentScript || document.querySelector('script[src*="components-loader.js"]');
  if (!scriptEl) {
    return new URL("/", window.location.origin);
  }
  const absolute = new URL(scriptEl.getAttribute("src"), window.location.href);
  const basePath = absolute.pathname.replace(/assets\/js\/components-loader\.js$/, "");
  return new URL(basePath || "/", absolute.origin);
})();

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-component-src]").forEach((target) => {
    loadComponent(target);
  });
});

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function resolveComponentPath(relativePath) {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const normalized = relativePath.replace(/^\/+/, "");
  return new URL(normalized, loaderBaseURL).href;
}

function applyDataPaths(target) {
  target.querySelectorAll("[data-path]").forEach((node) => {
    const resolved = resolveComponentPath(node.getAttribute("data-path"));
    if (resolved) {
      node.setAttribute("href", resolved);
    }
  });
}

async function loadComponent(target) {
  const src = target.getAttribute("data-component-src");
  if (!src) return;

  try {
    const html = await fetchComponent(src);
    injectComponent(html, target);
  } catch (error) {
    console.warn(`Fetch failed for ${src}. Falling back to iframe loader.`, error);
    loadComponentViaIframe(src, target);
  }
}

async function fetchComponent(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Failed to load ${src}`);
  return response.text();
}

function injectComponent(htmlString, target) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  doc.querySelectorAll("script").forEach((node) => node.remove());
  const markup = doc.body ? doc.body.innerHTML : htmlString;
  target.innerHTML = markup;

  applyDataPaths(target);

  if (typeof window.initNavMenu === "function" && target.dataset.component === "navmenu") {
    window.initNavMenu(target);
  }
}

function loadComponentViaIframe(src, target) {
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.style.display = "none";
  iframe.onload = () => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error(`Unable to access document for ${src}`);
      doc.querySelectorAll("script").forEach((node) => node.remove());
      const markup = doc.body ? doc.body.innerHTML : "";
      target.innerHTML = markup;
      applyDataPaths(target);
      if (typeof window.initNavMenu === "function" && target.dataset.component === "navmenu") {
        window.initNavMenu(target);
      }
    } catch (err) {
      console.error(err);
      target.innerHTML = `<p style="color:#f33;font-family:sans-serif;">Unable to load component: ${src}</p>`;
    } finally {
      iframe.remove();
    }
  };
  iframe.onerror = () => {
    target.innerHTML = `<p style="color:#f33;font-family:sans-serif;">Unable to load component: ${src}</p>`;
    iframe.remove();
  };
  document.body.appendChild(iframe);
}
