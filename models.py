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
    objectives = db.Column(db.Text, nullable=False)
    must_do = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    progress = db.Column(db.Integer, default=0)  # Overall progress percentage
    
    # Relationships
    works_well_items = db.relationship('WorksWellItem', backref='goal', lazy=True)
    needs_change_items = db.relationship('NeedsChangeItem', backref='goal', lazy=True)
    progress_updates = db.relationship('GoalProgress', backref='goal', lazy=True)
    checkins = db.relationship('DailyCheckin', backref='goal', lazy=True)

class WorksWellItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goal.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NeedsChangeItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goal.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GoalProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goal.id'), nullable=False)
    progress = db.Column(db.Integer, nullable=False)  # Progress percentage
    date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

class DailyCheckin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goal.id'), nullable=False)
    mood = db.Column(db.String(20), nullable=False)  # great, good, neutral, bad, terrible
    notes = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.utcnow)

class GoalAction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goal.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'works' or 'doesnt_work'
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)