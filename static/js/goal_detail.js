let currentGoal = null;

// Fetch and display goal details
async function fetchGoalDetails(goalId) {
    try {
        const response = await fetch(`/api/goals/${goalId}`);
        currentGoal = await response.json();
        renderGoalDetails();
        updateTimer();
        fetchActionLists();
    } catch (error) {
        console.error('Error fetching goal details:', error);
    }
}

// Render goal details
function renderGoalDetails() {
    document.getElementById('goalTitle').textContent = currentGoal.title;
    document.getElementById('goalDeadline').textContent = formatDate(currentGoal.deadline);
    document.getElementById('goalObjective').textContent = currentGoal.objectives;
    document.getElementById('goalMustDo').textContent = currentGoal.must_do;
}

// Update timer display
function updateTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const deadline = new Date(currentGoal.deadline);
    
    function update() {
        const now = new Date();
        const diff = deadline - now;
        
        if (diff < 0) {
            timerDisplay.textContent = 'Goal Overdue';
            timerDisplay.classList.add('overdue');
            return;
        }
        
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timerDisplay.textContent = `${months}m ${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
    }
    
    update();
    setInterval(update, 1000);
}

// Toggle action lists
function toggleList(type) {
    const listElement = document.getElementById(`${type}List`);
    listElement.style.display = listElement.style.display === 'none' ? 'block' : 'none';
}

// Add new item to a list
async function addNewItem(type) {
    const description = prompt('Enter new item:');
    if (!description) return;
    
    try {
        const response = await fetch(`/api/goals/${currentGoal.id}/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description }),
        });
        
        if (response.ok) {
            fetchActionLists();
        }
    } catch (error) {
        console.error('Error adding item:', error);
    }
}

// Fetch and render action lists
async function fetchActionLists() {
    try {
        const worksWellResponse = await fetch(`/api/goals/${currentGoal.id}/works-well`);
        const needsChangeResponse = await fetch(`/api/goals/${currentGoal.id}/needs-change`);
        
        const worksWellItems = await worksWellResponse.json();
        const needsChangeItems = await needsChangeResponse.json();
        
        renderActionList('worksWell', worksWellItems);
        renderActionList('needsChange', needsChangeItems);
    } catch (error) {
        console.error('Error fetching action lists:', error);
    }
}

// Render action list
function renderActionList(type, items) {
    const listContainer = document.querySelector(`#${type}List .list-items`);
    listContainer.innerHTML = items.map(item => `
        <div class="action-item" data-id="${item.id}">
            <span class="item-text">${item.description}</span>
            <div class="item-actions">
                <button class="btn btn-sm btn-link" onclick="editItem('${type}', ${item.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-link text-danger" onclick="deleteItem('${type}', ${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const goalId = new URLSearchParams(window.location.search).get('id');
    if (goalId) {
        fetchGoalDetails(goalId);
    }
}); 