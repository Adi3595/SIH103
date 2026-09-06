import pandas as pd
import numpy as np

def calculate_progress_features(df: pd.DataFrame) -> pd.DataFrame:
    # Physical vs Planned
    df["progress_variance_pct"] = df["physical_progress_pct"] - df["planned_progress_pct"]
    df["progress_completion_ratio"] = np.where(
        df["planned_progress_pct"] > 0,
        df["physical_progress_pct"] / df["planned_progress_pct"],
        np.nan
    )
    
    # Velocity: difference from previous reporting date
    # Requires dataframe sorted by reporting_date per project
    df["progress_velocity"] = df.groupby("internal_project_id")["physical_progress_pct"].diff()
    # For the first snapshot, velocity is just the progress itself (or 0 if not started)
    df["progress_velocity"] = df["progress_velocity"].fillna(df["physical_progress_pct"])
    
    # Acceleration
    df["progress_acceleration"] = df.groupby("internal_project_id")["progress_velocity"].diff()
    df["progress_acceleration"] = df["progress_acceleration"].fillna(0)
    
    return df

def calculate_financial_features(df: pd.DataFrame) -> pd.DataFrame:
    # Expenditure ratio
    df["expenditure_ratio"] = np.where(
        df["revised_cost_cr"] > 0,
        df["cumulative_expenditure_cr"] / df["revised_cost_cr"],
        np.nan
    )
    
    # Monthly expenditure rate
    df["monthly_expenditure_rate"] = df.groupby("internal_project_id")["cumulative_expenditure_cr"].diff()
    df["monthly_expenditure_rate"] = df["monthly_expenditure_rate"].fillna(df["cumulative_expenditure_cr"])
    
    # Expenditure growth
    # Handle zeros in denominator
    prev_expenditure = df.groupby("internal_project_id")["monthly_expenditure_rate"].shift(1)
    df["expenditure_growth"] = np.where(
        prev_expenditure > 0,
        (df["monthly_expenditure_rate"] - prev_expenditure) / prev_expenditure,
        np.nan
    )
    
    # Financial Physical Divergence
    financial_completion_pct = df["expenditure_ratio"] * 100
    df["financial_physical_divergence"] = financial_completion_pct - df["physical_progress_pct"]
    
    # Cost Progress Divergence (Alternative measure)
    df["cost_progress_divergence"] = df["financial_physical_divergence"]
    
    return df

def calculate_schedule_features(df: pd.DataFrame) -> pd.DataFrame:
    # Assuming start_date, revised_end_date, original_end_date are datetime and available in df
    df["reporting_date"] = pd.to_datetime(df["reporting_date"])
    df["start_date"] = pd.to_datetime(df["start_date"])
    df["revised_end_date"] = pd.to_datetime(df["revised_end_date"])
    df["original_end_date"] = pd.to_datetime(df["original_end_date"])
    
    # Total revised duration
    total_duration = (df["revised_end_date"] - df["start_date"]).dt.days
    elapsed_duration = (df["reporting_date"] - df["start_date"]).dt.days
    
    expected_progress_pct = np.where(
        total_duration > 0,
        (elapsed_duration / total_duration) * 100,
        0
    )
    # Cap at 100%
    expected_progress_pct = np.clip(expected_progress_pct, 0, 100)
    
    df["schedule_progress_gap"] = df["physical_progress_pct"] - expected_progress_pct
    df["days_remaining"] = (df["revised_end_date"] - df["reporting_date"]).dt.days
    
    df["time_overrun_days"] = (df["revised_end_date"] - df["original_end_date"]).dt.days
    original_duration = (df["original_end_date"] - df["start_date"]).dt.days
    df["time_overrun_pct"] = np.where(
        original_duration > 0,
        df["time_overrun_days"] / original_duration,
        0
    )
    
    # Delay momentum: is delay increasing?
    df["delay_momentum"] = df.groupby("internal_project_id")["delay_days"].diff()
    df["delay_momentum"] = df["delay_momentum"].fillna(0)
    
    return df

