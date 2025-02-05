from flask import Flask, render_template, request, redirect, url_for, jsonify, Blueprint
from flask_migrate import Migrate
from datetime import datetime
import os
from models import db, Task, Goal

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Delete the existing database file if it exists
#if os.path.exists('tasks.db'):
#    os.remove('tasks.db')

# Initialize the database with the app
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

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

@app.route('/goals')
def goals():
    goals = Goal.query.order_by(Goal.deadline).all()
    return render_template('goals.html', goals=goals)

@app.route('/add_goal', methods=['POST'])
def add_goal():
    goal = Goal(
        title=request.form['title'],
        deadline=datetime.strptime(request.form['deadline'], '%Y-%m-%d'),
        objectives=request.form['objectives'],
        must_do=request.form['must_do'],
        progress=0.0
    )
    db.session.add(goal)
    db.session.commit()
    return redirect(url_for('goals'))

@api.route('/api/goals', methods=['GET'])
def get_goals():
    goals = Goal.query.order_by(Goal.deadline).all()
    return jsonify([{
        'id': goal.id,
        'title': goal.title,
        'deadline': goal.deadline.isoformat() if goal.deadline else None,
        'objectives': goal.objectives,
        'progress': goal.progress,
        'works_well': goal.works_well,
        'needs_change': goal.needs_change,
        'created_at': goal.created_at.isoformat()
    } for goal in goals])

@api.route('/api/goals', methods=['POST'])
def create_goal():
    data = request.get_json()
    goal = Goal(
        title=data['title'],
        deadline=datetime.fromisoformat(data['deadline']),
        objectives=data.get('objectives', {}),
        works_well=data.get('works_well', ''),
        needs_change=data.get('needs_change', '')
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({'success': True, 'id': goal.id})

@api.route('/api/goals/<int:goal_id>/progress', methods=['PUT'])
def update_goal_progress(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    data = request.get_json()
    goal.progress = data['progress']
    db.session.commit()
    return jsonify({'success': True})

# Register the blueprint
app.register_blueprint(api)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)