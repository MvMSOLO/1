# NEXUS Security Model

## Core Principles

### 1. No Secrets on the Frontend
- Absolutely no API keys, credentials, or private environment variables are compiled into the React bundle.
- Any authenticated external provider requests are made through the Cloudflare edge backend API.

### 2. URL and Content Sanitization
- External links are fully validated to only allow `http:` and `https:` schemes. Unsafe schemes (e.g. `javascript:`, `data:`) are strictly rejected.
- Excerpts and contents rendered dynamically are sanitized. No unescaped `dangerouslySetInnerHTML` is used.

### 3. Safe Cross-Origin Navigation
- External links are opened with `target="_blank"` and `rel="noopener noreferrer"`.
- Content Security Policies are strictly adhered to, allowing only necessary API endpoints.
