# QA Checklist

Comprehensive manual test scenarios for OpenVulog. Mark each scenario Pass/Fail with notes.

## 1. Setup & Bootstrapping
- [ ] Fresh deploy with empty DB redirects to /setup and creates first admin
- [ ] Legacy script `create_admin.js` works when run manually
- [ ] Migrations run successfully (`npm run migrate` or compose health readiness)

## 2. Authentication & Authorization
### Login
- [ ] Successful login returns token & user object
- [ ] Invalid password increments failed_attempts
- [ ] After max failed attempts account is locked (HTTP 423)
- [ ] Locked account shows appropriate toast / message
- [ ] Lock auto-expires after duration and successful login resets counters

### Refresh & Logout
- [ ] Refresh endpoint issues new access token while refresh cookie present
- [ ] Logout clears refresh cookie and client local storage

### Access Control
- [ ] Non-admin cannot access /users management (redirect or 403 on API)
- [ ] Admin can create & delete users

## 3. Password Reset Flow
- [ ] Request reset with valid username returns generic success & token (dev mode)
- [ ] Request reset with invalid username still returns generic success
- [ ] Reset with valid token + strong password succeeds
- [ ] Reusing same token fails (single-use)
- [ ] Expired token (manually age or shorten TTL) is rejected
- [ ] Post-reset login with new password works
- [ ] (Future) Refresh tokens not yet invalidated note

## 4. Account Lockout Metrics
- [ ] auth_lockout_triggered_total increments on first lock
- [ ] auth_lockout_blocked_total increments for each blocked attempt during lock

## 5. Vulnerabilities CRUD
- [ ] Admin create vulnerability success
- [ ] Validation error on missing required fields
- [ ] Admin update changes persist
- [ ] Admin delete removes record
- [ ] Non-admin blocked from create/update/delete (UI + API)

## 6. Vulnerability Listing Features
- [ ] Pagination returns correct counts (page,total,totalPages)
- [ ] Severity filter works (only chosen severity values)
- [ ] Status filter works
- [ ] Search matches name & description (case-insensitive)
- [ ] Combined filters behave correctly
- [ ] dateFrom/dateTo constrain results correctly (boundary inclusive)
- [ ] Sorting (if implemented in UI) orders by chosen field & dir

## 7. Dashboard Visualizations
- [ ] Severity distribution chart matches API stats
- [ ] Status distribution chart matches counts
- [ ] Recent vulnerabilities list shows most recent 5

## 8. Comments
- [ ] List endpoint returns username field
- [ ] Posting comment optimistic update replaced by server response
- [ ] Empty / whitespace comment rejected
- [ ] Non-existent vulnerability returns 404 for comments

## 9. Attachments
- [ ] Admin upload <10MB file succeeds
- [ ] Oversized file (>10MB) rejected with friendly error
- [ ] Listing shows uploaded file metadata
- [ ] Download returns correct file & original filename
- [ ] Delete removes from DB and filesystem
- [ ] Non-admin blocked from upload & delete but can list/download
- [ ] Orphan file cleanup on DB failure (simulate by inducing error) works

## 10. Notifications
- [ ] Status change creates notification event
- [ ] Notification polling displays new item
- [ ] Marking viewed (if implemented) or refresh hides badge

## 11. Metrics & Observability
- [ ] /metrics accessible and includes custom auth & http histograms
- [ ] /healthz returns ok and includes latency_ms
- [ ] /readyz returns 503 before migrations and ready after
- [ ] /version returns expected git SHA / version metadata (if implemented)

## 12. Security Headers & CSP
- [ ] Helmet sets CSP without unsafe-inline by default
- [ ] Setting ALLOW_INLINE_CSP=true relaxes CSP appropriately

## 13. Logging
- [ ] Access logs show method,path,status,duration_ms,requestId
- [ ] Error logs include stack traces (non-production) or sanitized (production)
- [ ] Graceful shutdown logs order: shutdown.initiated -> http.server.closed -> db.pool.closed

## 14. Storybook
- [ ] Storybook starts and renders Button stories
- [ ] Controls panel updates Button props live
- [ ] Accessibility addon flags no critical violations for Button

## 15. Performance Smoke
- [ ] 200 concurrent GET /api/vulnerabilities (pagination) remain under acceptable latency (<1s P95 dev env)
- [ ] Large search term returns in reasonable time

## 16. Error Handling
- [ ] 404 on unknown API route returns JSON problem structure
- [ ] Validation errors return 400 with useful message
- [ ] Unhandled server error returns 500 and logs correlation ID

## 17. Frontend UX
- [ ] Dark mode toggle persists across reloads
- [ ] Keyboard navigation works on primary forms
- [ ] Forms show focus outline (a11y)

## 18. Regression Guard (Record after pass)
Capture baseline values (e.g., counts, typical response time) to compare after future changes.

---
Add new scenarios as features evolve. For automation, convert high priority auth & CRUD cases into integration tests.
