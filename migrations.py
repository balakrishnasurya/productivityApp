from models import db
from datetime import datetime

def add_history_columns():
    # Get database connection
    conn = db.engine.connect()
    
    # Add completed_at column
    conn.execute('ALTER TABLE task ADD COLUMN completed_at DATETIME;')
    
    # Add is_deleted column with default value
    conn.execute('ALTER TABLE task ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;')
    
    # Add deleted_at column
    conn.execute('ALTER TABLE task ADD COLUMN deleted_at DATETIME;')
    
    # Commit the transaction
    conn.execute('COMMIT;')
    conn.close()

if __name__ == '__main__':
    add_history_columns() 