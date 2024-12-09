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

    // Task Management
    let currentOpenForm = null;

    // Handle quick add task triggers
    document.querySelectorAll('.quick-add-task').forEach(container => {
        const trigger = container.querySelector('.add-task-trigger');
        const form = container.querySelector('.task-input-form');
        const saveBtn = container.querySelector('.save-task');
        const cancelBtn = container.querySelector('.cancel-task');
        const titleInput = container.querySelector('.task-title-input');

        if (trigger && form) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close any other open forms
                if (currentOpenForm && currentOpenForm !== form) {
                    currentOpenForm.style.display = 'none';
                }

                // Toggle this form
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
                currentOpenForm = form;

                if (form.style.display === 'block') {
                    titleInput?.focus();
                }
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const title = titleInput?.value.trim();
                if (!title) {
                    titleInput?.classList.add('error');
                    titleInput?.focus();
                    return;
                }

                const taskData = {
                    title: title,
                    description: container.querySelector('.task-description')?.value.trim() || '',
                    quadrant: parseInt(container.getAttribute('data-quadrant')),
                    due_date: container.querySelector('.task-time')?.value || null
                };

                const newTask = await createTask(taskData);
                if (newTask) {
                    resetForm(container);
                    await fetchTasks();
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetForm(container);
            });
        }
    });

    // Close form when clicking outside
    document.addEventListener('click', (e) => {
        if (currentOpenForm && !e.target.closest('.quick-add-task')) {
            currentOpenForm.style.display = 'none';
            currentOpenForm = null;
        }
    });

    function resetForm(container) {
        const form = container.querySelector('.task-input-form');
        const inputs = container.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });

        if (form) {
            form.style.display = 'none';
        }
        currentOpenForm = null;
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to create task');
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task. Please try again.');
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
            alert('Failed to delete task. Please try again.');
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
            if (container) {
                container.innerHTML = quadrantTasks.map(task => createTaskCard(task)).join('');
            }
        }
    }

    function renderListView() {
        const container = document.querySelector('.task-list');
        if (!container) return;

        const priorityOrder = [1, 3, 2, 4];
        const sortedTasks = tasks.sort((a, b) => {
            const priorityA = priorityOrder.indexOf(a.quadrant);
            const priorityB = priorityOrder.indexOf(b.quadrant);
            if (priorityA === priorityB && a.due_date && b.due_date) {
                return new Date(a.due_date) - new Date(b.due_date);
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

        const quadrantColors = {
            1: '#f44336',
            2: '#2196f3',
            3: '#ff9800',
            4: '#4caf50'
        };

        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        ${showQuadrant ? `<span class="task-badge" style="background-color: ${quadrantColors[task.quadrant]}20; color: ${quadrantColors[task.quadrant]}">${quadrantLabels[task.quadrant]}</span>` : ''}
                    </div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    ${task.due_date ? `
                        <div class="task-meta">
                            <span class="due-date">
                                <i class="fas fa-calendar"></i> Due: ${new Date(task.due_date).toLocaleString()}
                            </span>
                        </div>
                    ` : ''}
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

    // Handle task actions
    document.addEventListener('click', function(e) {
        const doneBtn = e.target.closest('.btn-done');
        const deleteBtn = e.target.closest('.btn-delete');
        
        if (doneBtn) {
            const taskId = doneBtn.closest('.task-item').dataset.taskId;
            completeTask(taskId);
        } else if (deleteBtn) {
            const taskId = deleteBtn.closest('.task-item').dataset.taskId;
            deleteTask(taskId);
        }
    });

    function completeTask(taskId) {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.style.opacity = '0';
            taskCard.style.transform = 'translateX(20px)';
            setTimeout(() => deleteTask(taskId), 300);
        }
    }

    // Initial load
    fetchTasks();
});

// Auto-refresh tasks every 30 seconds
setInterval(fetchTasks, 30000);
