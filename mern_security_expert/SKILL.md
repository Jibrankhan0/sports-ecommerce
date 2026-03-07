---
name: MERN Security Expert
description: Expert-level security auditing and management for MERN stack applications. Focuses on vulnerability detection, OWASP Top 10 mitigation, and secure infrastructure.
---

# MERN Security Expert

This skill provides a comprehensive framework for securing MERN (MongoDB, Express, React, Node.js) applications from development to deployment.

## 🛡️ Step 1: Vulnerability Assessment

Identified vulnerabilities are the first line of defense.

1. **Dependency Audit**: Run `npm audit` regularly to find known vulnerabilities in third-party packages.
2. **Static Analysis**: Use `eslint-plugin-security` to find insecure code patterns (e.g., `eval()`, regex DOS).
3. **Environment Security**: Verify `.env` is in `.gitignore`. ensure no secrets are hardcoded in the repository.

## 🔒 Step 2: Full Security Management

### 1. Backend Defense (Node/Express)
- **Helmet**: Use `app.use(helmet())` to set secure HTTP headers (XSS Filter, Content-Security-Policy).
- **Rate Limiting**: Prevent Brute Force/DOS attacks using `express-rate-limit`.
- **Data Sanitization**: Sanitize user input against NoSQL Injection and Cross-Site Scripting (XSS) using `mongo-sanitize` and `xss-clean`.
- **HPP**: Protect against HTTP Parameter Pollution using `hpp`.

### 2. Authentication & Data Security
- **JWT Best Practices**: Use a strong, long secret. Store tokens in `httpOnly` cookies, not `localStorage`.
- **Password Hashing**: Always use `bcryptjs` with a salt round of at least 10.
- **Mongoose Sanitization**: Ensure queries use specific filters instead of passing `req.body` directly to `find()`.

### 3. Frontend Protection (React)
- **Avoid `dangerouslySetInnerHTML`**: If required, pre-sanitize the HTML.
- **Secure Storage**: Never store PII (Personally Identifiable Information) or sensitive tokens in JS-accessible storage.

## 🚀 Security Quick Fixes

### Fix: Secure Headers
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Fix: NoSQL Injection Prevention
```javascript
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

### Fix: Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

## 🛡️ Security Verification Checklist
- [ ] Is `npm audit` clear of high/critical vulnerabilities?
- [ ] Are all API endpoints protected by rate limiting?
- [ ] Is `helmet` enabled and configured for CSP?
- [ ] Are JWTs stored in `httpOnly` cookies?
- [ ] Is all user input sanitized before reaching MongoDB or the DOM?
- [ ] Are environment variables properly secured and never leaked?
