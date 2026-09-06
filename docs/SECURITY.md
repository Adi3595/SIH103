# PAIMANA: Security & Access Architecture

Since PAIMANA handles sensitive national infrastructure data and relies on LLMs for prescriptive policy generation, securing the platform is a top priority. 

---

## 1. Authentication & Authorization (RBAC)

The system enforces **Role-Based Access Control (RBAC)** to ensure users only see data they are authorized to view.

### JWT-based Authentication (OAuth2)
- The FastAPI backend implements `OAuth2PasswordBearer` with JSON Web Tokens (JWT).
- Access tokens expire every 30 minutes, requiring a silent refresh via an `httponly` secure refresh token cookie.

### Roles and Permissions
1. **Super Admin (e.g., MoSPI Secretary):** Has global visibility over all 750 projects across all ministries and states. Can view macroeconomic analytics.
2. **Ministry Nodal Officer (e.g., Road Transport Officer):** Can only view and search projects where `sector == "Roads"`. The `/api/projects` endpoint intercepts their JWT payload and automatically applies a `.filter(Project.sector == "Roads")` at the SQLAlchemy layer.
3. **State Chief Secretary:** Filtered geographically. Only sees projects where `state == "UserState"`.

---

## 2. API & Data Security

### SQL Injection Protection
All database queries are handled through **SQLAlchemy ORM**. The ORM automatically sanitizes inputs and uses parameterized queries, strictly preventing SQL injection attacks against the SQLite/PostgreSQL database.

### Pydantic Validation
FastAPI uses Pydantic models for all incoming and outgoing data. If an attacker attempts to send malformed data or unauthorized fields in a payload, Pydantic rejects the request with a `422 Unprocessable Entity` before it ever reaches the application logic.

### CORS & Rate Limiting
- **CORS Configuration:** The backend explicitly restricts Cross-Origin Resource Sharing (CORS) to the specific origin of the frontend (e.g., `http://localhost:5173` or the production domain).
- **Rate Limiting:** `slowapi` is implemented on endpoints like `/api/projects/{id}/prescription` to prevent abuse of the expensive OpenRouter LLM API.

---

## 3. Generative AI Security

Sending government data to an external LLM (Mistral/Claude via OpenRouter) introduces data privacy risks.

### Prompt Sanitization & PII Masking
Before the `PrescriptiveEngine` sends a prompt to OpenRouter, it strips any highly sensitive Personally Identifiable Information (PII) or exact GPS coordinates. The LLM only receives aggregated structural data (e.g., "Project ID: PAI-00001, Budget: 500Cr, Status: Delayed") rather than specific contractor names or banking details.

### System Prompt Enclosures
To prevent Prompt Injection (where a user tries to trick the AI into returning something else), the user input is strictly enclosed in XML-style tags, and the LLM is given a high-priority system instruction to *only* output markdown related to infrastructure policy.

---

## 4. Infrastructure Security (Production Deployment)

- **HTTPS/TLS:** All traffic between the React client and FastAPI server must be encrypted over TLS 1.3 using a reverse proxy like Nginx or Traefik.
- **Environment Variables:** Secrets (like `OPENROUTER_API_KEY` and JWT Signing Keys) are never committed to version control. They are injected via `.env` files or secure secret managers (e.g., AWS Secrets Manager).
