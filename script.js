document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task-input");
    const addBtn = document.getElementById("add-btn");
    const taskList = document.getElementById("task-list");

    let editMode = false;
    let taskToEdit = null;

    // Load tasks from localStorage
    loadTasks();

    addBtn.addEventListener("click", function () {
        const taskText = taskInput.value.trim(); // Get value from input
        if (taskText !== "") {
            if (editMode) {
                updateTask(taskToEdit, taskText);
                editMode = false;
                taskToEdit = null;
                addBtn.textContent = "Add";
            } else {
                addTask(taskText);
            }
            taskInput.value = ""; // Clear the input after adding the task
            saveTasks();
        }
    });

    taskList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-btn")) {
            deleteTask(e.target.parentElement.parentElement);
            saveTasks();
        } else if (e.target.classList.contains("edit-btn")) {
            enableEditTask(e.target.parentElement.parentElement);
        } else if (e.target.classList.contains("complete-btn")) {
            toggleCompleteTask(e.target.parentElement.parentElement);
            saveTasks();
        }
    });

    // Function to add a new task
    function addTask(text) {
        const li = document.createElement("li");
        li.className = "task-item";
        li.innerHTML = `
            <span class="text">${text}</span>
            <div class="actions">
                <button class="complete-btn">✔️</button>
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            </div>
        `;
        taskList.appendChild(li);
        makeDraggable();
    }

    // Function to enable edit mode
    function enableEditTask(taskItem) {
        taskInput.value = taskItem.querySelector(".text").textContent;
        editMode = true;
        taskToEdit = taskItem;
        addBtn.textContent = "Update";
    }

    // Function to update a task
    function updateTask(taskItem, newText) {
        taskItem.querySelector(".text").textContent = newText;
    }

    // Function to delete a task with animation
    function deleteTask(taskItem) {
        taskItem.classList.add("fade-out");
        taskItem.addEventListener("animationend", function () {
            taskItem.remove();
            saveTasks();
        });
    }

    // Function to toggle completion of a task
    function toggleCompleteTask(taskItem) {
        const taskText = taskItem.querySelector(".text");
        taskText.classList.toggle("completed");
        if (taskText.classList.contains("completed")) {
            taskItem.style.backgroundColor = "#ddaceb"; // Light green background for completed tasks
            taskItem.style.color = "#155724"; // Dark green text for completed tasks
        } else {
            taskItem.style.backgroundColor = ""; // Reset background color
            taskItem.style.color = ""; // Reset text color
        }
    }

    // Save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll(".task-item").forEach(task => {
            tasks.push({
                text: task.querySelector(".text").textContent,
                completed: task.querySelector(".text").classList.contains("completed"),
            });
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.forEach(task => {
            addTask(task.text);
            if (task.completed) {
                const taskItem = taskList.lastChild;
                taskItem.querySelector(".text").classList.add("completed");
            }
        });
    }

    // Make tasks draggable
    function makeDraggable() {
        const draggables = document.querySelectorAll(".task-item");
        const container = taskList;

        draggables.forEach(draggable => {
            draggable.setAttribute("draggable", true);

            draggable.addEventListener("dragstart", () => {
                draggable.classList.add("dragging");
            });

            draggable.addEventListener("dragend", () => {
                draggable.classList.remove("dragging");
                saveTasks();
            });
        });

        container.addEventListener("dragover", e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector(".dragging");
            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        });

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll(".task-item:not(.dragging)")];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    }
});
