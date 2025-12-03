(function () {
  let windowBindingsSetup = false;
  const baseURL = (() => {
    const override = document.documentElement.getAttribute("data-site-base");
    if (override) {
      return new URL(ensureTrailingSlash(override), window.location.origin);
    }
    const scriptEl = document.querySelector('script[src*="navmenu.js"]');
    if (!scriptEl) {
      return new URL("/", window.location.origin);
    }
    const absoluteSrc = new URL(scriptEl.getAttribute("src"), window.location.href);
    const basePath = absoluteSrc.pathname.replace(/assets\/js\/navmenu\.js$/, "");
    return new URL(basePath || "/", absoluteSrc.origin);
  })();

  function ensureTrailingSlash(value) {
    return value.endsWith("/") ? value : `${value}/`;
  }

  function resolvePath(relativePath) {
    if (!relativePath) {
      return null;
    }
    if (/^https?:\/\//i.test(relativePath)) {
      return relativePath;
    }
    const normalized = relativePath.replace(/^\/+/, "");
    const resolvedURL = new URL(normalized, baseURL);
    return resolvedURL.href;
  }

  function initNavMenu(root = document) {
    const menuToggle = root.querySelector("#menuToggle");
    const menuLinks = root.querySelectorAll(".menu-link");
    const body = document.body;

    if (!menuToggle || menuToggle.dataset.bound === "true") {
      return;
    }

    root.querySelectorAll("a[data-path]").forEach((link) => {
      const resolved = resolvePath(link.getAttribute("data-path"));
      if (resolved) {
        link.setAttribute("href", resolved);
      }
    });

    function toggleMenu(force) {
      const willOpen = typeof force === "boolean" ? force : !body.classList.contains("menu-open");
      body.classList.toggle("menu-open", willOpen);
      menuToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    }

    function setActiveMenuLink() {
      const currentPath = window.location.pathname;
      const currentPage = getCurrentPageFromPath(currentPath);
      
      menuLinks.forEach((link) => {
        link.classList.remove("active");
        const pageData = link.getAttribute("data-page");
        if (pageData === currentPage) {
          link.classList.add("active");
        }
      });
    }

    function getCurrentPageFromPath(path) {
      if (path.includes("about.html") || path.endsWith("/about")) {
        return "about";
      } else if (path.includes("services.html") || path.endsWith("/services")) {
        return "services";
      } else if (path.includes("contact.html") || path.endsWith("/contact")) {
        return "contact";
      } else {
        return "home";
      }
    }

    menuToggle.addEventListener("click", () => toggleMenu());
    menuToggle.dataset.bound = "true";

    // Set active menu link on load
    setActiveMenuLink();

    if (!windowBindingsSetup) {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          toggleMenu(false);
        }
      });
      windowBindingsSetup = true;
    }

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });
  }

  window.initNavMenu = initNavMenu;
  document.addEventListener("DOMContentLoaded", () => initNavMenu());
})();
