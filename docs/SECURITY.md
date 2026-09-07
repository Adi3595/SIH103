# Security Architecture — Nirikshan

> SIH 2026 · Problem Statement 26103

This document describes all security measures implemented across the Nirikshan platform.

---

## Overview

Security is implemented at three layers: **CDN/Edge (Vercel)**, **Application (FastAPI)**, and **Data (SQLAlchemy/PostgreSQL)**.

---

## 1. CDN / Edge Security (Vercel)

Configured in [`frontend/vercel.json`](../frontend/vercel.json).

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-sniffing attacks |
| `X-Frame-Options` | `DENY` | Blocks clickjacking via iframes |
| `X-XSS-Protection` | `1; mode=block` | Browser-level XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits data in referrer headers |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disables sensitive browser APIs |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS for 1 year |
| `Content-Security-Policy` | See below | Whitelist-based resource control |
| `Cache-Control` (assets) | `public, max-age=31536000, immutable` | Secure aggressive asset caching |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob:;
connect-src 'self' https://sih103.onrender.com;
frame-ancestors 'none';
```

- **`connect-src`** only allows API calls to `sih103.onrender.com` — no data exfiltration to unknown hosts
- **`frame-ancestors 'none'`** is a CSP-level `X-Frame-Options: DENY` replacement

---

## 2. API Layer Security (FastAPI)

Configured in [`backend/app/main.py`](../backend/app/main.py).

### Rate Limiting (`slowapi`)

```python
Limiter(key_func=get_remote_address, default_limits=["200/minute"])
```

- **Global limit**: 200 requests/minute per IP address
- **Root endpoint**: 30 requests/minute
- Returns `HTTP 429 Too Many Requests` on violation

### Security Response Headers

Applied via `SecurityHeadersMiddleware` to **every response**:

```python
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cache-Control: no-store
```

### Server Fingerprint Removal

The `Server` header is removed from every response to prevent attackers from identifying the underlying web server version.

### CORS Policy

```python
allow_origins=[
    "https://nirikshan103.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
allow_methods=["GET", "POST", "PUT", "DELETE"]
allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
```

- No wildcard `*` origins — only our known frontend domains
- Methods explicitly allowlisted — no OPTIONS abuse

---

## 3. Data Layer Security

### SQL Injection Prevention

All database queries use **SQLAlchemy ORM** with parameterised queries. No raw SQL string interpolation exists in the codebase. Example:

```python
# Safe — SQLAlchemy binds parameters automatically
db.query(Project).filter(Project.id == project_id).first()
```

### Secrets Management

- All secrets (`DATABASE_URL`, `GEMINI_API_KEY`) are stored as **environment variables** on Render
- `.env` files are in `.gitignore` and are **never committed to git**
- `.env.example` files contain only placeholder values

### Database

- **Supabase PostgreSQL** is used in production — managed, encrypted at rest, with automated backups
- Connection uses SSL by default via Supabase connection strings

---

## Threat Model Summary

| Threat | Mitigation |
|--------|------------|
| XSS | CSP + X-XSS-Protection + `nosniff` |
| Clickjacking | X-Frame-Options: DENY + CSP frame-ancestors |
| CSRF | CORS allowlist + explicit method restrictions |
| SQL Injection | SQLAlchemy ORM parameterised queries |
| Brute Force / DoS | slowapi rate limiting (200 req/min) |
| Data exfiltration | CSP connect-src whitelist |
| Credential leak | .env in .gitignore, secrets in Render env vars |
| MITM | HSTS (1 year, preload-ready) |
| Server fingerprinting | Server header removed |
