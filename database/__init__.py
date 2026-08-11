"""
Campus Cognition V2 — Database Package
MongoDB-backed persistence layer using the Repository pattern.
"""

from .mongodb import get_db, health_check, init_indexes, close_connection
