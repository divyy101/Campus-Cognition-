"""
Campus Cognition - Demo Data Initialization Script
Creates sample users and opportunities for testing
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'database'))

from models import (
    init_db, create_user, insert_sample_opportunities,
    get_all_opportunities
)

def create_demo_users():
    """Create demo users for testing"""
    demo_users = [
        {
            'username': 'student1',
            'email': 'student1@example.com',
            'password': 'password123',
            'first_name': 'Raj',
            'last_name': 'Kumar'
        },
        {
            'username': 'student2',
            'email': 'student2@example.com',
            'password': 'password123',
            'first_name': 'Priya',
            'last_name': 'Singh'
        },
        {
            'username': 'student3',
            'email': 'student3@example.com',
            'password': 'password123',
            'first_name': 'Arjun',
            'last_name': 'Patel'
        }
    ]
    
    for user in demo_users:
        user_id = create_user(
            user['username'],
            user['email'],
            user['password'],
            user['first_name'],
            user['last_name']
        )
        if user_id:
            print(f"[OK] Created user: {user['username']}")
        else:
            print(f"[INFO] User already exists: {user['username']}")
 
def main():
    print("=" * 50)
    print("Campus Cognition - Demo Data Initialization")
    print("=" * 50)
    print()
    
    # Initialize database
    print("[DB] Initializing database...")
    init_db()
    print("[DB] Database initialized")
    print()
    
    # Create demo users
    print("[USERS] Creating demo users...")
    create_demo_users()
    print()
    
    # Insert sample opportunities
    print("[OPPS] Inserting sample opportunities...")
    insert_sample_opportunities()
    opportunities = get_all_opportunities()
    print(f"[OPPS] {len(opportunities)} opportunities added")
    print()
    
    print("=" * 50)
    print("Demo setup complete!")
    print("=" * 50)
    print()
    print("Demo Credentials:")
    print("  Username: student1")
    print("  Password: password123")
    print()
    print("You can also create your own account using the signup page.")

if __name__ == '__main__':
    main()
