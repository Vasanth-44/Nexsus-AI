import sqlite3

DB_NAME = "nexus.db"


def get_connection():
    return sqlite3.connect(DB_NAME)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skills (
            user_id TEXT,
            skill TEXT,
            progress INTEGER,
            status TEXT,
            PRIMARY KEY (user_id, skill)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            user_id TEXT,
            project TEXT,
            progress INTEGER,
            status TEXT,
            PRIMARY KEY (user_id, project)
        )
    """)

    conn.commit()
    conn.close()