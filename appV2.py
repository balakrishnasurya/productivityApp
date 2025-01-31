from flask import Flask, render_template, request, redirect, url_for, jsonify, Blueprint
from datetime import datetime
import os
from models import db, Task

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Delete the existing database file if it exists
#if os.path.exists('tasks.db'):
#    os.remove('tasks.db')

# Initialize the database with the app
db.init_app(app)

api = Blueprint('api', __name__)

@api.route('/api/completed-tasks', methods=['GET'])
def get_completed_tasks():
    tasks = Task.query.filter_by(completed=True, is_deleted=False).order_by(Task.completed_at.desc()).all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'quadrant': task.quadrant,
        'completed_at': task.completed_at.isoformat() if task.completed_at else None,
        'due_date': task.due_date.isoformat() if task.due_date else None
    } for task in tasks])

@api.route('/api/deleted-tasks', methods=['GET'])
def get_deleted_tasks():
    tasks = Task.query.filter_by(is_deleted=True).order_by(Task.deleted_at.desc()).all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'quadrant': task.quadrant,
        'deleted_at': task.deleted_at.isoformat() if task.deleted_at else None,
        'due_date': task.due_date.isoformat() if task.due_date else None
    } for task in tasks])

@api.route('/api/restore-task/<int:task_id>', methods=['POST'])
def restore_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.is_deleted = False
    task.deleted_at = None
    db.session.commit()
    return jsonify({'success': True})

@app.route('/')
def index():
    tasks = Task.query.order_by(Task.quadrant).all()
    return render_template('index.html', tasks=tasks)

@app.route('/add_task', methods=['POST'])
def add_task():
    title = request.form['title']
    description = request.form['description']
    quadrant = int(request.form['quadrant'])
    due_date_str = request.form.get('due_date')
    
    due_date = None
    if due_date_str:
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
    
    task = Task(title=title, description=description, quadrant=quadrant, due_date=due_date)
    db.session.add(task)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/toggle_task/<int:task_id>', methods=['POST'])
def toggle_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        task.completed = data.get('completed', False)
        
        if task.completed:
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None
            
        db.session.commit()
        return jsonify({
            'success': True,
            'task': {
                'id': task.id,
                'completed': task.completed,
                'completed_at': task.completed_at.isoformat() if task.completed_at else None
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/delete_task/<int:task_id>', methods=['POST'])
def delete_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        task.is_deleted = True
        task.deleted_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/completed-tasks', methods=['GET'])
def get_completed_tasks():
    tasks = Task.query.filter_by(completed=True, is_deleted=False).order_by(Task.completed_at.desc()).all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'quadrant': task.quadrant,
        'completed_at': task.completed_at.isoformat() if task.completed_at else None,
        'due_date': task.due_date.isoformat() if task.due_date else None
    } for task in tasks])

@app.route('/api/deleted-tasks', methods=['GET'])
def get_deleted_tasks():
    tasks = Task.query.filter_by(is_deleted=True).order_by(Task.deleted_at.desc()).all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'quadrant': task.quadrant,
        'deleted_at': task.deleted_at.isoformat() if task.deleted_at else None,
        'due_date': task.due_date.isoformat() if task.due_date else None
    } for task in tasks])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)