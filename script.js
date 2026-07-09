// ======================================================
// FLOWBOARD
// FINAL VERSION
// PART 1/6
// Setup • DOM • Storage • Helpers
// ======================================================

// ------------------------------------------------------
// DATE
// ------------------------------------------------------

const currentDate = document.getElementById("currentDate");

currentDate.textContent = new Date().toLocaleDateString(
    "en-US",
    {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    }
);

// ------------------------------------------------------
// BUTTONS
// ------------------------------------------------------

const addTaskBtn = document.getElementById("addTaskBtn");
const closeModal = document.getElementById("closeModal");
const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");
const themeToggle = document.getElementById("themeToggle");

// ------------------------------------------------------
// INPUTS
// ------------------------------------------------------

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskLabel = document.getElementById("taskLabel");

const searchTask = document.getElementById("searchTask");
const charCount = document.getElementById("charCount");

// ------------------------------------------------------
// COLUMNS
// ------------------------------------------------------

const todoColumn = document.getElementById("todo");
const progressColumn = document.getElementById("progress");
const reviewColumn = document.getElementById("review");
const doneColumn = document.getElementById("done");

// ------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const todoCount = document.getElementById("todoCount");
const progressCount = document.getElementById("progressCount");
const reviewCount = document.getElementById("reviewCount");
const doneCount = document.getElementById("doneCount");

// ------------------------------------------------------
// STORAGE
// ------------------------------------------------------

let tasks = JSON.parse(

    localStorage.getItem("flowboardTasks")

) || [];

let editingTask = null;

let draggedCard = null;

// ------------------------------------------------------
// SAVE
// ------------------------------------------------------

function saveTasks(){

    localStorage.setItem(

        "flowboardTasks",

        JSON.stringify(tasks)

    );

}

// ------------------------------------------------------
// ID
// ------------------------------------------------------

function generateID(){

    return Date.now();

}

// ------------------------------------------------------
// CHARACTER COUNTER
// ------------------------------------------------------

charCount.textContent = "0";

taskDescription.addEventListener("input",()=>{

    charCount.textContent =

    taskDescription.value.length;

});

// ------------------------------------------------------
// DUE DATE
// ------------------------------------------------------

function getDueStatus(date){

    if(!date) return "";

    const today = new Date();

    today.setHours(0,0,0,0);

    const due = new Date(date);

    due.setHours(0,0,0,0);

    const diff =

    (due - today) /

    (1000*60*60*24);

    if(diff < 0){

        return{

            text:"Overdue",

            class:"overdue"

        };

    }

    if(diff === 0){

        return{

            text:"Today",

            class:"today"

        };

    }

    return{

        text:due.toLocaleDateString(),

        class:"future"

    };

}

// ------------------------------------------------------
// EMPTY STATE
// ------------------------------------------------------

function createEmptyState(){

    const div = document.createElement("div");

    div.className = "empty-state";

    div.innerHTML = `

        <i class="fa-solid fa-box-open"></i>

        <h3>No Tasks Yet</h3>

        <p>

            Click

            <strong>+ Add Task</strong>

            to create one.

        </p>

    `;

    return div;

}
// ======================================================
// FLOWBOARD
// FINAL VERSION
// PART 2/6
// Modal • CRUD • Validation
// ======================================================

// ------------------------------------------------------
// OPEN MODAL
// ------------------------------------------------------

function openModal(){

    editingTask = null;

    taskForm.reset();

    charCount.textContent = "0";

    taskModal.classList.remove("hidden");

    setTimeout(()=>{

        taskTitle.focus();

    },150);

}

addTaskBtn.addEventListener(

    "click",

    openModal

);

// ------------------------------------------------------
// CLOSE MODAL
// ------------------------------------------------------

function closeTaskModal(){

    taskModal.classList.add("hidden");

    taskForm.reset();

    editingTask = null;

    charCount.textContent = "0";

}

closeModal.addEventListener(

    "click",

    closeTaskModal

);

window.addEventListener("click",(e)=>{

    if(e.target===taskModal){

        closeTaskModal();

    }

});

