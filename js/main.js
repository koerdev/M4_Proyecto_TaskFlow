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
    element.innerHTML = `
            <td>${userName}</td>
            <td>${task.description}</td>
            <td>${statusText}</td>
            <td>
                <button class="btn btn-danger btn-sm" name="delete">X</button>
            </td>
        `;
    taskList.appendChild(element);
  };

  resetForm() {
    document.getElementById('task-form').reset();
  };

  deletetask(element) {
    if (element.name === "delete") {
      const row = element.parentElement.parentElement;
      const taskId = parseInt(row.dataset.id);

      const index = tasks.findIndex(t => t.taskId === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
      }

      row.remove();
    };
  };

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

// Eventos del DOM
document.getElementById('task-form').addEventListener("submit", (e) => {
  e.preventDefault();

  const userId = parseInt(document.getElementById('name').value);
  const description = document.getElementById('description').value.trim();
  const taskId = getNextTaskId();

  const task = new Task(taskId, userId, description, false);

  tasks.push(task);

  const ui = new UI();
  ui.addtask(task);
  ui.resetForm();
  ui.showMessages("Tarea Agregada", "success");
});

document.getElementById("task-table-body").addEventListener("click", (e) => {
  const ui = new UI();
  ui.deletetask(e.target);
});