def calculate_milestone_features(df: pd.DataFrame) -> pd.DataFrame:
    df["milestone_completion_ratio"] = np.where(
        df["milestones_planned"] > 0,
        df["milestones_completed"] / df["milestones_planned"],
        np.nan
    )
    # Milestone delay rate: not strictly in snapshots, but can be derived from delay_days
    # For now, approximate using delay momentum / planned milestones
    df["milestone_delay_rate"] = np.where(
        df["milestones_planned"] > 0,
        df["delay_days"] / df["milestones_planned"],
        0
    )
    return df

def calculate_issue_pressure(issues_df: pd.DataFrame) -> pd.DataFrame:
    # issue severity mapping
    severity_weights = {"LOW": 1, "MEDIUM": 3, "HIGH": 6, "CRITICAL": 10}
    status_weights = {"OPEN": 1, "IN_PROGRESS": 0.8, "RESOLVED": 0.2, "CLOSED": 0}
    
    issues_df["severity_weight"] = issues_df["severity"].map(severity_weights).fillna(1)
    issues_df["status_weight"] = issues_df["issue_status"].map(status_weights).fillna(1)
    issues_df["pressure_contribution"] = issues_df["severity_weight"] * issues_df["status_weight"]
    
    # Group by project and reporting_date
    pressure_df = issues_df.groupby(["internal_project_id", "reporting_date"])["pressure_contribution"].sum().reset_index()
    pressure_df.rename(columns={"pressure_contribution": "issue_pressure"}, inplace=True)
    return pressure_df

def calculate_risk_momentum(df: pd.DataFrame) -> pd.DataFrame:
    # Baseline risk score based on available features
    # Higher score = higher risk
    
    # Negative progress gap means behind schedule -> higher risk
    schedule_risk = np.clip(-df["schedule_progress_gap"], 0, 100)
    # Positive financial divergence means spent more than physical -> higher risk
    financial_risk = np.clip(df["financial_physical_divergence"], 0, 100)
    
    # Normalize issue pressure
    issue_risk = np.clip(df["issue_pressure"].fillna(0) * 2, 0, 100) # Arbitrary multiplier for baseline
    
    # Time overrun risk
    time_risk = np.clip(df["time_overrun_pct"].fillna(0) * 100, 0, 100)
    
    df["risk_score"] = (schedule_risk * 0.3) + (financial_risk * 0.3) + (issue_risk * 0.2) + (time_risk * 0.2)
    
    # Momentum
    df["risk_momentum"] = df.groupby("internal_project_id")["risk_score"].diff()
    df["risk_momentum"] = df["risk_momentum"].fillna(0)
    
    return df

def generate_features(projects_df: pd.DataFrame, snapshots_df: pd.DataFrame, issues_df: pd.DataFrame) -> pd.DataFrame:
    # Ensure sorted by date to prevent temporal leakage in diff/shift
    snapshots_df["reporting_date"] = pd.to_datetime(snapshots_df["reporting_date"])
    snapshots_df = snapshots_df.sort_values(by=["internal_project_id", "reporting_date"])
    
    # Merge project static data
    df = pd.merge(snapshots_df, projects_df, on="internal_project_id", how="left")
    
    # Calculate issue pressure and merge
    issues_df["reporting_date"] = pd.to_datetime(issues_df["reporting_date"])
    pressure_df = calculate_issue_pressure(issues_df)
    df = pd.merge(df, pressure_df, on=["internal_project_id", "reporting_date"], how="left")
    df["issue_pressure"] = df["issue_pressure"].fillna(0)
    
    # Calculate features sequentially
    df = calculate_progress_features(df)
    df = calculate_financial_features(df)
    df = calculate_schedule_features(df)
    df = calculate_milestone_features(df)
    df = calculate_risk_momentum(df)
    
    return df
