# A Plus ICT Web

## Student enrollment model

Phone verification and password setup create an account only. A student separately enrolls for free in either the Sinhala or English A/L ICT course; only enrolled courses show learning progress or allow free chapter access. The first enrollment captures a student profile (name, mobile/WhatsApp contacts, A/L year, school, district and medium); A contact email can be supplied for card checkout and receipts. Paid lesson access remains a separate entitlement.

Student profiles, enrolments and learning progress are persisted through the API; the browser adapter has no local mock fallback.

The A Plus ICT Web application is the public website and Student LMS. It displays the dynamic A/L ICT catalogue, supports phone verification and password sign-in, presents free and paid lessons in one flow, records progress and supports individual lesson ordering.

```powershell
copy .env.example .env
npm ci
npm run dev
```

Set `VITE_API_URL=http://localhost:4000` for backend access. PayHere checkout details are returned by the authenticated API after it creates a server-side payment attempt; no PayHere credentials are configured in this application. In the Docker stack, Nginx supplies `/api` as the same-origin API base.

## Legal identity and policies

The public footer, About page, Contact page, and policy pages read non-sensitive legal identity from the API site profile. A Plus ICT remains the public brand and is identified as an educational project of Miracle Network and Solutions (Pvt) Ltd. The public policy routes are `/privacy-policy`, `/terms`, `/refund-policy`, `/cancellation-policy`, and `/payment-policy`.

Never put a PayHere Merchant Secret in this application or any `VITE_` environment variable.

## Payment Provider Review Access

The non-indexed `/review-access` route is a restricted form for the server-configured reviewer account. It sends credentials only to the API and does not use a Vite environment variable for passwords or hashes. The API operator enables, configures, and disables it as documented in the API README; normal `/login` uses phone/password.

## Phone authentication

- `/login`: mobile number and password.
- `/register`: phone → SMS code → name and password.
- `/forgot-password`: phone → SMS code → new password → sign in.

All authentication screens are non-indexed. Intended course/enrolment destinations are retained through these flows. The API sends OTPs using server-side Mobitel credentials; no SMS secret belongs in this application.

Deploy with the API phone-authentication migration. Existing Google students must have a login number assigned to their existing account by an operator before they use OTP password reset; see the API's `docs/PHONE_AUTHENTICATION.md`.
