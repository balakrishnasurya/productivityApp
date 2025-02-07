# Four Quadrants Task Manager - Current Implementation

## Core Architecture
The application is built as a modern task management system based on the Eisenhower Matrix, implemented using Flask backend and vanilla JavaScript frontend. The current version features a responsive design with both grid and list views.

## Current Features

### 1. Interface Design
- Clean, minimalist interface with a light color scheme
- Custom CSS variables for consistent theming (see style.css lines 1-10)
- Responsive grid layout for quadrants
- Smooth transitions and hover effects
- Collapsible sidebar with history functionality

### 2. Task Organization
Each quadrant is distinctly styled with:
- Unique colored headers (Q1-Q4)
- Single-line headers with quadrant numbers and descriptions
- Consistent spacing and alignment
- Border-top color coding for priority indication

### 3. Task Management
Tasks include:
- Title and description fields
- Due date option
- Priority indicators
- Complete and delete actions
- Smooth fade animations for task state changes

### 4. View Options
#### Grid View
- 2x2 grid layout
- Each quadrant clearly defined
- Add task button in each quadrant
- Task cards with priority indicators

#### List View
- Linear task display
- Priority-based sorting
- Consistent task card design

### 5. History Tracking
- Vertical navigation in sidebar
- Completed tasks section
- Deleted tasks section
- Restore functionality for deleted tasks

### 6. Visual Hierarchy
- Subtle background colors
- Clear typography scale
- Consistent spacing
- Visual feedback on interactions

## Technical Implementation

### Frontend Structure
- Bootstrap 5.1.3 for base components
- Custom CSS for styling
- Vanilla JavaScript for interactions
- Bootstrap Icons for iconography

### Key Components
1. Main Container
   - App header with view controls
   - Grid/List view toggle
   - Collapsible sidebar

2. Quadrants
   - Styled headers
   - Task containers
   - Add task forms
   - Task action buttons

3. Task Cards
   - Priority indicators
   - Content area
   - Action buttons
   - Due date display

### Current Limitations
1. Limited task filtering options
2. No drag-and-drop functionality
3. Basic task categorization
4. Simple history tracking

## Future Enhancement Opportunities
1. Advanced filtering and sorting
2. Task categories and tags
3. Drag-and-drop between quadrants
4. Enhanced history features
5. Task analytics and reporting
6. User authentication system
7. Data export functionality
8. Mobile-optimized interface

## Goals Feature
The application includes a goals feature accessible from the sidebar, designed to help users set and track long-term objectives. This feature includes:

- **Goals List**: Displays all user-defined goals.
- **Add Goal Functionality**: Users can add new goals with a title and description.
- **Goal Cards**: Each goal is displayed in a card format with an icon and description.
- **User Interface**: Consistent with the overall design, using Bootstrap for layout and styling.

The goals feature provides a way to manage broader objectives alongside daily tasks, enhancing the application's utility for long-term planning.

## API Endpoints
The application provides several API endpoints to manage tasks and goals:

- **GET /api/tasks**: Retrieve all tasks.
- **POST /api/add-task**: Add a new task to a specific quadrant.
- **POST /api/complete-task/{task_id}**: Mark a task as completed.
- **POST /api/delete-task/{task_id}**: Delete a task.
- **POST /api/restore-task/{task_id}**: Restore a deleted task.
- **GET /api/completed-tasks**: Retrieve all completed tasks.
- **GET /api/deleted-tasks**: Retrieve all deleted tasks.
- **GET /api/goals**: Retrieve all goals.
- **POST /api/add-goal**: Add a new goal.

These endpoints facilitate the interaction between the frontend and backend, enabling dynamic task and goal management.

The current implementation provides a solid foundation for task management while maintaining simplicity and usability. The modular structure allows for easy feature additions and improvements. 



Running the app:

Navigate to Your Project Directory:

   cd "F:/Projects/personal project/To do list - V2"

Set the FLASK_APP environment variable correctly in Git Bash:

      export FLASK_APP=appV2.py

Verify the environment variable is set:

      echo $FLASK_APP


   python -m flask db init

   python -m flask db migrate

   python -m flask db upgrade

   python -m flask run