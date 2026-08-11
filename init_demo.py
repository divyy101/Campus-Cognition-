"""
Campus Cognition V2 - Demo Data Initialization Script (MongoDB Atlas version)
Creates sample users and opportunities for testing in MongoDB.
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.mongodb import init_indexes
from database.repositories.user_repository import create_user, get_user_by_username
from database.repositories.opportunity_repository import insert_sample_opportunities, get_all_opportunities

def create_demo_users():
    """Create demo users for testing in MongoDB"""
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
        # Check if already exists
        existing = get_user_by_username(user['username'])
        if existing:
            print(f"[INFO] User already exists: {user['username']}")
            continue
            
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
            print(f"[ERROR] Failed to create user: {user['username']}")
 
def main():
    print("=" * 50)
    print("Campus Cognition V2 - Demo Data Initialization")
    print("=" * 50)
    print()
    
    # Initialize MongoDB collections and indexes
    print("[DB] Initializing MongoDB indexes...")
    init_indexes()
    print("[DB] MongoDB indexes initialized")
    print()
    
    # Create demo users
    print("[USERS] Creating demo users...")
    create_demo_users()
    print()
    
    # Insert sample opportunities
    print("[OPPS] Inserting sample opportunities...")
    insert_sample_opportunities()
    opportunities = get_all_opportunities()
    print(f"[OPPS] {len(opportunities)} opportunities in database")
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
