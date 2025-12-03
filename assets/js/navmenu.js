(function () {
  let windowBindingsSetup = false;

  function initNavMenu(root = document) {
    const menuToggle = root.querySelector("#menuToggle");
    const menuLinks = root.querySelectorAll(".menu-link");
    const body = document.body;

    if (!menuToggle || menuToggle.dataset.bound === "true") {
      return;
    }

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
