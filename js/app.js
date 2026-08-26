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
const meetings = [];
let editingMeetingId = null;
let nextMeetingId = 1;

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
  updateDashboard();
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
  const tableWrapper = document.getElementById("task-table-wrapper");
  const noResults = document.getElementById("task-no-results");
  const searchTerm = document.getElementById("task-search").value.trim().toLowerCase();
  const statusFilter = document.getElementById("task-status-filter").value;
  const priorityFilter = document.getElementById("task-priority-filter").value;
  const filteredTasks = tasks.filter(function (task) {
    const searchableText = (task.title + " " + task.description).toLowerCase();
    return (!searchTerm || searchableText.includes(searchTerm))
      && (!statusFilter || task.status === statusFilter)
      && (!priorityFilter || task.priority === priorityFilter);
  });

  emptyState.hidden = tasks.length > 0;
  taskList.hidden = tasks.length === 0;
  taskCount.textContent = filteredTasks.length + " de " + tasks.length + (tasks.length === 1 ? " tarea" : " tareas");
  tableWrapper.hidden = filteredTasks.length === 0;
  noResults.hidden = filteredTasks.length > 0;
  tableBody.innerHTML = "";

  filteredTasks.forEach(function (task) {
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

function updateDashboard() {
  const pendingTasks = tasks.filter(function (task) {
    return task.status === "Pendiente";
  }).length;
  const completedTasks = tasks.filter(function (task) {
    return task.status === "Completada";
  }).length;
  const statusCounts = {
    pending: pendingTasks,
    progress: tasks.filter(function (task) {
      return task.status === "En proceso";
    }).length,
    completed: completedTasks,
  };
  const highestCount = Math.max(statusCounts.pending, statusCounts.progress, statusCounts.completed);
  const chartBars = document.getElementById("task-chart-bars");
  const chartEmptyState = document.getElementById("chart-empty-state");

  document.getElementById("dashboard-total-tasks").textContent = tasks.length;
  document.getElementById("dashboard-pending-tasks").textContent = pendingTasks;
  document.getElementById("dashboard-completed-tasks").textContent = completedTasks;
  document.getElementById("dashboard-total-meetings").textContent = meetings.length;

  Object.keys(statusCounts).forEach(function (status) {
    const count = statusCounts[status];
    const height = highestCount === 0 ? 0 : Math.max((count / highestCount) * 100, count > 0 ? 8 : 0);
    document.getElementById("chart-bar-" + status).style.height = height + "%";
    document.getElementById("chart-count-" + status).textContent = count;
  });

  chartBars.hidden = tasks.length === 0;
  chartEmptyState.hidden = tasks.length > 0;
}

function initTaskFilters() {
  document.getElementById("task-search").addEventListener("input", renderTasks);
  document.getElementById("task-status-filter").addEventListener("change", renderTasks);
  document.getElementById("task-priority-filter").addEventListener("change", renderTasks);
  document.getElementById("clear-task-filters").addEventListener("click", function () {
    document.getElementById("task-search").value = "";
    document.getElementById("task-status-filter").value = "";
    document.getElementById("task-priority-filter").value = "";
    renderTasks();
  });
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
    updateDashboard();
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

function getMeetingFormElements() {
  return {
    card: document.getElementById("meeting-form-card"),
    form: document.getElementById("meeting-form"),
    title: document.getElementById("meeting-title"),
    participant: document.getElementById("meeting-participant"),
    date: document.getElementById("meeting-date"),
    time: document.getElementById("meeting-time"),
    place: document.getElementById("meeting-place"),
    heading: document.getElementById("meeting-form-title"),
    message: document.getElementById("meeting-form-message"),
  };
}

function resetMeetingForm() {
  const elements = getMeetingFormElements();
  elements.form.reset();
  elements.message.hidden = true;
  elements.message.textContent = "";
  editingMeetingId = null;
}

function openMeetingForm(meeting) {
  const elements = getMeetingFormElements();
  resetMeetingForm();
  elements.heading.textContent = meeting ? "Editar reunión" : "Nueva reunión";

  if (meeting) {
    editingMeetingId = meeting.id;
    elements.title.value = meeting.title;
    elements.participant.value = meeting.participant;
    elements.date.value = meeting.date;
    elements.time.value = meeting.time;
    elements.place.value = meeting.place;
  }

  elements.card.hidden = false;
  elements.title.focus();
}

function closeMeetingForm() {
  resetMeetingForm();
  getMeetingFormElements().card.hidden = true;
}

function showMeetingFormMessage(message) {
  const messageElement = getMeetingFormElements().message;
  messageElement.textContent = message;
  messageElement.hidden = false;
}

function validateMeeting(meeting) {
  if (!meeting.title || !meeting.participant || !meeting.date || !meeting.time || !meeting.place) {
    return "Completá todos los campos obligatorios para guardar la reunión.";
  }

  return "";
}

function saveMeeting(event) {
  event.preventDefault();
  const elements = getMeetingFormElements();
  const meetingData = {
    title: elements.title.value.trim(),
    participant: elements.participant.value.trim(),
    date: elements.date.value,
    time: elements.time.value,
    place: elements.place.value.trim(),
  };
  const validationMessage = validateMeeting(meetingData);

  if (validationMessage) {
    showMeetingFormMessage(validationMessage);
    return;
  }

  if (editingMeetingId) {
    const meetingIndex = meetings.findIndex(function (meeting) {
      return meeting.id === editingMeetingId;
    });

    if (meetingIndex === -1) {
      closeMeetingForm();
      renderMeetings();
      return;
    }

    meetings[meetingIndex] = { id: editingMeetingId, ...meetingData };
  } else {
    meetings.push({ id: nextMeetingId, ...meetingData });
    nextMeetingId += 1;
  }

  closeMeetingForm();
  renderMeetings();
  updateDashboard();
}

function formatMeetingTime(time) {
  return time.slice(0, 5);
}

function renderMeetings() {
  const emptyState = document.getElementById("meeting-empty-state");
  const meetingList = document.getElementById("meeting-list");
  const tableBody = document.getElementById("meeting-table-body");
  const meetingCount = document.getElementById("meeting-count");

  emptyState.hidden = meetings.length > 0;
  meetingList.hidden = meetings.length === 0;
  meetingCount.textContent = meetings.length + (meetings.length === 1 ? " reunión" : " reuniones");
  tableBody.innerHTML = "";

  meetings.forEach(function (meeting) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="meeting-title" title="${escapeHtml(meeting.title)}">${escapeHtml(meeting.title)}</span></td>
      <td>${escapeHtml(meeting.participant)}</td>
      <td>${formatTaskDate(meeting.date)}</td>
      <td><span class="meeting-time"><i data-lucide="clock" aria-hidden="true"></i>${formatMeetingTime(meeting.time)}</span></td>
      <td><span class="meeting-place"><i data-lucide="map-pin" aria-hidden="true"></i>${escapeHtml(meeting.place)}</span></td>
      <td>
        <div class="task-actions">
          <button type="button" class="icon-button" data-meeting-action="edit" data-meeting-id="${meeting.id}" aria-label="Editar ${escapeHtml(meeting.title)}" title="Editar reunión">
            <i data-lucide="pencil" aria-hidden="true"></i>
          </button>
          <button type="button" class="icon-button icon-button--danger" data-meeting-action="delete" data-meeting-id="${meeting.id}" aria-label="Eliminar ${escapeHtml(meeting.title)}" title="Eliminar reunión">
            <i data-lucide="trash-2" aria-hidden="true"></i>
          </button>
        </div>
      </td>`;
    tableBody.appendChild(row);
  });

  initIcons();
}

function handleMeetingAction(event) {
  const actionButton = event.target.closest("[data-meeting-action]");
  if (!actionButton) {
    return;
  }

  const meeting = meetings.find(function (item) {
    return item.id === Number(actionButton.dataset.meetingId);
  });

  if (actionButton.dataset.meetingAction === "edit") {
    openMeetingForm(meeting);
  } else if (meeting && confirm("¿Querés eliminar la reunión \"" + meeting.title + "\"?")) {
    if (editingMeetingId === meeting.id) {
      closeMeetingForm();
    }

    meetings.splice(meetings.indexOf(meeting), 1);
    renderMeetings();
    updateDashboard();
  }
}

function initMeetingManagement() {
  document.getElementById("new-meeting-button").addEventListener("click", function () {
    openMeetingForm();
  });
  document.getElementById("close-meeting-form").addEventListener("click", closeMeetingForm);
  document.getElementById("cancel-meeting-form").addEventListener("click", closeMeetingForm);
  document.getElementById("meeting-form").addEventListener("submit", saveMeeting);
  document.getElementById("meeting-table-body").addEventListener("click", handleMeetingAction);
  renderMeetings();
}

document.addEventListener("DOMContentLoaded", function () {
  initIcons();
  initNavigation();
  initMobileMenu();
  initTaskManagement();
  initTaskFilters();
  initMeetingManagement();
  updateDashboard();
});
