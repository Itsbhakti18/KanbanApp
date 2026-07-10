
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

    document
        .querySelector("#todo .task-list")
        .appendChild(task);

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

        <h4>${title}</h4>

        <p>${desc}</p>

        <span class="priority ${priority.toLowerCase()}">
            ${priority}
        </span>

        <div class="task-footer">

            <div class="avatar">
                ${title.charAt(0).toUpperCase()}
            </div>

            <span class="date">
                ${date || "No Date"}
            </span>

        </div>

        <div class="actions">

            <button class="start-btn">
                Start
            </button>

            <button class="delete-btn">
                Delete
            </button>

        </div>

    `;

    task.addEventListener("dragstart", dragStart);

    task.querySelector(".delete-btn")
        .addEventListener("click", () => {

            task.remove();

            updateCounts();

            saveBoard();
            updateDashboard();

        });

    task.querySelector(".start-btn")
        .addEventListener("click", () => {

            moveTask(task);

        });

    return task;

}

function moveTask(task) {

    const parent = task.closest(".column").id;

    const actions = task.querySelector(".actions");

    actions.innerHTML = "";

    if (parent === "todo") {

        document
            .querySelector("#doing .task-list")
            .appendChild(task);

        actions.innerHTML = `

            <button class="complete-btn">
                Complete
            </button>

            <button class="delete-btn">
                Delete
            </button>

        `;

        actions.querySelector(".complete-btn")
            .onclick = () => moveTask(task);

    }

    else if (parent === "doing") {

        document
            .querySelector("#done .task-list")
            .appendChild(task);

        actions.innerHTML = `

            <button class="undo-btn">
                Undo
            </button>

            <button class="delete-btn">
                Delete
            </button>

        `;

        actions.querySelector(".undo-btn")
            .onclick = () => moveTask(task);

    }

    else {

        document
            .querySelector("#doing .task-list")
            .appendChild(task);

        actions.innerHTML = `

            <button class="complete-btn">
                Complete
            </button>

            <button class="delete-btn">
                Delete
            </button>

        `;

        actions.querySelector(".complete-btn")
            .onclick = () => moveTask(task);

    }

    actions.querySelector(".delete-btn")
        .onclick = () => {

            task.remove();

            updateCounts();
            updateDashboard();

            saveBoard();

        };

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

    const actions = task.querySelector(".actions");

    actions.innerHTML = "";

    const column = task.closest(".column").id;

    if (column === "todo") {

        actions.innerHTML = `
            <button class="start-btn">Start</button>
            <button class="delete-btn">Delete</button>
        `;

        actions.querySelector(".start-btn").onclick = () => moveTask(task);

    }

    else if (column === "doing") {

        actions.innerHTML = `
            <button class="complete-btn">Complete</button>
            <button class="delete-btn">Delete</button>
        `;

        actions.querySelector(".complete-btn").onclick = () => moveTask(task);

    }

    else {

        actions.innerHTML = `
            <button class="undo-btn">Undo</button>
            <button class="delete-btn">Delete</button>
        `;

        actions.querySelector(".undo-btn").onclick = () => moveTask(task);

    }

    actions.querySelector(".delete-btn").onclick = () => {

        task.remove();

        updateCounts();

        saveBoard();
        updateDashboard();

    };

}

function updateCounts() {

    document.querySelector("#todo .count").textContent =
        document.querySelectorAll("#todo .task").length;

    document.querySelector("#doing .count").textContent =
        document.querySelectorAll("#doing .task").length;

    document.querySelector("#done .count").textContent =
        document.querySelectorAll("#done .task").length;

}

function saveBoard() {

    const board = {};

    ["todo", "doing", "done"].forEach(column => {

        board[column] = [];

        document.querySelectorAll(`#${column} .task`).forEach(task => {

            board[column].push({

                title: task.querySelector("h4").innerText,

                desc: task.querySelector("p").innerText,

                priority: task.querySelector(".priority").innerText,

                date: task.querySelector(".date").innerText

            });

        });

    });

    localStorage.setItem(
        "kanbanBoard",
        JSON.stringify(board)
    );

}
function loadBoard() {

    const board = JSON.parse(
        localStorage.getItem("kanbanBoard")
    );

    if (!board) {

        updateCounts();

        return;

    }

    ["todo", "doing", "done"].forEach(column => {

        board[column].forEach(item => {

            const task = createTask(

                item.title,

                item.desc,

                item.priority,

                item.date

            );

            document
                .querySelector(`#${column} .task-list`)
                .appendChild(task);

            refreshButtons(task);

        });

    });

    updateCounts();

}
window.onload = () => {

    loadBoard();

    updateCounts();

    updateDashboard();

    if(localStorage.getItem("theme")==="dark"){

        document.body.classList.add("dark");

        themeToggle.innerHTML='<i class="fa-solid fa-sun"></i>';

    }

};

