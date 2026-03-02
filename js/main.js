class Task {
  constructor(taskId, userId, description, status) {
    this.taskId = taskId;
    this.userId = userId;
    this.description = description;
    this.status = status;
    this.date = new Date().toISOString().split("T")[0];
  };
};

const users = new Map();

users.set(1, "Frodo");
users.set(2, "Sam");
users.set(3, "Merry");
users.set(4, "Pippin");
users.set(5, "Gimli");
users.set(6, "Legolas");
users.set(7, "Aragorn");
users.set(8, "Boromir");
users.set(9, "Gandalf");
users.set(10, "Bilbo");

const tasks = [];

function getNextTaskId() {
  let id = 1;

  const usedIds = tasks.map(task => task.taskId);

  while (usedIds.includes(id)) {
    id++;
  }

  return id;
}

class UI {
  addtask(task) {
    const taskList = document.getElementById('task-table-body');
    const element = document.createElement("tr");
    element.classList.add("text-center");
    element.dataset.id = task.taskId;
    const userName = users.get(task.userId) || "Desconocido";
    const statusText = task.status ? "Completa" : "Incompleta";
    const buttonText = task.status ? "Reabrir" : "Completar";
    const buttonClass = task.status ? "btn-warning" : "btn-success";
    element.innerHTML = `
            <td>${userName}</td>
            <td>${task.description}</td>
            <td class="status">${statusText}</td>
            <td>
              <button class="btn ${buttonClass} btn-sm" name="toggle">${buttonText}</button>
              <button class="btn btn-danger btn-sm" name="delete">X</button>
            </td>
        `;
    taskList.appendChild(element);
  };

  resetForm() {
    document.getElementById('task-form').reset();
  };

  handleActions(element) {
    const row = element.parentElement.parentElement;
    const taskId = parseInt(row.dataset.id);

    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;

    if (element.name === "delete") {
      const index = tasks.findIndex(t => t.taskId === taskId);
      if (index !== -1) tasks.splice(index, 1);
      saveTasks();
      row.remove();
    }

    if (element.name === "toggle") {
      task.status = !task.status;

      const statusCell = row.querySelector(".status");
      statusCell.textContent = task.status ? "Completa" : "Incompleta";

      element.textContent = task.status ? "Reabrir" : "Completar";
      element.classList.toggle("btn-success");
      element.classList.toggle("btn-warning");
      saveTasks();
    }
  }

  showMessages(message, classCSS) {
    const div = document.createElement("div");
    div.className = `alert alert-${classCSS} mt-4`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector('.container');
    const app = document.getElementById('app');
    container.insertBefore(div, app);
    setTimeout(() => {
      document.querySelector(".alert").remove();
    }, 2000);
  };
};

const ui = new UI();
let currentPage = 1;
const tasksPerPage = 10;

// Eventos del DOM
document.getElementById('task-form').addEventListener("submit", (e) => {
  e.preventDefault();

  const userId = parseInt(document.getElementById('name').value);
  const description = document.getElementById('description').value.trim();
  const taskId = getNextTaskId();

  const task = new Task(taskId, userId, description, false);

  tasks.push(task);

  saveTasks();
  renderTasks();
  ui.resetForm();
  ui.showMessages("Tarea Agregada", "success");
});

document.getElementById("task-table-body").addEventListener("click", (e) => {
  ui.handleActions(e.target);
});

function renderTasks() {
  const taskList = document.getElementById("task-table-body");
  taskList.innerHTML = "";

  const start = (currentPage - 1) * tasksPerPage;
  const end = start + tasksPerPage;

  const paginatedTasks = tasks.slice(start, end);

  paginatedTasks.forEach(task => {
    ui.addtask(task);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  if (totalPages === 0) return;

  const firstBtn = document.createElement("button");
  firstBtn.textContent = "Primera";
  firstBtn.className = "btn btn-sm btn-secondary mx-1";
  firstBtn.disabled = currentPage === 1;

  firstBtn.addEventListener("click", () => {
    currentPage = 1;
    renderTasks();
  });

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Anterior";
  prevBtn.className = "btn btn-sm btn-secondary mx-2";
  prevBtn.disabled = currentPage === 1;

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTasks();
    }
  });

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  pageInfo.className = "mx-2";

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Siguiente";
  nextBtn.className = "btn btn-sm btn-secondary mx-2";
  nextBtn.disabled = currentPage === totalPages;

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTasks();
    }
  });

  const lastBtn = document.createElement("button");
  lastBtn.textContent = "Última";
  lastBtn.className = "btn btn-sm btn-secondary mx-1";
  lastBtn.disabled = currentPage === totalPages;

  lastBtn.addEventListener("click", () => {
    currentPage = totalPages;
    renderTasks();
  });

  pagination.appendChild(firstBtn);
  pagination.appendChild(prevBtn);
  pagination.appendChild(pageInfo);
  pagination.appendChild(nextBtn);
  pagination.appendChild(lastBtn);
}

// Consumir API
async function loadTasksFromAPI() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");
    const data = await response.json();

    data.forEach(item => {
      tasks.push(
        new Task(item.id, item.userId, item.title, item.completed)
      );
    });

    renderTasks();

  } catch (error) {
    console.error("Error cargando tareas:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const hasLocalTasks = loadTasksFromLocalStorage();

  if (!hasLocalTasks) {
    loadTasksFromAPI();
  } else {
    renderTasks();
  }
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem("tasks");

  if (!storedTasks) return false;

  const parsedTasks = JSON.parse(storedTasks);

  parsedTasks.forEach(task => {
    tasks.push(
      new Task(task.taskId, task.userId, task.description, task.status)
    );
  });

  return true;
}