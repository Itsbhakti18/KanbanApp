const modal = document.getElementById("taskModal");
const openModal = document.getElementById("openModal");
const cancelBtn = document.getElementById("cancelBtn");
const saveTaskBtn = document.getElementById("saveTask");

const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");

let draggedTask = null;

openModal.addEventListener("click", () => {
    modal.classList.add("active");
});

cancelBtn.addEventListener("click", closeModal);

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

function closeModal() {
    modal.classList.remove("active");
    taskTitle.value = "";
    taskDesc.value = "";
    taskPriority.value = "High";
    taskDate.value = "";
}

saveTaskBtn.addEventListener("click", () => {
    const title = taskTitle.value.trim();

    if (title === "") {
        alert("Please enter a task title.");
        return;
    }

    const task = createTask(
        title,
        taskDesc.value,
        taskPriority.value,
        taskDate.value
    );

    document.querySelector("#todo .task-list").appendChild(task);

    refreshButtons(task);
    updateCounts();
    updateDashboard();
    saveBoard();
    closeModal();
});

function createTask(title, desc, priority, date) {
    const task = document.createElement("div");
    task.className = "task";
    task.draggable = true;
    task.innerHTML = `
        <div class="task-head">
            <h4>${title}</h4>
            <div class="task-actions">
                <button class="task-menu-btn" type="button">
                    <i data-lucide="more-horizontal"></i>
                </button>
                <div class="task-menu">
                    <button class="menu-action start-action">Start</button>
                    <button class="menu-action delete-action">Delete</button>
                </div>
            </div>
        </div>

        <p>${desc}</p>

        <div class="task-meta">
            <span class="priority ${priority.toLowerCase()}">${priority}</span>
            <span class="task-state">Open</span>
        </div>

        <div class="task-footer">
            <div class="avatar">${title.charAt(0).toUpperCase()}</div>
            <span class="task-state">Open</span>
        </div>
    `;

    task.addEventListener("dragstart", dragStart);

    const menuBtn = task.querySelector(".task-menu-btn");
    const menu = task.querySelector(".task-menu");

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".task-menu.open").forEach((item) => item.classList.remove("open"));
        menu.classList.toggle("open");
        lucide.createIcons();
    });

    document.addEventListener("click", () => menu.classList.remove("open"));

    task.querySelector(".delete-action").addEventListener("click", () => {
        task.remove();
        updateCounts();
        saveBoard();
        updateDashboard();
    });

    task.querySelector(".start-action").addEventListener("click", () => {
        moveTask(task);
    });

    return task;
}

function moveTask(task) {
    const parent = task.closest(".column").id;

    if (parent === "todo") {
        document.querySelector("#doing .task-list").appendChild(task);
    } else if (parent === "doing") {
        document.querySelector("#done .task-list").appendChild(task);
    } else {
        document.querySelector("#doing .task-list").appendChild(task);
    }

    refreshButtons(task);
    updateCounts();
    saveBoard();
    updateDashboard();
}

function dragStart(e) {
    draggedTask = e.target;
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();

    const taskList = e.currentTarget;
    taskList.appendChild(draggedTask);

    refreshButtons(draggedTask);
    updateCounts();
    updateDashboard();
    saveBoard();
}

function refreshButtons(task) {
    const column = task.closest(".column").id;
    const state = task.querySelector(".task-state");
    const startAction = task.querySelector(".start-action");
    const footerState = task.querySelectorAll(".task-state")[1];

    if (column === "todo") {
        state.textContent = "Open";
        footerState.textContent = "Open";
        startAction.textContent = "Start";
    } else if (column === "doing") {
        state.textContent = "In progress";
        footerState.textContent = "In progress";
        startAction.textContent = "Complete";
    } else {
        state.textContent = "Completed";
        footerState.textContent = "Completed";
        startAction.textContent = "Undo";
    }

    startAction.onclick = () => moveTask(task);

    task.querySelector(".delete-action").onclick = () => {
        task.remove();
        updateCounts();
        saveBoard();
        updateDashboard();
    };
}

function updateCounts() {
    document.querySelector("#todo .count").textContent = document.querySelectorAll("#todo .task").length;
    document.querySelector("#doing .count").textContent = document.querySelectorAll("#doing .task").length;
    document.querySelector("#done .count").textContent = document.querySelectorAll("#done .task").length;
}

