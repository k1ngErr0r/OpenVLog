# Two-Factor Authentication (TOTP) Design

## Goals
Increase account security by requiring a time-based one-time password (TOTP) after primary credential verification.

## User Flow
1. User logs in with username/password.
2. If `two_factor_enabled=false` -> normal issuance of tokens.
3. If `two_factor_enabled=true` -> return 200 + `{ requires2fa: true, tempToken }` (short-lived 5 min JWT with `purpose: '2fa'`).
4. Client shows code entry screen (6-digit). Submits to `/api/auth/2fa/verify` with code + tempToken.
5. Server verifies TOTP -> issues normal access/refresh tokens.

## Enabling 2FA
1. User hits `/api/auth/2fa/setup` (auth required) -> server generates secret (base32) & otpauth URL.
2. Returns provisioning data + QR code data URL (client renders QR via lib or uses PNG endpoint).
3. User enters current TOTP code to confirm. If correct, set `two_factor_enabled=true`, store hashed secret.

## Database Changes (users table)
Add columns:
- `two_factor_secret` TEXT NULL (store encrypted or hashed using HMAC with server secret)
- `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false
- Optionally `two_factor_recovery_codes` TEXT NULL (JSON array hashed codes)

## Security Considerations
- Encrypt secret at rest: `AES-GCM(user_specific_key)` or hash with HMAC if only verify needed.
- Rate limit verification attempts (e.g., 5 per 5 minutes per user/IP).
- Recovery codes: create 8 one-time codes (10 chars), hash with bcrypt, allow disabling 2FA with one.

## Libraries
- `otplib` for TOTP generation/validation.
- `qrcode` (optional) for PNG generation.

## Endpoints
| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST | /api/auth/2fa/setup | Generate secret (returns otpauth & QR) |
| POST | /api/auth/2fa/enable | Verify code, persist secret, enable flag |
| POST | /api/auth/2fa/verify | Exchange tempToken + code for auth tokens |
| POST | /api/auth/2fa/disable | Verify password + code or recovery, disable |
| GET  | /api/auth/2fa/recovery | Generate new recovery codes |

## Token Strategy
- `tempToken`: JWT with claims `{ userId, purpose:'2fa', exp: now+300 }`.
- Normal login: after pwd success check `two_factor_enabled`.

## Sample Verification Logic
```js
import { totp } from 'otplib';

function verifyCode(user, code){
  return totp.verify({ token: code, secret: decrypt(user.two_factor_secret) });
}
```

## Client Changes
- Add intermediate screen after password success if `requires2fa`.
- Persist `tempToken` only in memory.
- Provide QR display & code entry when enabling.

## Edge Cases
- Drift: Accept +/-1 step (default otplib window).
- User loses device: use recovery code -> force regenerate secret.
- Disable flow must re-prompt password to mitigate stolen session abuse.

## Testing
1. Setup + verify with authenticator (Google Authenticator, Authy).
2. Wrong code attempts -> lockout after threshold.
3. Recovery code usage -> consumes code, login success.
4. Expired tempToken -> verification fails.

## Future Enhancements
- WebAuthn / Passkeys as second factor or replacement.
- Admin enforcement policy at org level.
