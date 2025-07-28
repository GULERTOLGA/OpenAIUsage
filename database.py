import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

DATABASE_PATH = "users.db"


def init_database():
    """Initialize the database and create tables"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Create users table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Create index on username for faster lookups
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_username ON users(username)
        """
        )

        conn.commit()
        conn.close()

        # Create default admin user if it doesn't exist
        create_default_admin()

        logger.info("Database initialized successfully")

    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
        raise


def create_default_admin():
    """Create default admin user if it doesn't exist"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Check if admin user exists
        cursor.execute("SELECT id FROM users WHERE username = ?", ("admin",))
        admin_exists = cursor.fetchone()

        if not admin_exists:
            # Create default admin user
            admin_password_hash = generate_password_hash("admin")
            cursor.execute(
                """
                INSERT INTO users (first_name, last_name, username, password_hash, role)
                VALUES (?, ?, ?, ?, ?)
            """,
                ("Admin", "User", "admin", admin_password_hash, "admin"),
            )

            conn.commit()
            logger.info("Default admin user created")
        else:
            logger.info("Admin user already exists")

        conn.close()

    except Exception as e:
        logger.error(f"Error creating default admin: {str(e)}")
        raise


def get_user_by_username(username):
    """Get user by username"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, first_name, last_name, username, password_hash, role, created_at
            FROM users WHERE username = ?
        """,
            (username,),
        )

        user_data = cursor.fetchone()
        conn.close()

        if user_data:
            return {
                "id": user_data[0],
                "first_name": user_data[1],
                "last_name": user_data[2],
                "username": user_data[3],
                "password_hash": user_data[4],
                "role": user_data[5],
                "created_at": user_data[6],
            }
        return None

    except Exception as e:
        logger.error(f"Error getting user by username: {str(e)}")
        return None


def verify_user_credentials(username, password):
    """Verify user credentials"""
    try:
        user = get_user_by_username(username)
        if user and check_password_hash(user["password_hash"], password):
            return user
        return None

    except Exception as e:
        logger.error(f"Error verifying credentials: {str(e)}")
        return None


def get_all_users():
    """Get all users (for admin purposes)"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, first_name, last_name, username, role, created_at, updated_at
            FROM users ORDER BY created_at DESC
        """
        )

        users = []
        for row in cursor.fetchall():
            users.append(
                {
                    "id": row[0],
                    "first_name": row[1],
                    "last_name": row[2],
                    "username": row[3],
                    "role": row[4],
                    "created_at": row[5],
                    "updated_at": row[6],
                }
            )

        conn.close()
        return users

    except Exception as e:
        logger.error(f"Error getting all users: {str(e)}")
        return []


def create_user(first_name, last_name, username, password, role="user"):
    """Create a new user"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Check if username already exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            return False, "Username already exists"

        # Create new user
        password_hash = generate_password_hash(password)
        cursor.execute(
            """
            INSERT INTO users (first_name, last_name, username, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
        """,
            (first_name, last_name, username, password_hash, role),
        )

        conn.commit()
        conn.close()

        logger.info(f"User {username} created successfully")
        return True, "User created successfully"

    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return False, f"Error creating user: {str(e)}"


def update_user_password(user_id, new_password):
    """Update user password"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        password_hash = generate_password_hash(new_password)
        cursor.execute(
            """
            UPDATE users 
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """,
            (password_hash, user_id),
        )

        if cursor.rowcount == 0:
            conn.close()
            return False, "User not found"

        conn.commit()
        conn.close()

        logger.info(f"Password updated for user ID {user_id}")
        return True, "Password updated successfully"

    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        return False, f"Error updating password: {str(e)}"


def delete_user(user_id):
    """Delete a user"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

        if cursor.rowcount == 0:
            conn.close()
            return False, "User not found"

        conn.commit()
        conn.close()

        logger.info(f"User ID {user_id} deleted successfully")
        return True, "User deleted successfully"

    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return False, f"Error deleting user: {str(e)}"
