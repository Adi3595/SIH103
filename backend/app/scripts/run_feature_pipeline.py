import os
import pandas as pd
from sqlalchemy import create_engine
from app.core.database import DATABASE_URL
from app.ml.features.pipeline import generate_features

def run_pipeline():
    engine = create_engine(DATABASE_URL)
    
    print("Starting feature pipeline...")
    
    with engine.connect() as conn:
        # Get all project IDs
        project_ids_df = pd.read_sql("SELECT internal_project_id FROM projects", conn)
        all_ids = project_ids_df["internal_project_id"].tolist()
        
        # Clear the table first since we will append
        # Using if_exists='replace' in chunks is tricky, so we drop and let the first chunk create it
        # Actually, let's just let the first chunk 'replace' and subsequent 'append'
        
    chunk_size = 50
    first_chunk = True
    
    for i in range(0, len(all_ids), chunk_size):
        chunk_ids = all_ids[i:i+chunk_size]
        print(f"Processing chunk {i//chunk_size + 1}/{(len(all_ids) + chunk_size - 1)//chunk_size}...")
        
        # Query just this chunk
        chunk_ids_tuple = tuple(chunk_ids) if len(chunk_ids) > 1 else f"('{chunk_ids[0]}')"
        
        projects_query = f"SELECT * FROM projects WHERE internal_project_id IN {chunk_ids_tuple}"
        snapshots_query = f"SELECT * FROM project_snapshots WHERE internal_project_id IN {chunk_ids_tuple}"
        issues_query = f"SELECT * FROM issues WHERE internal_project_id IN {chunk_ids_tuple}"
        
        projects_df = pd.read_sql(projects_query, engine)
        snapshots_df = pd.read_sql(snapshots_query, engine)
        issues_df = pd.read_sql(issues_query, engine)
        
        if snapshots_df.empty:
            continue
            
        features_df = generate_features(projects_df, snapshots_df, issues_df)
        
        cols_to_keep = [
            "internal_project_id", "reporting_date",
            "progress_variance_pct", "progress_completion_ratio", "progress_velocity", "progress_acceleration",
            "expenditure_ratio", "monthly_expenditure_rate", "expenditure_growth",
            "cost_progress_divergence", "financial_physical_divergence",
            "schedule_progress_gap", "days_remaining", "time_overrun_days", "time_overrun_pct", "delay_momentum",
            "milestone_completion_ratio", "milestone_delay_rate",
            "issue_pressure", "risk_score", "risk_momentum"
        ]
        features_df = features_df[cols_to_keep]
        features_df = features_df.drop_duplicates(subset=["internal_project_id", "reporting_date"])
        
        # Clean nulls for psycopg3
        features_df = features_df.where(pd.notnull(features_df), None)
        
        # Write to DB
        mode = "replace" if first_chunk else "append"
        features_df.to_sql("project_features", engine, if_exists=mode, index=False)
        first_chunk = False
        
    print("Feature generation complete.")

if __name__ == "__main__":
    run_pipeline()
