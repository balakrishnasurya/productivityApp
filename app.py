from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import os
from models import db, Task

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Delete the existing database file if it exists
if os.path.exists('tasks.db'):
    os.remove('tasks.db')

# Initialize the database with the app
db.init_app(app)

@app.route('/')
def index():
    tasks = Task.query.all()
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
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    task.completed = data.get('completed', False)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
