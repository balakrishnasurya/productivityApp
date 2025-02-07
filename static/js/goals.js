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