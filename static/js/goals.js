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
        <div class="goal-card" onclick="openGoalDetail(${goal.id})">
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
    // Initialize goals list
    fetchGoals();
    // Update time left displays periodically
    setInterval(() => {
        document.querySelectorAll('.time-left').forEach(el => {
            el.textContent = calculateTimeLeft(el.dataset.deadline);
        });
    }, 60000); // Update every minute
});

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