// ------------------------------------------------------
// SAVE TASK
// ------------------------------------------------------

taskForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    if(taskTitle.value.trim()===""){

        alert("Please enter a task title.");

        taskTitle.focus();

        return;

    }

    const task={

        id:editingTask
            ? editingTask.id
            : generateID(),

        title:taskTitle.value.trim(),

        description:
            taskDescription.value.trim(),

        priority:
            taskPriority.value,

        dueDate:
            taskDate.value,

        label:
            taskLabel.value.trim(),

        status:
            editingTask
            ? editingTask.status
            : "todo"

    };

    if(editingTask){

        const index = tasks.findIndex(

            t=>t.id===editingTask.id

        );

        tasks[index]=task;

        showToast(

            "Task updated successfully"

        );

    }

    else{

        tasks.push(task);

        showToast(

            "Task created successfully"

        );

    }

    saveTasks();

    renderTasks();

    closeTaskModal();

});

// ------------------------------------------------------
// EDIT
// ------------------------------------------------------

function editTask(id){

    editingTask=

    tasks.find(

        task=>task.id===id

    );

    if(!editingTask) return;

    taskTitle.value=
        editingTask.title;

    taskDescription.value=
        editingTask.description;

    taskPriority.value=
        editingTask.priority;

    taskDate.value=
        editingTask.dueDate;

    taskLabel.value=
        editingTask.label;

    charCount.textContent=

        editingTask.description.length;

    taskModal.classList.remove(

        "hidden"

    );

    setTimeout(()=>{

        taskTitle.focus();

    },150);

}

// ------------------------------------------------------
// DELETE
// ------------------------------------------------------

function deleteTask(id){

    const confirmDelete=

    confirm(

        "Delete this task?"

    );

    if(!confirmDelete){

        return;

    }

    tasks=

    tasks.filter(

        task=>task.id!==id

    );

    saveTasks();

    renderTasks();

    showToast(

        "Task deleted"

    );

}
// ======================================================
// FLOWBOARD
// FINAL VERSION
// PART 3/6
// Render • Dashboard • Search
// ======================================================

// ------------------------------------------------------
// RENDER TASKS
// ------------------------------------------------------

function renderTasks(){

    todoColumn.innerHTML = "";

    progressColumn.innerHTML = "";

    reviewColumn.innerHTML = "";

    doneColumn.innerHTML = "";

    tasks.forEach(task=>{

        const due = getDueStatus(task.dueDate);

        const card = document.createElement("div");

        card.className = "task-card";

        card.draggable = true;

        card.dataset.id = task.id;

        card.innerHTML = `

            <h3>

                <i class="fa-solid fa-rocket"></i>

                ${task.title}

            </h3>

            <p>

                ${task.description || "No description provided."}

            </p>

            <div class="task-info">

                <span class="priority ${task.priority.toLowerCase()}">

                    ${task.priority}

                </span>

                <span class="label">

                    🏷 ${task.label || "General"}

                </span>

            </div>

            <div class="task-footer">

                <small class="${due.class}">

                    <i class="fa-solid fa-calendar-days"></i>

                    ${due.text}

                </small>

                <div>

                    <button onclick="editTask(${task.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button onclick="deleteTask(${task.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>

        `;

        card.addEventListener(

            "dragstart",

            dragStart

        );

        card.addEventListener(

            "dragend",

            dragEnd

        );

        switch(task.status){

            case "todo":

                todoColumn.appendChild(card);

                break;

            case "progress":

                progressColumn.appendChild(card);

                break;

            case "review":

                reviewColumn.appendChild(card);

                break;

            case "done":

                doneColumn.appendChild(card);

                break;

        }

    });

    if(todoColumn.children.length===0){

        todoColumn.appendChild(

            createEmptyState()

        );

    }

    if(progressColumn.children.length===0){

        progressColumn.appendChild(

            createEmptyState()

        );

    }

    if(reviewColumn.children.length===0){

        reviewColumn.appendChild(

            createEmptyState()

        );

    }

    if(doneColumn.children.length===0){

        doneColumn.appendChild(

            createEmptyState()

        );

    }

    updateDashboard();

}

