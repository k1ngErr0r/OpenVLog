# Refresh Token Invalidation Strategy

Goal: Invalidate outstanding refresh tokens after a critical auth event (password reset, manual admin force logout, privilege change) while keeping stateless access token verification fast.

## Current State
- Access tokens: short-lived JWT (assumed) containing user id & role.
- Refresh tokens: httpOnly cookie; presently all remain valid until natural expiry even after password reset.

## Risks Without Invalidation
- Stolen refresh token could continue to mint new access tokens after password reset.
- User expectation that password change logs out existing sessions not met.

## Strategy: Token Versioning
Add a monotonically increasing `token_version` column to `users` table.

### Schema Migration
```sql
ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_token_version ON users(token_version);
```

### JWT Claims
Embed `tv` (token_version) in both access & refresh JWTs when issued.

### Validation Logic
1. On refresh endpoint, after verifying signature, load user's current `token_version`.
2. Compare `payload.tv` with `user.token_version`.
3. If mismatch -> reject with 401 (force re-auth).

### Invalidation Events
Increment `token_version` (atomic update) when:
- Password reset succeeds.
- Admin forces global logout (future endpoint `/api/users/:id/invalidate-sessions`).
- Potentially on role/privilege elevation (optional).

### Pseudocode
```js
// issuing
const refreshToken = jwt.sign({ sub: user.id, tv: user.token_version }, REFRESH_SECRET, { expiresIn: '30d' });

// validating refresh
const payload = jwt.verify(token, REFRESH_SECRET);
const user = await users.findById(payload.sub);
if (!user || user.token_version !== payload.tv) throw new UnauthorizedError();
```

### Migration & Backward Compatibility
- During rollout, existing tokens lack `tv`. Treat missing `tv` as `0`.
- After a grace period, require presence.

### Performance Considerations
- Single indexed lookup per refresh (already happening for user fetch) so negligible overhead.
- Access token validation remains stateless; only refresh path checks DB.

### Revocation Breadth
Incrementing `token_version` invalidates all outstanding refresh tokens for the user at once (simple & coarse-grained). For per-device control, add a `refresh_sessions` table (out of scope for now).

### Future Enhancements
- Track last invalidation timestamp for audit.
- Per-session table with device metadata & soft revocation.
- Admin UI to list active sessions.

## Implementation Steps
1. Create migration adding `token_version`.
2. Extend user model/service to fetch & increment version.
3. Modify auth controller issuing tokens to include `tv` claim.
4. Modify refresh endpoint to compare `tv`.
5. Increment `token_version` on password reset completion.
6. Document behavior (README + admin guide).

## Rollback Plan
If issues appear:
- Revert code to ignore `tv` claim (always accept) while leaving column present.
- No data loss; column is additive.

---
This document provides the blueprint; implementation can follow in a dedicated PR.
