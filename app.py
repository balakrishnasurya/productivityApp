from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import os
from models import db, Task

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the app
db.init_app(app)

# API endpoints
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()
        return jsonify([{
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'quadrant': task.quadrant,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'completed': task.completed,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat()
        } for task in tasks])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('quadrant'):
            return jsonify({'error': 'Title and quadrant are required'}), 400
            
        # Parse due date if provided
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'])
            except ValueError:
                return jsonify({'error': 'Invalid due date format'}), 400
        
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            quadrant=int(data['quadrant']),
            due_date=due_date
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'quadrant': task.quadrant,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'completed': task.completed,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'quadrant' in data:
            task.quadrant = int(data['quadrant'])
        if 'completed' in data:
            task.completed = bool(data['completed'])
        if 'due_date' in data:
            task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
            
        db.session.commit()
        
        return jsonify({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'quadrant': task.quadrant,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'completed': task.completed,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Main route
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
