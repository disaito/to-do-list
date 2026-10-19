// renderer.js - all the to-do list logic

// ---------- 1. GRAB ELEMENTS FROM THE HTML ----------
// We find each element by its id so JavaScript can use it
const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const categoryInput = document.getElementById("category-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

// ---------- 2. DATA ----------
// Each task looks like: { id, text, dueDate, category, done }
let tasks = [];

// Remembers which task we are editing (null = not editing anything)
let editingId = null;

// ---------- 3. SAVE AND LOAD (localStorage) ----------
function saveTasks() {
    // localStorage only stores text, so we turn the list into text first
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem("tasks");
    if (saved) {
        // Turn the saved text back into a list
        tasks = JSON.parse(saved);
    }
}

// ---------- 4. ADD OR SAVE A TASK ----------
function addOrSaveTask() {
    const text = taskInput.value.trim(); // trim removes extra spaces
    if (text === "") {
        return; // do nothing if the box is empty
    }

    if (editingId !== null) {
        // We are editing: find the task and update it
        const task = tasks.find(function (t) {
            return t.id === editingId;
        });
        task.text = text;
        task.dueDate = dateInput.value;
        task.category = categoryInput.value;

        editingId = null;
        addBtn.textContent = "Add";
    } else {
        // We are adding: make a new task
        const newTask = {
            id: Date.now(), // current time in milliseconds = unique number
            text: text,
            dueDate: dateInput.value,
            category: categoryInput.value,
            done: false
        };
        tasks.push(newTask);
    }

    // Clear the inputs
    taskInput.value = "";
    dateInput.value = "";

    saveTasks();
    render();
}

// ---------- 5. TOGGLE DONE, DELETE, EDIT ----------
function toggleDone(id) {
    const task = tasks.find(function (t) {
        return t.id === id;
    });
    task.done = !task.done; // flips true to false, false to true

    saveTasks();
    render();
}

function deleteTask(id) {
    // Keep every task EXCEPT the one with this id
    tasks = tasks.filter(function (t) {
        return t.id !== id;
    });

    // If we were editing the deleted task, cancel the edit
    if (editingId === id) {
        editingId = null;
        addBtn.textContent = "Add";
        taskInput.value = "";
        dateInput.value = "";
    }

    saveTasks();
    render();
}

function startEdit(id) {
    const task = tasks.find(function (t) {
        return t.id === id;
    });

    // Put the task's values back into the inputs
    taskInput.value = task.text;
    dateInput.value = task.dueDate;
    categoryInput.value = task.category;

    editingId = id;
    addBtn.textContent = "Save";
    taskInput.focus();
}

// ---------- 6. PROGRESS BAR ----------
function updateProgress() {
    const total = tasks.length;
    const doneCount = tasks.filter(function (t) {
        return t.done;
    }).length;

    let percent = 0;
    if (total > 0) {
        percent = (doneCount / total) * 100;
    }

    progressFill.style.width = percent + "%";

    if (total > 0 && doneCount === total) {
        progressText.textContent = "All done!";
    } else {
        progressText.textContent = doneCount + " of " + total + " done";
    }
}

// ---------- 7. RENDER (draw the list on screen) ----------
function render() {
    taskList.innerHTML = ""; // clear the list first

    // Today's date as YYYY-MM-DD, used to spot overdue tasks
    const today = new Date().toLocaleDateString("en-CA");

    if (tasks.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No tasks yet. Add one above.";
        taskList.appendChild(empty);
    }

    tasks.forEach(function (task) {
        // The list item
        const li = document.createElement("li");
        if (task.done) {
            li.classList.add("done");
        }
        if (task.dueDate && task.dueDate < today && !task.done) {
            li.classList.add("overdue");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("click", function () {
            toggleDone(task.id);
        });

        // Task text
        const text = document.createElement("div");
        text.className = "task-text";
        text.textContent = task.text;

        // Category tag
        const tag = document.createElement("span");
        tag.className = "tag " + task.category.toLowerCase();
        tag.textContent = task.category;

        // Due date
        const due = document.createElement("span");
        due.className = "due-date";
        if (task.dueDate) {
            due.textContent = "Due " + task.dueDate;
        }

        // Meta row (tag + date)
        const meta = document.createElement("div");
        meta.className = "task-meta";
        meta.appendChild(tag);
        meta.appendChild(due);

        // Info box (text + meta)
        const info = document.createElement("div");
        info.className = "task-info";
        info.appendChild(text);
        info.appendChild(meta);

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", function () {
            startEdit(task.id);
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function () {
            deleteTask(task.id);
        });

        // Put everything inside the list item, then add it to the list
        li.appendChild(checkbox);
        li.appendChild(info);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    updateProgress();
}

// ---------- 8. EVENTS AND START ----------
addBtn.addEventListener("click", addOrSaveTask);

// Pressing Enter in the text box also adds the task
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addOrSaveTask();
    }
});

loadTasks();
render();