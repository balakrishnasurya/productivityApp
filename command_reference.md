# Development Commands Reference

## Flask Commands

### Basic Flask Commands
```bash
# Start Flask development server
flask run

# Run with debug mode
flask --debug run

# Set environment variables
set FLASK_APP=app.py
set FLASK_ENV=development
```

### Flask Database Commands
```bash
# Initialize database
flask db init

# Create migration
flask db migrate -m "migration message"

# Apply migration
flask db upgrade

# Rollback migration
flask db downgrade
```

## Git Commands

### Basic Git Operations
```bash
# Initialize repository
git init

# Clone repository
git clone <repository-url>

# Check status
git status

# Add files
git add <filename>
git add .  # add all files

# Commit changes
git commit -m "commit message"
```

### Advanced Git Commands
```bash
# Switch to specific commit
git checkout <commit-hash>

# Create and switch to new branch
git checkout -b <branch-name>

# Merge branches
git merge <branch-name>

# Resolve merge conflicts
git merge --abort  # abort merge
git reset --hard HEAD  # reset to last commit

# Remote operations
git remote add origin <repository-url>
git push -u origin <branch-name>
git pull origin <branch-name>
```

## Git History Management

### Reset and Force Push
```bash
# Reset to specific commit
git reset --hard <commit-hash>
```

Theory:
- `git reset --hard` resets both working directory and staging area to match the specified commit
- All commits after the specified hash will be removed from local history
- Use with caution as this operation cannot be undone
- Commonly used when you want to completely abandon changes and return to a known good state

```bash
# Force push to remote
git push -f origin <branch-name>
git push -f origin master
```

Theory:
- Force push overwrites remote history with your local history
- Use when your local and remote histories have diverged and you want remote to match local
- Very dangerous in shared repositories as it can erase other people's commits
- Best practices:
  - Only force push to branches you exclusively own
  - Communicate with team members before force pushing
  - Consider using `--force-with-lease` for safer force pushes

### Best Practices for History Management
1. Create backups before major history changes
2. Communicate with team members when modifying shared history
3. Use `git reflog` to recover if mistakes happen
4. Prefer `git revert` for shared repositories instead of `reset`

## Database Commands

### SQLite
```bash
# Access SQLite console
sqlite3 <database-name>

# Basic queries
.tables  # show all tables
.schema <table-name>  # show table schema
```

### PostgreSQL
```bash
# Access PostgreSQL console
psql -U <username> -d <database-name>

# Common commands
\l  # list databases
\dt  # list tables
\d <table-name>  # describe table
```

## Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

# Deactivate virtual environment
deactivate

# Install requirements
pip install -r requirements.txt

# Generate requirements file
pip freeze > requirements.txt
```

## Troubleshooting Tips

### Common Issues
1. Flask app not found
   ```bash
   # Solution:
   set FLASK_APP=app.py
   ```

2. Database migration errors
   ```bash
   # Solution:
   flask db stamp head  # reset migration head
   flask db migrate  # create new migration
   ```

3. Git merge conflicts
   ```bash
   # Solution:
   git status  # check conflicting files
   # Edit files manually
   git add .
   git commit -m "resolved conflicts"
   ```

---
Note: Keep updating this file with new commands and solutions as you learn them.

To update your requirements, run this command in your terminal:
pip freeze > requirements.txt