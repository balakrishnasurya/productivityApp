// Fetch and render goals
async function fetchGoals() {
    try {
        const response = await fetch('/api/goals');
        const goals = await response.json();
        renderGoals(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
    }
}

// Render goals in grid
function renderGoals(goals) {
    const goalsContainer = document.getElementById('goals-list');
    goalsContainer.innerHTML = goals.map(goal => `
        <div class="goal-card" onclick="window.location.href='/goals/${goal.id}'">
            <h3>${goal.title}</h3>
            <div class="time-left" data-deadline="${goal.deadline}">
                ${calculateTimeLeft(goal.deadline)}
            </div>
        </div>
    `).join('');
}

// Calculate time left
function calculateTimeLeft(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h left`;
}

// Submit new goal
async function submitGoal() {
    const form = document.getElementById('addGoalForm');
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addGoalModal'));
            modal.hide();
            fetchGoals();
        }
    } catch (error) {
        console.error('Error adding goal:', error);
    }
}

// Initialize Bootstrap Modal
document.addEventListener('DOMContentLoaded', function() {
    initializeViewControls();
    initializeFilters();
    loadGoals();
    updateStats();
});

let currentView = 'grid';
let currentFilter = 'all';

function initializeViewControls() {
    const viewButtons = document.querySelectorAll('.view-controls .btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentView = button.dataset.view;
            const container = document.getElementById('goalsContainer');
            container.className = `goals-${currentView}`;
            loadGoals(); // Reload goals with new view
        });
    });
}

function initializeFilters() {
    const filterSelect = document.getElementById('goalFilter');
    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        loadGoals();
    });
}

function updateStats() {
    // This would be connected to your backend to get real statistics
    const stats = {
        activeGoals: document.querySelectorAll('.goal-card:not(.completed)').length - 1, // -1 for add card
        completedGoals: document.querySelectorAll('.goal-card.completed').length,
        progressRate: calculateProgressRate()
    };

    document.getElementById('activeGoals').textContent = stats.activeGoals;
    document.getElementById('completedGoals').textContent = stats.completedGoals;
    document.getElementById('progressRate').textContent = `${stats.progressRate}%`;
}

function calculateProgressRate() {
    const completedGoals = document.querySelectorAll('.goal-card.completed').length;
    const totalGoals = document.querySelectorAll('.goal-card').length - 1; // -1 for add card
    return totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
}

function createGoalCard(goal) {
    const card = document.createElement('div');
    card.className = `goal-card ${goal.priority}-priority`;
    // Add click handler to the whole card
    card.addEventListener('click', () => {
        window.location.href = `/goals/${goal.id}`;  // Fixed URL path to match Flask route
    });
    
    card.innerHTML = `
        <div class="goal-card-content">
            <h3 class="goal-title">${goal.title}</h3>
            <div class="goal-meta">
                <span><i class="bi bi-calendar"></i> ${formatDeadline(goal.deadline)}</span>
                <span><i class="bi bi-flag"></i> ${goal.priority}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
                </div>
                <div class="progress-text">${goal.progress || 0}% Complete</div>
            </div>
            <div class="goal-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); viewGoalDetails('${goal.id}')">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); editGoal('${goal.id}')">
                    <i class="bi bi-pencil"></i> Edit
                </button>
            </div>
        </div>
    `;
    return card;
}

function formatDeadline(deadline) {
    return new Date(deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function showAddGoalModal() {
    const modalElement = document.getElementById('addGoalModal');
    if (!modalElement) {
        console.error('Modal element not found');
        return;
    }
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

let currentGoal = null;

async function openGoalDetail(goalId) {
    try {
        const response = await fetch(`/api/goals/${goalId}`);
        currentGoal = await response.json();
        renderGoalDetails();
        updateTimer();
        fetchActionLists();
        const modal = new bootstrap.Modal(document.getElementById('goalDetailModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching goal details:', error);
    }
}

function renderGoalDetails() {
    document.getElementById('goalDetailTitle').textContent = currentGoal.title;
    document.getElementById('goalDeadline').textContent = formatDate(currentGoal.deadline);
    document.getElementById('goalObjective').textContent = currentGoal.objectives;
    document.getElementById('goalMustDo').textContent = currentGoal.must_do;
}

function updateTimer() {
    if (!currentGoal) return;
    
    const timerElement = document.getElementById('goalTimer');
    const deadline = new Date(currentGoal.deadline);
    const now = new Date();
    const diff = deadline - now;
    
    if (diff < 0) {
        timerElement.textContent = 'Overdue';
        timerElement.classList.add('text-danger');
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    timerElement.textContent = `${days}d ${hours}h ${minutes}m`;
}

function toggleList(type) {
    const listElement = document.getElementById(`${type}List`);
    const buttonIcon = document.querySelector(`#toggle${type}Btn i`);
    
    if (listElement.style.display === 'none') {
        listElement.style.display = 'block';
        buttonIcon.classList.replace('bi-chevron-down', 'bi-chevron-up');
    } else {
        listElement.style.display = 'none';
        buttonIcon.classList.replace('bi-chevron-up', 'bi-chevron-down');
    }
}