// ------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------

function updateDashboard(){

    const total = tasks.length;

    const completed =

    tasks.filter(

        t=>t.status==="done"

    ).length;

    const pending =

    total - completed;

    totalTasks.textContent = total;

    pendingTasks.textContent = pending;

    completedTasks.textContent = completed;

    todoCount.textContent =

    tasks.filter(

        t=>t.status==="todo"

    ).length;

    progressCount.textContent =

    tasks.filter(

        t=>t.status==="progress"

    ).length;

    reviewCount.textContent =

    tasks.filter(

        t=>t.status==="review"

    ).length;

    doneCount.textContent =

    completed;

    const percent =

    total===0

    ? 0

    : Math.round(

        (completed/total)*100

    );

    progressPercent.textContent =

        percent+"%";

    progressText.textContent =

        percent+"%";

    progressFill.style.width =

        percent+"%";

}

// ------------------------------------------------------
// SEARCH
// ------------------------------------------------------

searchTask.addEventListener("input",()=>{

    const value =

    searchTask.value

    .trim()

    .toLowerCase();

    document.querySelectorAll(

        ".task-card"

    ).forEach(card=>{

        const text =

        card.textContent

        .toLowerCase();

        card.style.display =

        text.includes(value)

        ? ""

        : "none";

    });

});
// ======================================================
// FLOWBOARD
// FINAL VERSION
// PART 4/6
// Drag & Drop • Theme
// ======================================================

// ------------------------------------------------------
// DRAG START
// ------------------------------------------------------

function dragStart(e){

    draggedCard = this;

    this.classList.add("dragging");

    e.dataTransfer.effectAllowed = "move";

}

// ------------------------------------------------------
// DRAG END
// ------------------------------------------------------

function dragEnd(){

    this.classList.remove("dragging");

    draggedCard = null;

}

// ------------------------------------------------------
// DROP ZONES
// ------------------------------------------------------

document.querySelectorAll(".task-list").forEach(column=>{

    column.addEventListener("dragover",(e)=>{

        e.preventDefault();

        column.classList.add("drag-over");

    });

    column.addEventListener("dragleave",()=>{

        column.classList.remove("drag-over");

    });

    column.addEventListener("drop",(e)=>{

        e.preventDefault();

        column.classList.remove("drag-over");

        if(!draggedCard) return;

        const taskId = Number(

            draggedCard.dataset.id

        );

        const task = tasks.find(

            t=>t.id===taskId

        );

        if(!task) return;

        task.status = column.id;

        saveTasks();

        renderTasks();

        showToast(

            "Task moved successfully"

        );

    });

});

// ------------------------------------------------------
// LOAD THEME
// ------------------------------------------------------

function loadTheme(){

    const savedTheme =

    localStorage.getItem(

        "flowboardTheme"

    );

    if(savedTheme==="dark"){

        document.body.classList.add(

            "dark"

        );

        themeToggle.innerHTML =

        '<i class="fa-solid fa-sun"></i>';

    }

    else{

        document.body.classList.remove(

            "dark"

        );

        themeToggle.innerHTML =

        '<i class="fa-solid fa-moon"></i>';

    }

}

// ------------------------------------------------------
// TOGGLE THEME
// ------------------------------------------------------

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle(

        "dark"

    );

    const dark =

    document.body.classList.contains(

        "dark"

    );

    localStorage.setItem(

        "flowboardTheme",

        dark

        ? "dark"

        : "light"

    );

    themeToggle.innerHTML =

        dark

        ? '<i class="fa-solid fa-sun"></i>'

        : '<i class="fa-solid fa-moon"></i>';

});

// ------------------------------------------------------
// INITIALIZE THEME
// ------------------------------------------------------

loadTheme();
// ======================================================
// FLOWBOARD
// FINAL VERSION
// PART 5/6
// Toast • Shortcuts • Celebration • Initialize
// ======================================================

