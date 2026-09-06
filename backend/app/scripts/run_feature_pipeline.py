import os
import pandas as pd
from sqlalchemy import create_engine
from app.core.database import DATABASE_URL
from app.ml.features.pipeline import generate_features

def run_pipeline():
    engine = create_engine(DATABASE_URL)
    
    print("Reading data from database...")
    projects_df = pd.read_sql_table("projects", engine)
    snapshots_df = pd.read_sql_table("project_snapshots", engine)
    issues_df = pd.read_sql_table("issues", engine)
    
    print("Generating features...")
    features_df = generate_features(projects_df, snapshots_df, issues_df)
    
    # Select only the columns needed for the project_features table
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
    
    # Drop duplicates just in case (should be unique by project + reporting_date)
    features_df = features_df.drop_duplicates(subset=["internal_project_id", "reporting_date"])
    
    print("Writing features to database...")
    # Replace the existing features (we can truncate and load for now)
    features_df.to_sql("project_features", engine, if_exists="replace", index=False)
    
    print("Feature generation complete.")

if __name__ == "__main__":
    run_pipeline()
