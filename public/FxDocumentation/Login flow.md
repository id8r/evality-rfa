# Login Flow

Status: 🟢 | `🟡` | 🔴

`Last Updated: 10 Jun 2026`

> **Goal:** Single authentication experience. Users should never decide between Login and Sign Up.

#### Entry Points

- Get Started
- Sign Up
- Log In

All three open the same authentication experience.

---


## Quick Flow Diagram

```text
User enters email
↓
System checks if account exists
↓
If exists: "We sent you a login code"
If new: "We sent you a signup code"
↓
User enters code
↓
Existing user → App home
New user → Hiring Type → App home
```

## Email Flow

User enters email ↓ <br>
System checks if account exists ↓ <br>

If exists: "We sent you a login code"<br>
If new:	"We sent you a signup code"
↓

User enters verification code ↓ <br>
Verification succeeds

Existing user: App Home (/)

New user: Hiring Type Selection → App Home (/)

---

## OAuth Flow

Google
↓
OAuth Success
↓
Check if user exists

Existing user
↓
App Home (/)

New user
↓
Hiring Type Selection
↓
App Home (/)

---

## Hiring Type Selection

Question:

What best describes your hiring?

○ I'm hiring for my company

○ I'm hiring for clients

Store selection.

Proceed to App Home.

---

### Notes

- No passwords
- No OTP terminology in UI
- Verification code or magic link
- Login and Signup are system decisions, not user decisions


<!--
Future Consideration

- Magic Link vs Verification Code
- Google OAuth
- LinkedIn OAuth
- Handle creation timing
-->