// ------------------------------------------------------
// TOAST
// ------------------------------------------------------

function showToast(message){

    const oldToast = document.querySelector(".toast");

    if(oldToast){

        oldToast.remove();

    }

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        <span>${message}</span>

    `;

    document.body.appendChild(toast);

    requestAnimationFrame(()=>{

        toast.classList.add("show");

    });

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },300);

    },2500);

}

// ------------------------------------------------------
// KEYBOARD SHORTCUTS
// ------------------------------------------------------

document.addEventListener("keydown",(e)=>{

    // N → New Task

    if(

        e.key.toLowerCase()==="n"

        &&

        e.target.tagName!=="INPUT"

        &&

        e.target.tagName!=="TEXTAREA"

        &&

        taskModal.classList.contains("hidden")

    ){

        openModal();

    }

    // ESC → Close Modal

    if(

        e.key==="Escape"

        &&

        !taskModal.classList.contains("hidden")

    ){

        closeTaskModal();

    }

    // Ctrl/Cmd + F → Focus Search

    if(

        (e.ctrlKey || e.metaKey)

        &&

        e.key.toLowerCase()==="f"

    ){

        e.preventDefault();

        searchTask.focus();

    }

});

// ------------------------------------------------------
// CELEBRATION
// ------------------------------------------------------

function celebrate(){

    if(tasks.length===0){

        return;

    }

    const completed = tasks.filter(

        task=>task.status==="done"

    ).length;

    if(completed===tasks.length){

        showToast(

            "🎉 Congratulations! All tasks completed."

        );

    }

}

// ------------------------------------------------------
// UPDATE DASHBOARD WRAPPER
// ------------------------------------------------------

const originalUpdateDashboard = updateDashboard;

updateDashboard = function(){

    originalUpdateDashboard();

    celebrate();

};

// ------------------------------------------------------
// INITIALIZE APP
// ------------------------------------------------------

renderTasks();

loadTheme();

console.log("🚀 FlowBoard Ready");
// ======================================================
// FLOWBOARD
// FINAL VERSION
// PART 6/6
// Final Polish & Enhancements
// ======================================================

// ------------------------------------------------------
// PRIORITY SORT
// ------------------------------------------------------

function priorityValue(priority){

    switch(priority){

        case "High":

            return 1;

        case "Medium":

            return 2;

        case "Low":

            return 3;

        default:

            return 4;

    }

}

function sortTasks(){

    tasks.sort((a,b)=>{

        if(a.status===b.status){

            return priorityValue(a.priority)-priorityValue(b.priority);

        }

        return 0;

    });

}

const originalSave = saveTasks;

saveTasks = function(){

    sortTasks();

    originalSave();

};

// ------------------------------------------------------
// CARD ANIMATION
// ------------------------------------------------------

function animateCards(){

    document.querySelectorAll(".task-card").forEach((card,index)=>{

        card.style.opacity="0";

        card.style.transform="translateY(20px)";

        setTimeout(()=>{

            card.style.transition="all .35s ease";

            card.style.opacity="1";

            card.style.transform="translateY(0)";

        },index*70);

    });

}

// ------------------------------------------------------
// ENHANCED RENDER
// ------------------------------------------------------

const oldRender = renderTasks;

renderTasks = function(){

    oldRender();

    animateCards();

};

// ------------------------------------------------------
// AUTO FOCUS SEARCH
// ------------------------------------------------------

searchTask.addEventListener("focus",()=>{

    searchTask.parentElement.style.boxShadow=

        "0 0 0 4px rgba(99,102,241,.15)";

});

searchTask.addEventListener("blur",()=>{

    searchTask.parentElement.style.boxShadow="";

});

// ------------------------------------------------------
// WINDOW LOAD
// ------------------------------------------------------

window.addEventListener("load",()=>{

    renderTasks();

});

// ------------------------------------------------------
// CONSOLE
// ------------------------------------------------------

console.log(

    "%c🚀 FlowBoard Loaded Successfully",

    "color:#6366f1;font-size:16px;font-weight:bold;"

);