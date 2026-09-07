import os
import requests
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.feature import ProjectFeature
from app.ml.risk_engine.engine import RiskEngine
from app.ml.risk_engine.momentum import compute_momentum_report

class PrescriptiveEngine:
    @staticmethod
    def generate_prescription(db: Session, project_id: str, query: str = None) -> dict:
        project = db.query(Project).filter(Project.internal_project_id == project_id).first()
        if not project:
            return {"error": "Project not found"}
        
        feature = db.query(ProjectFeature).filter(ProjectFeature.internal_project_id == project.internal_project_id).order_by(ProjectFeature.reporting_date.desc()).first()
        if not feature:
            return {"error": "No data found for project"}

        fingerprint = RiskEngine.generate_fingerprint(feature)
        momentum = compute_momentum_report(project_id, db)
        
        risk_level = "Critical" if feature.risk_score >= 7.5 else "High" if feature.risk_score >= 5.0 else "Medium" if feature.risk_score >= 2.5 else "Low"

        # Build Context
        context = f"""
        You are PAIMANA, an elite AI Infrastructure Risk Advisor.
        Analyze this government infrastructure project and provide a strategic intervention plan.
        
        PROJECT CONTEXT:
        - ID: {project.internal_project_id}
        - Name: {project.project_name}
        - Sector: {project.sector}
        - State: {project.state}
        - Cost: INR {project.revised_cost_cr} Cr
        - Target: {project.revised_end_date}
        - Overall Risk Score: {feature.risk_score}/100
        - Risk Level: {risk_level}
        
        DIGITAL FINGERPRINT (0-100%, lower is worse):
        - Progress Health: {fingerprint['progress_health']}%
        - Financial Health: {fingerprint['financial_health']}%
        - Schedule Health: {fingerprint['schedule_health']}%
        
        MOMENTUM (Last 3 Months):
        - Score Change: {momentum.get('overall_momentum', 0)}
        - Verdict: {momentum.get('overall_classification', {}).get('description', 'Stable')}
        """

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            if query:
                return {"prescription": f"⚠️ GEMINI_API_KEY missing. \n\n**Mock Answer to '{query}':**\n\nThe budget overrun is primarily driven by recent material inflation and an ongoing land acquisition delay in Sector 4."}
            return {
                "prescription": "⚠️ GEMINI_API_KEY not found in environment. \n\n**Mock Prescription:**\n\n1. **Financial Audit:** Conduct immediate review of expenditure variance.\n2. **Schedule Compression:** Accelerate critical path activities to offset the delay momentum.\n3. **Land Acquisition:** Resolve pending clearances in sector 4 to unblock physical progress."
            }

        try:
            user_msg = ""
            if query:
                user_msg = f"{context}\n\nUSER QUERY: {query}\n\nAnswer the user's query specifically using the project context. Be concise and professional."
            else:
                user_msg = f"{context}\n\nProvide a 3-point action plan to mitigate the risks. Format using markdown. Be extremely concise and professional."
                
            system_prompt = "You are a highly analytical AI that provides concise, actionable, and structured markdown reports for infrastructure risk. Use bolding and bullet points.\n\n"
            
            payload = {
                "contents": [{
                    "parts": [{"text": system_prompt + user_msg}]
                }]
            }
            
            headers = {"Content-Type": "application/json"}
            
            requested_models = ["gemini-2.5-flash", "gemini-3.0-flash", "gemini-3.5-flash"]
            last_err = ""
            
            for model_id in requested_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"
                resp = requests.post(url, headers=headers, json=payload, timeout=25)
                
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {"prescription": content}
                else:
                    last_err = f"{resp.status_code} - {resp.text}"
                    
            return {"prescription": f"⚠️ Gemini API Failed after trying all requested models. Last error: {last_err}"}
                
        except Exception as e:
            return {"prescription": f"⚠️ Error connecting to Gemini API: {str(e)}"}
