// View Management
function setView(viewType) {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const gridViewBtn = document.querySelector('button[onclick="setView(\'grid\')"]');
    const listViewBtn = document.querySelector('button[onclick="setView(\'list\')"]');

    if (viewType === 'grid') {
        gridView.style.display = 'grid';
        listView.style.display = 'none';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        gridView.style.display = 'none';
        listView.style.display = 'block';
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
    }
}

// Task Form Management
function toggleTaskForm(quadrant) {
    console.log('Toggling form for quadrant:', quadrant); // Debug log
    
    const quadrantElement = document.querySelector(`#quadrant-${quadrant}`);
    if (!quadrantElement) {
        console.error('Quadrant element not found:', quadrant);
        return;
    }

    const formContainer = quadrantElement.querySelector('.add-task-form');
    const addButton = quadrantElement.querySelector('.btn-add-task');
    
    if (!formContainer || !addButton) {
        console.error('Form or button not found in quadrant:', quadrant);
        return;
    }

    // Hide all forms and show all add buttons first
    document.querySelectorAll('.add-task-form').forEach(form => {
        form.style.display = 'none';
    });
    document.querySelectorAll('.btn-add-task').forEach(btn => {
        btn.style.display = 'flex';
    });

    // Toggle the clicked form
    formContainer.style.display = 'block';
    addButton.style.display = 'none';
}

function toggleListTaskForm() {
    const form = document.querySelector('.list-task-form');
    const button = document.querySelector('.btn-add-task-list');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        button.style.opacity = '0.5';
    } else {
        form.style.display = 'none';
        button.style.opacity = '1';
    }
}

// Task Actions
async function markTaskDone(taskId, currentStatus, buttonElement) {
    try {
        const taskCard = buttonElement.closest('.task-card');
        taskCard.classList.add('fade-out');

        const response = await fetch(`/toggle_task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                completed: true,
                completed_at: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error('Failed to update task');

        const data = await response.json();

        setTimeout(() => {
            taskCard.remove();
            loadHistoryData(); // Refresh history data
        }, 300);
    } catch (error) {
        console.error('Error:', error);
        const taskCard = buttonElement.closest('.task-card');
        taskCard.classList.remove('fade-out');
        alert('Error updating task status');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.classList.add('fade-out');
        }

        const response = await fetch(`/delete_task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to delete task');

        setTimeout(() => {
            if (taskCard) {
                taskCard.remove();
            }
            loadHistoryData(); // Refresh history data
        }, 300);
    } catch (error) {
        console.error('Error:', error);
        if (taskCard) {
            taskCard.classList.remove('fade-out');
        }
        alert('Error deleting task');
    }
}

// History Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('historySidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        loadHistoryData(); // Load history data when sidebar is opened
    }
}

// History data loading and rendering
async function loadHistoryData() {
    try {
        const [completedResponse, deletedResponse] = await Promise.all([
            fetch('/api/completed-tasks'),
            fetch('/api/deleted-tasks')
        ]);

        if (!completedResponse.ok || !deletedResponse.ok) {
            throw new Error('Failed to fetch history data');
        }

        const completedTasks = await completedResponse.json();
        const deletedTasks = await deletedResponse.json();

        // Update badge counts
        document.getElementById('completedCount').textContent = completedTasks.length;
        document.getElementById('deletedCount').textContent = deletedTasks.length;

        // Render tasks in respective tabs
        renderHistoryTasks('completedTasks', completedTasks, true);
        renderHistoryTasks('deletedTasks', deletedTasks, false);
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function renderHistoryTasks(containerId, tasks, isCompleted) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = `<div class="empty-state">No ${isCompleted ? 'completed' : 'deleted'} tasks</div>`;
        return;
    }

    const tasksHTML = tasks.map(task => `
        <div class="history-task-card" data-task-id="${task.id}">
            <div class="task-header">
                <div class="task-priority-indicator quadrant-${task.quadrant}"></div>
                <h5>${task.title}</h5>
                ${!isCompleted ? `
                    <button class="btn btn-sm btn-outline-primary restore-btn" onclick="restoreTask(${task.id})">
                        <i class="bi bi-arrow-counterclockwise"></i> Restore
                    </button>
                ` : ''}
            </div>
            <p class="task-description">${task.description || ''}</p>
            <div class="history-timestamp">
                ${isCompleted ? 
                    `Completed: ${new Date(task.completed_at).toLocaleString()}` :
                    `Deleted: ${new Date(task.deleted_at).toLocaleString()}`}
            </div>
        </div>
    `).join('');

    container.innerHTML = tasksHTML;
}

// Task restoration
async function restoreTask(taskId) {
    try {
        const response = await fetch(`/api/restore-task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to restore task');
        }

        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.classList.add('fade-out');
            setTimeout(() => {
                taskCard.remove();
                loadHistoryData();
                window.location.reload(); // Refresh the page to show restored task
            }, 300);
        }
    } catch (error) {
        console.error('Error restoring task:', error);
        alert(error.message);
    }
}

// History Sidebar Tab Management
function setupHistoryTabs() {
    const tabButtons = document.querySelectorAll('.history-tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            document.querySelectorAll('.history-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.history-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked button and its content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Load data for the active tab
            loadHistoryData();
        });
    });
}

// Add task submission handler
async function handleTaskSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const quadrant = form.querySelector('input[name="quadrant"]').value;

    try {
        const response = await fetch('/add_task', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to add task');
        }

        // Clear form and hide it
        form.reset();
        form.style.display = 'none';
        
        // Show the add button again
        const quadrantElement = document.querySelector(`#quadrant-${quadrant}`);
        const addButton = quadrantElement.querySelector('.btn-add-task');
        if (addButton) {
            addButton.style.display = 'flex';
        }

        // Reload the page to show new task
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add task');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set default view
    setView('grid');

    // Initialize all task forms to be hidden
    document.querySelectorAll('.add-task-form').forEach(form => {
        form.style.display = 'none';
    });

    // Add form submission handlers for all quadrants
    document.querySelectorAll('.add-task-form').forEach(form => {
        form.addEventListener('submit', handleTaskSubmit);
    });

    // Show all add task buttons
    document.querySelectorAll('.btn-add-task').forEach(button => {
        button.style.display = 'flex';
    });

    // Add click handlers for cancel buttons
    document.querySelectorAll('.btn-cancel-task').forEach(button => {
        button.addEventListener('click', (e) => {
            const quadrant = e.target.closest('.quadrant').getAttribute('data-quadrant');
            const form = e.target.closest('.add-task-form');
            const addButton = document.querySelector(`#quadrant-${quadrant} .btn-add-task`);
            
            if (form && addButton) {
                form.style.display = 'none';
                form.reset();
                addButton.style.display = 'flex';
            }
        });
    });

    // Add overlay click handler
    document.querySelector('.sidebar-overlay').addEventListener('click', toggleSidebar);

    // Initialize history data if sidebar is open
    const sidebar = document.getElementById('historySidebar');
    if (sidebar && sidebar.classList.contains('active')) {
        loadHistoryData();
    }

    // Add tab change listeners
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function() {
            loadHistoryData(); // Refresh data when switching tabs
        });
    });

    setupHistoryTabs();

    // Add event delegation for restore buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.restore-btn')) {
            const taskId = e.target.closest('.history-task-card').dataset.taskId;
            restoreTask(taskId);
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        toggleSidebar();
    }
});