from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    quadrant = db.Column(db.Integer, nullable=False)  # 1-4
    due_date = db.Column(db.DateTime)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    is_deleted = db.Column(db.Boolean, default=False)
    deleted_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    objectives = db.Column(db.Text)
    must_do = db.Column(db.Text)  # Add this field
    progress = db.Column(db.Float, default=0.0)
    works_well = db.Column(db.Text)
    needs_change = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Association table for Goal-Task relationship
goal_tasks = db.Table('goal_tasks',
    db.Column('goal_id', db.Integer, db.ForeignKey('goal.id')),
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'))
)