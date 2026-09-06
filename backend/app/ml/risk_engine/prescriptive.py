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
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            return {"error": "Project not found"}
        
        feature = db.query(ProjectFeature).filter(ProjectFeature.internal_project_id == project.internal_project_id).order_by(ProjectFeature.reporting_date.desc()).first()
        if not feature:
            return {"error": "No data found for project"}

        fingerprint = RiskEngine.generate_fingerprint(feature)
        momentum = compute_momentum_report(project_id, db)

        # Build Context
        context = f"""
        You are PAIMANA, an elite AI Infrastructure Risk Advisor.
        Analyze this government infrastructure project and provide a strategic intervention plan.
        
        PROJECT CONTEXT:
        - ID: {project.project_id}
        - Name: {project.project_name}
        - Sector: {project.sector}
        - State: {project.state}
        - Cost: INR {project.revised_cost_cr} Cr
        - Target: {project.revised_end_date}
        - Overall Risk Score: {feature.risk_score}/10
        - Risk State: {project.project_state}
        - Risk Level: {project.risk_level}
        
        DIGITAL FINGERPRINT (0-100%, lower is worse):
        - Progress Health: {fingerprint['progress_health']}%
        - Financial Health: {fingerprint['financial_health']}%
        - Schedule Health: {fingerprint['schedule_health']}%
        
        MOMENTUM (Last 3 Months):
        - Score Change: {momentum.get('overall_momentum', 0)}
        - Verdict: {momentum.get('overall_classification', {}).get('description', 'Stable')}
        """

        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            if query:
                return {"prescription": f"⚠️ OpenRouter API Key missing. \n\n**Mock Answer to '{query}':**\n\nThe budget overrun is primarily driven by recent material inflation and an ongoing land acquisition delay in Sector 4."}
            return {
                "prescription": "⚠️ OpenRouter API Key not found in environment. \n\n**Mock Prescription:**\n\n1. **Financial Audit:** Conduct immediate review of expenditure variance.\n2. **Schedule Compression:** Accelerate critical path activities to offset the delay momentum.\n3. **Land Acquisition:** Resolve pending clearances in sector 4 to unblock physical progress."
            }

        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            user_msg = ""
            if query:
                user_msg = f"{context}\n\nUSER QUERY: {query}\n\nAnswer the user's query specifically using the project context. Be concise and professional."
            else:
                user_msg = f"{context}\n\nProvide a 3-point action plan to mitigate the risks. Format using markdown. Be extremely concise and professional."
                
            payload = {
                "model": "meta-llama/llama-3-8b-instruct:free",
                "messages": [
                    {"role": "system", "content": "You are a highly analytical AI that provides concise, actionable, and structured markdown reports for infrastructure risk. Use bolding and bullet points."},
                    {"role": "user", "content": user_msg}
                ]
            }
            resp = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=15)
            
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return {"prescription": content}
            else:
                return {"prescription": f"⚠️ LLM Generation Failed: {resp.status_code} - {resp.text}"}
                
        except Exception as e:
            return {"prescription": f"⚠️ Error connecting to OpenRouter: {str(e)}"}
