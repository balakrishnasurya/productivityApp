// Task state management
let tasks = [];

document.addEventListener('DOMContentLoaded', function() {
    // View Toggle
    const quadrantViewBtn = document.getElementById('quadrantViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const quadrantView = document.getElementById('quadrantView');
    const listView = document.getElementById('listView');

    // View Toggle Event Listeners
    quadrantViewBtn.addEventListener('click', () => {
        quadrantViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        quadrantView.classList.add('active');
        listView.classList.remove('active');
    });

    listViewBtn.addEventListener('click', () => {
        listViewBtn.classList.add('active');
        quadrantViewBtn.classList.remove('active');
        listView.classList.add('active');
        quadrantView.classList.remove('active');
        renderListView();
    });

    // Add Task Button Handlers
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-task-btn')) {
            const button = e.target.closest('.add-task-btn');
            const quadrant = button.dataset.quadrant;
            showTaskForm(button, quadrant);
        } else if (e.target.closest('.save-task')) {
            const form = e.target.closest('.inline-task-form');
            saveTask(form);
        } else if (e.target.closest('.cancel-task')) {
            const form = e.target.closest('.inline-task-form');
            form.remove();
        } else if (e.target.closest('.btn-done')) {
            const taskId = e.target.closest('.task-card').dataset.taskId;
            completeTask(taskId);
        } else if (e.target.closest('.btn-delete')) {
            const taskId = e.target.closest('.task-card').dataset.taskId;
            deleteTask(taskId);
        }
    });

    // Initial load
    fetchTasks();
});

function showTaskForm(button, quadrant) {
    // Remove any existing open forms
    const existingForms = document.querySelectorAll('.inline-task-form');
    existingForms.forEach(form => form.remove());

    // Get the template and create a new form
    const template = document.getElementById('taskFormTemplate');
    const newForm = template.content.cloneNode(true);
    
    // Set the quadrant
    const quadrantSelect = newForm.querySelector('.task-quadrant');
    quadrantSelect.value = quadrant;

    // Insert the form after the button
    button.insertAdjacentElement('afterend', newForm.firstElementChild);

    // Focus on the title input
    setTimeout(() => {
        const titleInput = button.nextElementSibling.querySelector('.task-title');
        if (titleInput) titleInput.focus();
    }, 0);
}

async function saveTask(form) {
    const titleInput = form.querySelector('.task-title');
    const title = titleInput.value.trim();
    
    if (!title) {
        titleInput.classList.add('error');
        titleInput.focus();
        return;
    }

    const taskData = {
        title: title,
        description: form.querySelector('.task-description').value.trim(),
        quadrant: parseInt(form.querySelector('.task-quadrant').value),
        due_date: form.querySelector('.task-due-date').value || null
    };

    const newTask = await createTask(taskData);
    if (newTask) {
        form.remove();
    }
}

// API Functions
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

async function createTask(taskData) {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to create task');
        const newTask = await response.json();
        tasks.push(newTask);
        renderTasks();
        return newTask;
    } catch (error) {
        console.error('Error creating task:', error);
        return null;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete task');
        tasks = tasks.filter(t => t.id !== parseInt(taskId));
        renderTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Render Functions
function renderTasks() {
    if (document.getElementById('quadrantView').classList.contains('active')) {
        renderQuadrantView();
    } else {
        renderListView();
    }
}

function renderQuadrantView() {
    for (let i = 1; i <= 4; i++) {
        const quadrantTasks = tasks.filter(t => t.quadrant === i);
        const container = document.getElementById(`quadrant-${i}`);
        container.innerHTML = quadrantTasks.map(task => createTaskCard(task)).join('');
    }
}

function renderListView() {
    const container = document.querySelector('.tasks-container');
    const priorityOrder = [1, 3, 2, 4]; // Reordered according to priority
    
    const sortedTasks = tasks.sort((a, b) => {
        const priorityA = priorityOrder.indexOf(a.quadrant);
        const priorityB = priorityOrder.indexOf(b.quadrant);
        if (priorityA === priorityB) {
            // If same priority, sort by due date if available
            if (a.due_date && b.due_date) {
                return new Date(a.due_date) - new Date(b.due_date);
            }
            return 0;
        }
        return priorityA - priorityB;
    });
    
    container.innerHTML = sortedTasks.map(task => createTaskCard(task, true)).join('');
}

function createTaskCard(task, showQuadrant = false) {
    const quadrantLabels = {
        1: 'Urgent & Important',
        2: 'Not Urgent & Important',
        3: 'Urgent & Not Important',
        4: 'Not Urgent & Not Important'
    };

    return `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    ${showQuadrant ? `<div class="task-quadrant-label">${quadrantLabels[task.quadrant]}</div>` : ''}
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                ${task.due_date ? `<div class="task-due-date">Due: ${new Date(task.due_date).toLocaleString()}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn-done" title="Complete Task">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-delete" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function completeTask(taskId) {
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskCard) {
        taskCard.style.opacity = '0';
        taskCard.style.transform = 'translateX(20px)';
        setTimeout(() => deleteTask(taskId), 300);
    }
}

// Auto-refresh tasks every 30 seconds
setInterval(fetchTasks, 30000);
