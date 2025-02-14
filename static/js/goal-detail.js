// Handle goal detail page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeProgressChart();
    loadActionLists();
});

function initializeCountdown() {
    const countdownElement = document.getElementById('countdown');
    const deadline = new Date(countdownElement.dataset.deadline);
    
    function updateCountdown() {
        const now = new Date();
        const distance = deadline - now;
        
        if (distance < 0) {
            countdownElement.innerHTML = `<span class="overdue">Overdue!</span>`;
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m remaining`;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 60000); // Update every minute
}

function initializeProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Will be populated with dates
            datasets: [{
                label: 'Progress',
                data: [], // Will be populated with progress data
                borderColor: '#4299e1',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // TODO: Fetch and update progress data
    loadProgressData(chart);
}

async function loadProgressData(chart) {
    try {
        const response = await fetch(`/api/goals/${goalData.id}/progress`);
        const data = await response.json();
        
        chart.data.labels = data.dates;
        chart.data.datasets[0].data = data.progress;
        chart.update();
    } catch (error) {
        console.error('Error loading progress data:', error);
    }
}

async function loadActionLists() {
    try {
        // Load "What Works" items
        const worksWellResponse = await fetch(`/api/goals/${goalData.id}/works-well`);
        const worksWellData = await worksWellResponse.json();
        renderActionList('worksWellList', worksWellData, 'works-well');
        
        // Load "Needs Change" items
        const needsChangeResponse = await fetch(`/api/goals/${goalData.id}/needs-change`);
        const needsChangeData = await needsChangeResponse.json();
        renderActionList('needsChangeList', needsChangeData, 'needs-change');
    } catch (error) {
        console.error('Error loading action lists:', error);
    }
}

function renderActionList(containerId, items, listType) {
    const container = document.getElementById(containerId);
    const listElement = container.querySelector('.items-list');
    
    listElement.innerHTML = items.map(item => `
        <li class="action-item">
            <span>${item.description}</span>
            <div class="item-actions">
                <button class="btn-icon" onclick="editItem('${item.id}', '${listType}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-icon" onclick="deleteItem('${item.id}', '${listType}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

async function addNewItem(listType) {
    const description = prompt('Enter new item:');
    if (!description) return;
    
    try {
        const response = await fetch(`/api/goals/${goalData.id}/${listType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description })
        });
        
        if (response.ok) {
            loadActionLists(); // Reload lists to show new item
        }
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item');
    }
}

async function editItem(itemId, listType) {
    const item = document.querySelector(`[data-item-id="${itemId}"]`);
    const currentContent = item.querySelector('span').textContent;
    const newContent = prompt('Edit item:', currentContent);
    
    if (!newContent || newContent === currentContent) return;
    
    try {
        const response = await fetch(`/api/goals/${goalData.id}/${listType}/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description: newContent })
        });
        
        if (response.ok) {
            loadActionLists(); // Reload lists to show updated item
        }
    } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item');
    }
}

async function deleteItem(itemId, listType) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`/api/goals/${goalData.id}/${listType}/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadActionLists(); // Reload lists to remove deleted item
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
    }
}

// Handle mood tracking
document.querySelectorAll('.mood-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

// Handle daily check-in
document.querySelector('.btn-save-checkin').addEventListener('click', async function() {
    const activeMood = document.querySelector('.mood-btn.active');
    const notes = document.querySelector('.daily-notes').value;
    
    if (!activeMood) {
        alert('Please select your mood');
        return;
    }
    
    try {
        const response = await fetch(`/api/goals/${goalData.id}/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mood: activeMood.dataset.mood,
                notes: notes
            })
        });
        
        if (response.ok) {
            alert('Check-in saved successfully!');
            document.querySelector('.daily-notes').value = '';
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
        }
    } catch (error) {
        console.error('Error saving check-in:', error);
        alert('Failed to save check-in');
    }
});