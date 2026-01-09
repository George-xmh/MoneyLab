"""
Database setup script
"""
import os
from dotenv import load_dotenv
from app import create_app, db
from app.models import User, Portfolio, Asset, AssetAllocation

load_dotenv()

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    print("Database tables created successfully!")
    print("\nTables created:")
    print("- users")
    print("- portfolios")
    print("- assets")
    print("- asset_allocations")
