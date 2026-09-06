import os
import pandas as pd
from sqlalchemy import create_engine
from app.core.database import DATABASE_URL

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../SIH26103_synthetic_data"))

def load_data():
    engine = create_engine(DATABASE_URL)
    
    # Files to load
    files = [
        ("D01_projects.csv", "projects"),
        ("D02_project_snapshots.csv", "project_snapshots"),
        ("D03_milestones.csv", "milestones"),
        ("D04_issues.csv", "issues")
    ]
    
    for filename, table_name in files:
        file_path = os.path.join(DATA_DIR, filename)
        if os.path.exists(file_path):
            print(f"Loading {filename} into {table_name}...")
            df = pd.read_csv(file_path)
            # Handle date parsing if needed, but pd.to_sql often handles strings gracefully 
            # if the DB schema is defined correctly.
            df.to_sql(table_name, engine, if_exists="append", index=False)
            print(f"Successfully loaded {filename}.")
        else:
            print(f"Warning: {filename} not found.")

if __name__ == "__main__":
    print("Starting data load...")
    load_data()
    print("Data load complete.")
