# SankalpPrep Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity Isolation**: Every `/users/{userId}` document and subcollection (`/private`, `/attempts`, `/savedItems`) MUST belong strictly to `request.auth.uid == userId`.
2. **Verified Auth Mandate**: Only verified Gmail users (`request.auth.token.email_verified == true`) or verified Phone OTP users (`request.auth.token.phone_number != null`) may write records.
3. **PII Separation**: Email and phone number PII live exclusively in `/users/{userId}/private/info` and are unreadable by any other user.
4. **Master Gate & Immutability**: Subcollection writes verify parent `/users/{userId}` ownership; `uid` and `createdAt` are immutable after creation; timestamps MUST equal `request.time`.
5. **No Self-Privilege Escalation**: Users cannot write to `/admins/{userId}` or inject shadow keys (`isAdmin`, `role`, `isVerified`).

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated write to `/users/u1`.
2. Authenticated write by `u2` into `/users/u1` (cross-tenant spoofing).
3. Unverified email user (`email_verified: false`, no phone) writing to `/users/u1`.
4. Shadow field injection (`isAdmin: true`) in `/users/u1`.
5. Spoofed `uid` (`uid: "victim"`) inside `/users/u1/attempts/a1`.
6. Client-forged `createdAt` timestamp (`createdAt != request.time`).
7. Updating immutable `createdAt` or `uid` on `/users/u1`.
8. Oversized string (> 128 chars) in `{userId}` path variable.
9. Invalid `targetExam` enum (`"INVALID_EXAM"`) on `/users/u1`.
10. Blanket `list` query on `/users` or `/users/u1/private` by another user.
11. Writing directly to `/admins/attacker` by non-admin user.
12. Deleting another user's `/users/u1/attempts/a1` record.
