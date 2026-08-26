/**
 * TaskMeet - Navegación y estructura inicial
 * Solo gestiona el cambio de secciones y el menú responsive.
 */

const sectionMeta = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Resumen general del sistema",
  },
  tareas: {
    title: "Tareas",
    subtitle: "Gestión de tareas del sistema",
  },
  reuniones: {
    title: "Reuniones",
    subtitle: "Gestión de reuniones del sistema",
  },
};

function initIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  const navItems = document.querySelectorAll(".nav-item");
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");
  const meta = sectionMeta[sectionId];

  sections.forEach(function (section) {
    const isTarget = section.id === "section-" + sectionId;
    section.classList.toggle("is-visible", isTarget);
    section.hidden = !isTarget;
  });

  navItems.forEach(function (item) {
    const isActive = item.dataset.section === sectionId;
    item.classList.toggle("is-active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  if (meta) {
    pageTitle.textContent = meta.title;
    pageSubtitle.textContent = meta.subtitle;
  }

  closeSidebar();
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const toggle = document.getElementById("menu-toggle");

  sidebar.classList.add("is-open");
  overlay.classList.add("is-visible");
  overlay.hidden = false;
  toggle.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const toggle = document.getElementById("menu-toggle");

  sidebar.classList.remove("is-open");
  overlay.classList.remove("is-visible");
  overlay.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");

  if (sidebar.classList.contains("is-open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      showSection(item.dataset.section);
    });
  });
}

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const overlay = document.getElementById("sidebar-overlay");

  toggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", closeSidebar);
}

document.addEventListener("DOMContentLoaded", function () {
  initIcons();
  initNavigation();
  initMobileMenu();
});
