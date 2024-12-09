# Four Quadrants Task Management Application

## Project Overview
This project is a task management web application based on Stephen Covey's Time Management Matrix. It implements a four-quadrant system for task prioritization, helping users manage their tasks effectively by categorizing them based on urgency and importance.

## Features
- **Task Management**: Add, edit, delete, and mark tasks as complete.
- **Quadrant View**: Organize tasks into a four-quadrant layout for better visibility.
- **List View**: View all tasks in a list format.
- **Due Date Support**: Assign due dates to tasks and display them accordingly.
- **Responsive Design**: The application is designed to work well on various screen sizes.

## Technical Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Bootstrap
- **Backend**: Python, Flask, SQLAlchemy
- **Database**: SQLite

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
1. Run the application:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to `http://localhost:5000` to access the application.

## API Endpoints
- **GET /api/tasks**: Retrieve all tasks.
- **POST /api/tasks**: Create a new task.
- **PUT /api/tasks/<task_id>**: Update an existing task.
- **DELETE /api/tasks/<task_id>**: Delete a task.

## Future Enhancements
- User authentication
- Task categories/tags
- Advanced filtering and sorting options
- Collaboration features

## License
This project is licensed under the MIT License.

## Acknowledgments
- Inspired by Stephen Covey's Time Management Matrix.
- Special thanks to the open-source community for their contributions.