async function addNewItem(type) {
    const input = document.getElementById(`new${type}Input`);
    const text = input.value.trim();
    
    if (!text || !currentGoal) return;
    
    try {
        const response = await fetch(`/api/goals/${currentGoal.id}/${type.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        
        if (response.ok) {
            input.value = '';
            await fetchActionLists();
        }
    } catch (error) {
        console.error(`Error adding ${type} item:`, error);
    }
}

async function fetchActionLists() {
    if (!currentGoal) return;
    
    try {
        const response = await fetch(`/api/goals/${currentGoal.id}/actions`);
        const data = await response.json();
        renderActionList('Must', data.must_do);
        renderActionList('Should', data.should_do);
        renderActionList('Could', data.could_do);
    } catch (error) {
        console.error('Error fetching action lists:', error);
    }
}

function renderActionList(type, items) {
    const listElement = document.getElementById(`${type}List`);
    listElement.innerHTML = items.map(item => `
        <div class="action-item ${item.completed ? 'completed' : ''}" onclick="toggleItemStatus('${type}', ${item.id})">
            <i class="bi ${item.completed ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
            <span>${item.text}</span>
        </div>
    `).join('');
}

async function toggleItemStatus(type, itemId) {
    try {
        const response = await fetch(`/api/goals/items/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: true }),
        });
        
        if (response.ok) {
            await fetchActionLists();
        }
    } catch (error) {
        console.error('Error toggling item status:', error);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function submitGoal() {
    const form = document.getElementById('addGoalForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const formData = new FormData(form);
    const goalData = {
        title: formData.get('title'),
        deadline: formData.get('deadline'),
        objectives: formData.get('objectives'),
        mustDo: formData.get('mustDo'),
        priority: formData.get('priority')
    };

    // Send to backend
    fetch('/api/goals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData)
    })
    .then(response => response.json())
    .then(goal => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGoalModal'));
        modal.hide();
        form.reset();
        loadGoals();
        updateStats();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to create goal. Please try again.');
    });
}

function loadGoals() {
    // This would fetch goals from your backend
    fetch(`/api/goals?filter=${currentFilter}`)
        .then(response => response.json())
        .then(goals => {
            const container = document.getElementById('goals-list');
            container.innerHTML = ''; // Clear existing goals
            goals.forEach(goal => {
                container.appendChild(createGoalCard(goal));
            });
            updateStats();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load goals. Please refresh the page.');
        });
}

// Add event listeners for form validation
document.getElementById('addGoalForm').addEventListener('submit', function(event) {
    event.preventDefault();
    event.stopPropagation();
    submitGoal();
});

async function viewGoalDetails(goalId) {
    try {
        const response = await fetch(`/api/goals/${goalId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch goal details');
        }
        window.location.href = `/goals/${goalId}`;  // Fixed URL path to match Flask route
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to open goal details');
    }
}