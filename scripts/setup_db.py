"""
Campus Cognition V2 — Manual Database Setup
Run this script locally to initialize MongoDB indexes and seed sample data.
Do not run this automatically on Vercel deployment.
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path so we can import application modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.mongodb import init_indexes
from database.repositories.opportunity_repository import insert_sample_opportunities
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('setup_db')

def setup_database():
    logger.info("Starting database initialization...")
    
    try:
        logger.info("Initializing indexes...")
        init_indexes()
        logger.info("Indexes initialized successfully.")
        
        logger.info("Inserting sample opportunities...")
        insert_sample_opportunities()
        logger.info("Sample opportunities inserted successfully.")
        
        logger.info("Database setup complete.")
    except Exception as e:
        logger.error(f"Database setup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    setup_database()
