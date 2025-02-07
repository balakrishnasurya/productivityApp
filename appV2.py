from flask import Flask, render_template, request, redirect, url_for, jsonify, Blueprint
from datetime import datetime
import os
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, Task, Goal, GoalAction, WorksWellItem, NeedsChangeItem

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Delete the existing database file if it exists
#if os.path.exists('tasks.db'):
#    os.remove('tasks.db')

# Initialize the db with the app
db.init_app(app)
migrate = Migrate(app, db, directory='migrations')

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

@app.route('/api/goals/<int:goal_id>')
def get_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    return jsonify({
        'id': goal.id,
        'title': goal.title,
        'deadline': goal.deadline.isoformat(),
        'objectives': goal.objectives,
        'must_do': goal.must_do,
        'created_at': goal.created_at.isoformat(),
        'last_updated': goal.last_updated.isoformat()
    })

@app.route('/api/goals/<int:goal_id>/works-well')
def get_works_well(goal_id):
    items = WorksWellItem.query.filter_by(goal_id=goal_id).order_by(WorksWellItem.created_at.desc()).all()
    return jsonify([{
        'id': item.id,
        'description': item.description,
        'created_at': item.created_at.isoformat()
    } for item in items])

@app.route('/api/goals/<int:goal_id>/needs-change')
def get_needs_change(goal_id):
    items = NeedsChangeItem.query.filter_by(goal_id=goal_id).order_by(NeedsChangeItem.created_at.desc()).all()
    return jsonify([{
        'id': item.id,
        'description': item.description,
        'created_at': item.created_at.isoformat()
    } for item in items])

@app.route('/api/goals/<int:goal_id>/<string:list_type>', methods=['POST'])
def add_list_item(goal_id, list_type):
    data = request.get_json()
    if list_type == 'worksWell':
        item = WorksWellItem(goal_id=goal_id, description=data['description'])
    else:
        item = NeedsChangeItem(goal_id=goal_id, description=data['description'])
    
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})

@app.route('/api/goals/<int:goal_id>/<string:list_type>/<int:item_id>', methods=['DELETE'])
def delete_list_item(goal_id, list_type, item_id):
    if list_type == 'worksWell':
        item = WorksWellItem.query.get_or_404(item_id)
    else:
        item = NeedsChangeItem.query.get_or_404(item_id)
    
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/goals')
def goals():
    return render_template('goals.html')

@app.route('/goals/<int:goal_id>')
def goal_detail(goal_id):
    return render_template('goal_detail.html')

@app.route('/api/goals', methods=['GET'])
def get_goals():
    goals = Goal.query.order_by(Goal.created_at.desc()).all()
    return jsonify([{
        'id': goal.id,
        'title': goal.title,
        'deadline': goal.deadline.isoformat(),
        'objectives': goal.objectives,
        'must_do': goal.must_do,
        'created_at': goal.created_at.isoformat()
    } for goal in goals])

@app.route('/api/goals', methods=['POST'])
def add_goal():
    data = request.get_json()
    goal = Goal(
        title=data['title'],
        deadline=datetime.fromisoformat(data['deadline']),
        objectives=data['objectives'],
        must_do=data['mustDo']
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({'success': True, 'id': goal.id})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)