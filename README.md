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
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses | `rock86367@gmail.com` |
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
Firebase Firestore and Auth are pre-configured. Security rules (`firestore.rules`) and composite indexes (`firestore.indexes.json`) ensure:
- Students can only manage their own profile, cart, applications, and bookmarks.
- Skill points, orders, and completions are server-authoritative.
- Admin dashboard routes are protected both on the client and server.
