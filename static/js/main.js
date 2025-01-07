// Task Form Functions
function toggleTaskForm(quadrant) {
    const form = document.querySelector(`#quadrant-${quadrant} .add-task-form`);
    const button = document.querySelector(`#quadrant-${quadrant} .btn-add-task`);
    if (form.style.display === 'none') {
        form.style.display = 'block';
        button.style.display = 'none';
    } else {
        form.style.display = 'none';
        button.style.display = 'flex';
    }
}

// Task Management Functions
function markTaskDone(taskId, currentStatus, buttonElement) {
    const taskCard = buttonElement.closest('.task-card');
    
    // Add fade-out class to start animation
    taskCard.classList.add('fade-out');
    
    // Wait for animation to complete before making the API call
    setTimeout(() => {
        fetch(`/toggle_task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !currentStatus })
        })
        .then(response => {
            if (response.ok) {
                // Remove the task card from DOM after animation
                taskCard.remove();
            } else {
                // If there's an error, remove the fade-out class
                taskCard.classList.remove('fade-out');
                alert('Error updating task status');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            taskCard.classList.remove('fade-out');
            alert('Error updating task status');
        });
    }, 300); // Match this timing with the CSS transition duration
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        fetch(`/delete_task/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                alert('Error deleting task');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting task');
        });
    }
}

// View Switching Functions
document.addEventListener('DOMContentLoaded', function() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');

    gridViewBtn.addEventListener('click', () => {
        gridView.style.display = 'grid';
        listView.style.display = 'none';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    });

    listViewBtn.addEventListener('click', () => {
        gridView.style.display = 'none';
        listView.style.display = 'block';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    });
});