function updateDashboard() {

    const total = document.querySelectorAll(".task").length;
    const doing = document.querySelectorAll("#doing .task").length;
    const done = document.querySelectorAll("#done .task").length;

    let high = 0;

    document.querySelectorAll(".priority").forEach(priority => {

        if(priority.textContent.trim() === "High"){

            high++;

        }

    });

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("doingCount").textContent = doing;
    document.getElementById("doneCount").textContent = done;
    document.getElementById("highCount").textContent = high;

    updateProgress(total, done);

    updateChart();

}

function updateProgress(total, completed){

    let percent = 0;

    if(total > 0){

        percent = Math.round((completed / total) * 100);

    }

    document.getElementById("progressFill").style.width = percent + "%";

    document.getElementById("progressPercent").textContent = percent + "%";

}

const searchInput = document.getElementById("searchTask");

searchInput.addEventListener("keyup", function(){

    const value = this.value.toLowerCase();

    document.querySelectorAll(".task").forEach(task=>{

        const title = task.querySelector("h4").innerText.toLowerCase();

        const desc = task.querySelector("p").innerText.toLowerCase();

        if(title.includes(value) || desc.includes(value)){

            task.style.display = "block";

        }

        else{

            task.style.display = "none";

        }

    });

});

const priorityFilter = document.getElementById("priorityFilter");

priorityFilter.addEventListener("change", function(){

    const value = this.value;

    document.querySelectorAll(".task").forEach(task=>{

        const priority = task.querySelector(".priority").textContent.trim();

        if(value === "all" || priority === value){

            task.style.display = "block";

        }

        else{

            task.style.display = "none";

        }

    });

});

// ==============================
// Chart
// ==============================

let taskChart;

function updateChart(){

    const todo = document.querySelectorAll("#todo .task").length;
    const doing = document.querySelectorAll("#doing .task").length;
    const done = document.querySelectorAll("#done .task").length;

    const ctx = document.getElementById("taskChart");

    if(taskChart){

        taskChart.destroy();

    }

    taskChart = new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:["To Do","Doing","Done"],

            datasets:[{

                data:[todo,doing,done],

                backgroundColor:[
                    "#EF4444",
                    "#F59E0B",
                    "#22C55E"
                ],

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    position:"bottom"

                }

            }

        }

    });

}

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function(){

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeToggle.innerHTML='<i class="fa-solid fa-sun"></i>';

    }

    else{

        localStorage.setItem("theme","light");

        themeToggle.innerHTML='<i class="fa-solid fa-moon"></i>';

    }

});

// ==============================
// Greeting & Today's Date
// ==============================

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

document.getElementById("heroDate").textContent =
today.toLocaleDateString("en-US",{
    day:"numeric",
    month:"long",
    year:"numeric"
});

const heroDate = document.getElementById("heroDate");

heroDate.innerHTML = new Date().toLocaleDateString("en-US",{

weekday:"long",

day:"numeric",

month:"long",

year:"numeric"

});
