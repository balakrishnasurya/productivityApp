# Four Quadrants Task Manager

## Overview
A modern task management web application based on the Eisenhower Matrix (also known as the Urgent-Important Matrix). This tool helps users prioritize tasks by organizing them into four quadrants based on their urgency and importance.

## Features

### Core Functionality
- **Quadrant-based Task Organization**
  - Quadrant 1: Urgent & Important
  - Quadrant 2: Not Urgent & Important
  - Quadrant 3: Urgent & Not Important
  - Quadrant 4: Not Urgent & Not Important

### Task Management
- **Task Creation**
  - Add tasks to specific quadrants
  - Set task titles and descriptions
  - Add due dates
- **Task Actions**
  - Mark tasks as complete with smooth fade-out animation
  - Delete tasks
  - Visual priority indicators

### View Options
- **Grid View**
  - Traditional 4-quadrant layout
  - Each quadrant clearly labeled
  - Individual task management within each quadrant
- **List View**
  - Consolidated view of all tasks
  - Color-coded priority indicators
  - Tasks sorted by quadrant priority

### User Interface
- **Modern Design**
  - Clean and intuitive interface
  - Responsive layout for all screen sizes
  - Smooth animations and transitions
  - Visual feedback for user actions
- **Interactive Elements**
  - Hover effects on tasks and buttons
  - Easy-to-use task creation forms
  - Intuitive action buttons

## Technical Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap 5.1.3
- Bootstrap Icons 1.7.2

### Backend
- Python 3.x
- Flask 2.0.1
- SQLAlchemy 1.4.23

### Database
- SQLite

## Installation

1. **Clone the Repository**
bash
git clone <repository-url>
cd four-quadrants-task-manager

2. **Set Up Virtual Environment**
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the Application**
```bash
python app.py
```

5. **Access the Application**
Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure
```
four-quadrants-task-manager/
├── app.py                 # Main application file
├── models.py             # Database models
├── requirements.txt      # Project dependencies
├── static/
│   └── css/
│       └── style.css    # Application styles
└── templates/
    └── index.html       # Main application template
```

## Usage

1. **Adding Tasks**
   - Click the "Add Task" button in any quadrant
   - Enter task title, description, and optional due date
   - Click confirm to save the task

2. **Managing Tasks**
   - Mark tasks as complete using the checkmark button
   - Delete tasks using the trash button
   - Tasks fade out smoothly when completed

3. **Switching Views**
   - Toggle between Grid and List views using the view controls
   - List view shows tasks sorted by priority with color indicators

## Development

### Running in Debug Mode
```bash
python app.py
```
The application will start in debug mode, allowing for automatic reloading on code changes.

### Database
- SQLite database is automatically created on first run
- Database file: `tasks.db`
- Models are defined in `models.py`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements
- User authentication and multiple user support
- Task categories and tags
- Task search and filtering
- Data export/import functionality
- Dark mode theme
- Mobile application