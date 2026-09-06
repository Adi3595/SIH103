import os
import joblib
import pandas as pd
from sqlalchemy.orm import Session
from app.models.feature import ProjectFeature
from typing import Dict, Any

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')

class PredictiveEngine:
    models = {}
    scalers = {}
    
    @classmethod
    def load_models(cls):
        if cls.models:
            return
        
        model_names = [
            'cost_overrun_model',
            'schedule_delay_model',
            'milestone_failure_model',
            'escalation_risk_model'
        ]
        
        for name in model_names:
            model_path = os.path.join(MODELS_DIR, f"{name}.pkl")
            scaler_path = os.path.join(MODELS_DIR, f"{name}_scaler.pkl")
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                import pickle
                with open(model_path, 'rb') as f:
                    cls.models[name] = pickle.load(f)
                with open(scaler_path, 'rb') as f:
                    cls.scalers[name] = pickle.load(f)
                
    @classmethod
    def predict(cls, db: Session, project_id: str) -> Dict[str, Any]:
        cls.load_models()
        
        feature = db.query(ProjectFeature).filter(ProjectFeature.internal_project_id == project_id).order_by(ProjectFeature.reporting_date.desc()).first()
        if not feature:
            return {"error": "No feature data found"}
            
        # Extract features for each model exactly as they were trained
        features_cost = ['expenditure_ratio', 'monthly_expenditure_rate', 'expenditure_growth', 'financial_physical_divergence', 'issue_pressure']
        features_schedule = ['progress_velocity', 'progress_acceleration', 'days_remaining', 'time_overrun_days', 'delay_momentum', 'schedule_progress_gap']
        features_milestone = ['schedule_progress_gap', 'delay_momentum', 'issue_pressure', 'milestone_delay_rate', 'progress_velocity']
        features_escalation = ['progress_acceleration', 'expenditure_growth', 'delay_momentum', 'risk_score', 'issue_pressure']
        
        def _get_vals(feat_list):
            return [getattr(feature, f) or 0.0 for f in feat_list]

        df_cost = pd.DataFrame([_get_vals(features_cost)], columns=features_cost)
        df_schedule = pd.DataFrame([_get_vals(features_schedule)], columns=features_schedule)
        df_milestone = pd.DataFrame([_get_vals(features_milestone)], columns=features_milestone)
        df_escalation = pd.DataFrame([_get_vals(features_escalation)], columns=features_escalation)
        
        results = {}
        
        def _predict_prob(name, df):
            if name not in cls.models:
                return 0.0
            X_scaled = cls.scalers[name].transform(df)
            probs = cls.models[name].predict_proba(X_scaled)[0]
            # Prob of class 1 (True)
            return round(probs[1] * 100, 1) if len(probs) > 1 else 0.0
            
        results['cost_overrun_prob'] = _predict_prob('cost_overrun_model', df_cost)
        results['schedule_delay_prob'] = _predict_prob('schedule_delay_model', df_schedule)
        results['milestone_failure_prob'] = _predict_prob('milestone_failure_model', df_milestone)
        results['escalation_risk_prob'] = _predict_prob('escalation_risk_model', df_escalation)
        
        return results
