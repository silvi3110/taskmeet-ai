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

const tasks = [];
let editingTaskId = null;
let nextTaskId = 1;

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

function getTaskFormElements() {
  return {
    card: document.getElementById("task-form-card"),
    form: document.getElementById("task-form"),
    title: document.getElementById("task-title"),
    description: document.getElementById("task-description"),
    date: document.getElementById("task-date"),
    priority: document.getElementById("task-priority"),
    status: document.getElementById("task-status"),
    heading: document.getElementById("task-form-title"),
    message: document.getElementById("task-form-message"),
  };
}

function resetTaskForm() {
  const elements = getTaskFormElements();
  elements.form.reset();
  elements.message.hidden = true;
  elements.message.textContent = "";
  editingTaskId = null;
}

function openTaskForm(task) {
  const elements = getTaskFormElements();
  resetTaskForm();
  elements.heading.textContent = task ? "Editar tarea" : "Nueva tarea";

  if (task) {
    editingTaskId = task.id;
    elements.title.value = task.title;
    elements.description.value = task.description;
    elements.date.value = task.date;
    elements.priority.value = task.priority;
    elements.status.value = task.status;
  }

  elements.card.hidden = false;
  elements.title.focus();
}

function closeTaskForm() {
  resetTaskForm();
  getTaskFormElements().card.hidden = true;
}

function showFormMessage(message) {
  const messageElement = getTaskFormElements().message;
  messageElement.textContent = message;
  messageElement.hidden = false;
}

function validateTask(task) {
  if (!task.title || !task.date || !task.priority || !task.status) {
    return "Completá los campos obligatorios para guardar la tarea.";
  }

  return "";
}

function saveTask(event) {
  event.preventDefault();
  const elements = getTaskFormElements();
  const taskData = {
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    date: elements.date.value,
    priority: elements.priority.value,
    status: elements.status.value,
  };
  const validationMessage = validateTask(taskData);

  if (validationMessage) {
    showFormMessage(validationMessage);
    return;
  }

  if (editingTaskId) {
    const taskIndex = tasks.findIndex(function (task) {
      return task.id === editingTaskId;
    });

    if (taskIndex === -1) {
      closeTaskForm();
      renderTasks();
      return;
    }

    tasks[taskIndex] = { id: editingTaskId, ...taskData };
  } else {
    tasks.push({ id: nextTaskId, ...taskData });
    nextTaskId += 1;
  }

  closeTaskForm();
  renderTasks();
}

function formatTaskDate(date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

function getBadgeClass(type, value) {
  const classNames = {
    Baja: "badge--low",
    Media: "badge--medium",
    Alta: "badge--high",
    Pendiente: "badge--pending",
    "En proceso": "badge--progress",
    Completada: "badge--completed",
  };
  return "badge badge--" + type + " " + classNames[value];
}

function renderTasks() {
  const emptyState = document.getElementById("task-empty-state");
  const taskList = document.getElementById("task-list");
  const tableBody = document.getElementById("task-table-body");
  const taskCount = document.getElementById("task-count");

  emptyState.hidden = tasks.length > 0;
  taskList.hidden = tasks.length === 0;
  taskCount.textContent = tasks.length + (tasks.length === 1 ? " tarea" : " tareas");
  tableBody.innerHTML = "";

  tasks.forEach(function (task) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <span class="task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</span>
        ${task.description ? `<span class="task-description" title="${escapeHtml(task.description)}">${escapeHtml(task.description)}</span>` : ""}
      </td>
      <td>${formatTaskDate(task.date)}</td>
      <td><span class="${getBadgeClass("priority", task.priority)}">${task.priority}</span></td>
      <td><span class="${getBadgeClass("status", task.status)}">${task.status}</span></td>
      <td>
        <div class="task-actions">
          <button type="button" class="icon-button" data-action="edit" data-task-id="${task.id}" aria-label="Editar ${escapeHtml(task.title)}" title="Editar tarea">
            <i data-lucide="pencil" aria-hidden="true"></i>
          </button>
          <button type="button" class="icon-button icon-button--danger" data-action="delete" data-task-id="${task.id}" aria-label="Eliminar ${escapeHtml(task.title)}" title="Eliminar tarea">
            <i data-lucide="trash-2" aria-hidden="true"></i>
          </button>
        </div>
      </td>`;
    tableBody.appendChild(row);
  });

  initIcons();
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, function (character) {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
    return entities[character];
  });
}

function handleTaskAction(event) {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  const task = tasks.find(function (item) {
    return item.id === Number(actionButton.dataset.taskId);
  });

  if (actionButton.dataset.action === "edit") {
    openTaskForm(task);
  } else if (task && confirm("¿Querés eliminar la tarea \"" + task.title + "\"?")) {
    if (editingTaskId === task.id) {
      closeTaskForm();
    }

    tasks.splice(tasks.indexOf(task), 1);
    renderTasks();
  }
}

function initTaskManagement() {
  document.getElementById("new-task-button").addEventListener("click", function () {
    openTaskForm();
  });
  document.getElementById("close-task-form").addEventListener("click", closeTaskForm);
  document.getElementById("cancel-task-form").addEventListener("click", closeTaskForm);
  document.getElementById("task-form").addEventListener("submit", saveTask);
  document.getElementById("task-table-body").addEventListener("click", handleTaskAction);
  renderTasks();
}

document.addEventListener("DOMContentLoaded", function () {
  initIcons();
  initNavigation();
  initMobileMenu();
  initTaskManagement();
});
