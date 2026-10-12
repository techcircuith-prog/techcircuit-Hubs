# techcircuithub - ECE, VLSI & ACT SaaS Platform

techcircuithub is a production-ready, mobile-first SaaS platform designed specifically for Electronics & Communication Engineering (ECE), VLSI, and Advanced Circuit Technology (ACT) students in India.

## Key Features
- **Opportunities Portal**: Internships, industrial trainings, and hackathons with targeted skill tags and deadline trackers.
- **Resource Hub**: Curated ECE/VLSI video courses, notes, datasheets, simulation tools, cheat sheets, and structured Learning Paths.
- **Automated Skill Tracking**: Server-verified skill levels (Beginner, Intermediate, Advanced, Expert) and radar visualization.
- **Project Lab Store**: Physical hardware kits and downloadable digital project archives with Cashfree PG integration.
- **Nexar Component Intelligence**: Real-time distributor inventory and price break comparison for electronic components.
- **Comprehensive Admin Suite**: Mobile-first management for resources, opportunities, skills, companies, orders, analytics, and link health checks.

---

## Environment Variables & Secrets
Configure the following in your environment or the AI Studio Secrets panel:

| Variable | Description | Example / Default |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Existing Firebase project used by the Web SDK and trusted backend | `formal-harbor-qrtgb` |
| `FIREBASE_DATABASE_ID` | Existing Firestore database ID used by the app | Set to the app's configured database |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Optional local credential path for server-only Firebase operations; hosted environments should use Application Default Credentials | Keep keys outside the repository |
| `APP_URL` | Public application URL for callbacks & webhooks | `https://your-domain.run.app` |
| `NEXAR_CLIENT_ID` | Nexar Supply API Client ID (Octopart/Nexar) | `...` |
| `NEXAR_CLIENT_SECRET` | Nexar Supply API Client Secret | `...` |
| `CASHFREE_APP_ID` | Cashfree Merchant App ID | `TEST...` |
| `CASHFREE_SECRET_KEY` | Cashfree Secret Key | `cfsk_ma_test_...` |
| `CASHFREE_ENV` | Cashfree Environment | `sandbox` or `production` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name for project & certificate assets | `...` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `...` |
| `YOUTUBE_API_KEY` | Optional: YouTube Data v3 API key for playlist bulk import | `AIza...` |

---

## Cashfree Payment Gateway Setup
1. Sign up on [Cashfree Payments](https://www.cashfree.com/) and navigate to Payment Gateway Sandbox.
2. Retrieve your `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY`.
3. Set your webhook endpoint in Cashfree Dashboard:
   `https://<YOUR_APP_URL>/api/cashfree/webhook`
4. The server validates the Cashfree signature using raw body HMAC SHA256 before crediting orders and granting skill points.

## Nexar Component Supply Setup
1. Create an application at [Nexar Developer Portal](https://portal.nexar.com/).
2. Enable the Supply API scope (`supply.domain`).
3. Set `NEXAR_CLIENT_ID` and `NEXAR_CLIENT_SECRET`.
4. The backend securely retrieves OAuth2 tokens and caches search responses for 24 hours to protect API quotas.

## Firebase Configuration
The existing Web SDK configuration points to project `formal-harbor-qrtgb` and the existing named Firestore database. Admin sign-in uses Firebase Authentication (Email/Password); admin authorization is determined by a trusted `/admins/{uid}` membership document or trusted Firebase custom claim. The client cannot create or modify admin membership. Firestore Security Rules, not client visibility checks, enforce admin-only student/application/order reads and opportunity writes. Order fulfillment updates are limited to `paid → shipped → delivered`; payment status remains server-authoritative.

Before enabling the migrated admin console:
1. In Firebase Console for the existing project, enable **Authentication → Sign-in method → Email/Password** and create the administrator's Firebase Authentication user (if one does not already exist).
2. Obtain that user's UID from the Authentication user list.
3. In the existing Firestore database, have an authorized project administrator create `/admins/{uid}` for that exact UID. Do not use the application to create this document; the `admins` rules explicitly deny all client writes. A minimal marker document such as `{ "enabled": true }` is sufficient.
4. Review and publish `firestore.rules` to that same existing database. This project has no `firebase.json`, so no rules deployment was attempted here. The rules remove a legacy hardcoded email admin bypass, allow signed-in users to read only their own admin membership marker, and require admin membership for protected records and operations. Do not publish until the project owner has reviewed the rules.
5. Sign in at `/admin` with the provisioned Firebase Authentication account.

An IAM administrator may need to grant Firebase Console access to create the Auth user and membership document, and permission to publish Firestore rules. No service-account key is needed for browser-based admin features.

Cashfree payment creation, payment verification, and webhook reconciliation remain trusted server-only operations using Firebase Admin SDK. On a hosted platform, configure the server to use its assigned Application Default Credentials identity with Firestore access (for example, `roles/datastore.user` on the existing project/database). Local development without an authorized ADC identity or a separately provided external service-account key cannot perform those server-only operations; payment status must not be changed from the browser. Nexar, Cashfree, Cloudinary, and YouTube credentials remain server-side environment variables and are unrelated to Firestore admin authorization.

If Firebase Console refuses to generate a key or create the account because of insufficient permissions, ask a project owner or IAM administrator to create/configure the service account. Creating an account requires `iam.serviceAccounts.create` (included in **Service Account Admin**, `roles/iam.serviceAccountAdmin`). Generating a JSON key for an existing account requires `iam.serviceAccountKeys.create` (included in **Service Account Key Admin**, `roles/iam.serviceAccountKeyAdmin`). The account also needs Firestore data access, such as **Cloud Datastore User** (`roles/datastore.user`), scoped to the existing project. Do not grant yourself permissions or disable organization policies to work around this restriction.
