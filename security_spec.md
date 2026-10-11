# Security Specification for techcircuithub

## 1. Data Invariants
1. Students can only read and write their own profile document (`/users/{userId}`).
2. Students cannot escalate their role or modify the `role` field on their profile document.
3. Opportunities, Companies, Skills, Projects, and Learning Paths are publicly readable by signed-in users, but can only be modified by Admins.
4. Applications and Saved Items can only be listed and managed by the owning student (`userId == request.auth.uid`).
5. Orders, Payments, and StudentSkills are authoritative and only written by the backend server or admin; students have read-only access to their own records.
6. Resources and Learning Paths are readable when published; only Admins can create or modify them.
7. Resource suggestions and reports are create-only by authenticated students for their own submissions.
8. Activity events are append-only by authenticated users for their own UID.

## 2. The "Dirty Dozen" Vulnerability Payloads (Prevented)
1. Impersonation: An authenticated user writing an application with another user's `userId`.
2. Role Escalation: A student updating their own user profile to set `role: "admin"`.
3. Resource Tampering: A student attempting to publish, modify or delete a learning resource or opportunity.
4. Point Injection: A student directly writing to `student_skills` to grant themselves 500 points.
5. Cart Hijacking: A user reading or updating another user's cart document.
6. Order Manipulation: A user updating an order status from "pending" to "paid" without payment gateway verification.
7. Unbounded Document Injection: Injecting oversized string payloads into opportunity reviews or reports.
8. Cross-User Application Deletion: A user deleting another user's application.
9. Dead Link Report Spoofing: Submitting reports on behalf of other user IDs.
10. Anonymous Scraping: Unauthenticated clients accessing student directories or project files.
11. Admin Impersonation: Setting custom claim or accessing `/admin` endpoints without verification.
12. Orphaned State Injection: Attempting to insert untyped arbitrary keys into sensitive collections.