function saveBoard() {
    const board = {};

    ["todo", "doing", "done"].forEach((column) => {
        board[column] = [];
        document.querySelectorAll(`#${column} .task`).forEach((task) => {
            board[column].push({
                title: task.querySelector("h4").innerText,
                desc: task.querySelector("p").innerText,
                priority: task.querySelector(".priority").innerText,
                date: task.querySelectorAll(".task-state")[0].innerText
            });
        });
    });

    localStorage.setItem("kanbanBoard", JSON.stringify(board));
}

function loadBoard() {
    const board = JSON.parse(localStorage.getItem("kanbanBoard"));

    if (!board) {
        updateCounts();
        return;
    }

    ["todo", "doing", "done"].forEach((column) => {
        board[column].forEach((item) => {
            const task = createTask(item.title, item.desc, item.priority, item.date);
            document.querySelector(`#${column} .task-list`).appendChild(task);
            refreshButtons(task);
        });
    });

    updateCounts();
}

function updateDashboard() {
    const total = document.querySelectorAll(".task").length;
    const doing = document.querySelectorAll("#doing .task").length;
    const done = document.querySelectorAll("#done .task").length;

    const today = new Date().toDateString();
    let todayTasks = 0;

    document.querySelectorAll(".task").forEach((task) => {
        const dateText = task.querySelectorAll(".task-state")[0].textContent.trim();
        if (dateText && dateText !== "Open") {
            todayTasks += 1;
        }
    });

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("doingCount").textContent = doing;
    document.getElementById("doneCount").textContent = done;
    document.getElementById("todayTasksCount").textContent = todayTasks || total;

    updateProgress(total, done);
    updateChart();
}

function updateProgress(total, completed) {
    let percent = 0;
    if (total > 0) {
        percent = Math.round((completed / total) * 100);
    }

    document.getElementById("progressFill").style.width = percent + "%";
    document.getElementById("progressPercent").textContent = percent + "%";
}

let taskChart;

function updateChart() {
    const todo = document.querySelectorAll("#todo .task").length;
    const doing = document.querySelectorAll("#doing .task").length;
    const done = document.querySelectorAll("#done .task").length;

    const ctx = document.getElementById("taskChart");
    if (taskChart) {
        taskChart.destroy();
    }

    taskChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["To Do", "Doing", "Done"],
            datasets: [{
                data: [todo, doing, done],
                backgroundColor: ["#111827", "#6B7280", "#D1D5DB"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

const searchInput = document.getElementById("searchTask");
searchInput.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();

    document.querySelectorAll(".task").forEach((task) => {
        const title = task.querySelector("h4").innerText.toLowerCase();
        const desc = task.querySelector("p").innerText.toLowerCase();
        task.style.display = (title.includes(value) || desc.includes(value)) ? "block" : "none";
    });
});

const priorityFilter = document.getElementById("priorityFilter");
priorityFilter.addEventListener("change", function () {
    const value = this.value;

    document.querySelectorAll(".task").forEach((task) => {
        const priority = task.querySelector(".priority").textContent.trim();
        task.style.display = (value === "all" || priority === value) ? "block" : "none";
    });
});

function updateGreeting() {
    const greeting = document.getElementById("greeting");
    const todayDate = document.getElementById("todayDate");

    const now = new Date();
    const hour = now.getHours();

    let text = "Good Evening 👋";
    if (hour < 12) {
        text = "Good Morning ☀️";
    } else if (hour < 17) {
        text = "Good Afternoon 🌤️";
    }

    greeting.textContent = text;
    todayDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

updateGreeting();

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

const today = new Date();
document.getElementById("heroDate").textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = '<i data-lucide="sun"></i>';
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.innerHTML = '<i data-lucide="moon-star"></i>';
    }

    lucide.createIcons();
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerHTML = '<i data-lucide="sun"></i>';
} else {
    themeToggle.innerHTML = '<i data-lucide="moon-star"></i>';
}

window.onload = () => {
    loadBoard();
    updateCounts();
    updateDashboard();
    lucide.createIcons();
};
