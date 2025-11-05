Product Requirements Document: MERN RBAC System (V2)

Version: 2.0
Date: October 31, 2025
Status: Draft
Owner: Product Management
Context: This document outlines the V2 requirements, building upon the V1-approved RBAC foundation.

1. Overview & V2 Goals

Version 1 established the core MERN RBAC functionality. Version 2 transitions the application from a "proof-of-concept" to a "production-ready" state.

The primary goals for V2 are:

Security Hardening: Implement a professional-grade, cookie-based authentication flow to replace the localStorage method, protecting against XSS and CSRF attacks.

Feature Completeness: Activate the Admin Panel, making it a functional tool for user management, not just a read-only page.

API Robustness: Harden the API against common attack vectors and invalid data through rate limiting and input validation.

Performance: Ensure the database can scale by adding necessary indexes.

2. V2 Feature Requirements

Epic 1: Secure Authentication Overhaul (Refresh Token Flow)

The current localStorage JWT is vulnerable. We will replace it with a httpOnly cookie-based refresh token flow.

F-V2-AUTH-01 (Backend): The POST /api/auth/login endpoint must be modified.

It must stop sending the token in the JSON response.

It must generate two tokens:

Access Token: A short-lived JWT (e.g., 15 minutes) with userId and role. This is sent in the JSON response.

Refresh Token: A long-lived, secure JWT (e.g., 7 days). This must be sent as a httpOnly, secure, samesite=strict cookie.

F-V2-AUTH-02 (Backend): Create a new POST /api/auth/refresh endpoint.

This endpoint will be called with no body. It will read the httpOnly refresh token cookie.

If the refresh token is valid, it will issue a new, short-lived access token in the JSON response.

If invalid, it must return a 401 Unauthorized error.

F-V2-AUTH-03 (Backend): Create a new POST /api/auth/logout endpoint.

This endpoint must clear the httpOnly refresh token cookie on the client.

F-V2-AUTH-04 (Frontend): The AuthContext (frontend/src/context/AuthContext.js) must be refactored.

It must stop using localStorage.

It will store the access token in React's in-memory state (e.g., useState).

The login function will now store the access token from the JSON response and update the user state.

The logout function must now call POST /api/auth/logout and clear the local state.

F-V2-AUTH-05 (Frontend): Implement an Axios Interceptor (frontend/src/services/api.js).

This interceptor will be attached to the global Axios instance.

It must catch 401 Unauthorized errors on API requests.

When a 401 is caught (meaning the access token expired), it must automatically and silently call POST /api/auth/refresh to get a new access token.

After getting the new token, it must update the token in AuthContext and re-try the original, failed API request. This entire process should be seamless to the user.

F-V2-AUTH-06 (Backend / Security): Implement CSRF (Cross-Site Request Forgery) protection (e.g., csurf or double-submit cookie).

Because we are now using cookies, our app is vulnerable to CSRF. This is mandatory.

The backend must generate a CSRF token and send it to the frontend.

The frontend must include this token in a header (e.g., X-CSRF-Token) on all state-changing requests (POST, PUT, DELETE).

Epic 2: Functional Admin Panel

The Admin Panel will be upgraded from read-only to read-write.

F-V2-ADMIN-01 (Backend): Create a new endpoint: PUT /api/users/:id/role.

This endpoint must be protected by the protect and authorize('users:manage') middleware.

F-V2-ADMIN-02 (Backend): The controller for this endpoint must validate the role from the request body to ensure it is one of the allowed values ('Admin', 'Editor', 'Viewer').

F-V2-ADMIN-03 (Frontend): Update AdminPage.js (frontend/src/pages/AdminPage.js).

The user table must be modified. Each row (for users who are not the currently logged-in admin) should display a <select> dropdown pre-filled with the user's current role.

The dropdown will contain options to change the role.

An "Update" button must be added to each row.

F-V2-ADMIN-04 (Frontend): Clicking "Update" will:

Call PUT /api/users/:id/role with the new role.

Show a success/error message.

On success, re-fetch the list of users to display the updated data.

Epic 3: API Hardening & Validation

The API will be hardened against bad data and simple attacks.

F-V2-API-01 (Security): Implement basic rate limiting (e.g., express-rate-limit).

A global, gentle limit should be applied to all requests.

A stricter limit must be applied to sensitive endpoints: POST /api/auth/login and POST /api/auth/refresh to prevent brute-force attacks.

F-V2-API-02 (Validation): Add server-side input validation and sanitization (e.g., express-validator).

All user-provided input must be validated.

Login: username and password must be non-empty strings.

Post (Create/Update): title and content must be non-empty and sanitized (e.g., trim, escape).

Role Change: role must be a valid, expected value.

F-V2-API-03 (Security): Configure CORS properly.

The cors() middleware in server.js must be updated from app.use(cors()) to app.use(cors({ origin: 'http://localhost:3000', credentials: true })).

The credentials: true option is required for the frontend to be able to send cookies.

3. V2 Non-Functional Requirements

NF-V2-PERF-01 (Database): Add MongoDB indexes to userModel.js and postModel.js to improve query performance.

userModel: An index on username (Mongoose unique: true already does this, but it's now a formal requirement).

postModel: An index on the author field to speed up queries for Editors finding their own posts.

NF-V2-TEST-01 (Code Quality): Introduce unit testing (e.g., Jest, Supertest).

Core, critical-path logic must be tested.

Required tests:

Auth middleware (protect and authorize).

loginUser controller logic.

updatePost controller logic (Admin vs. Editor ownership).

4. Out of Scope (For V3)

The following items from the original vision are still out of scope and are planned for V3 ("Enterprise Observability"):

Audit Logging: A detailed log of "who changed what and when" (e.g., User A changed User B's role).

Structured, Correlated Logs: Advanced logging for easier debugging (e.g., pino, winston).

Monitoring & Metrics: Dashboards for tracking authorization denials, API performance, etc.

Full E2E Testing: End-to-end test suites (e.g., Cypress, Playwright).

User-Facing Features: User registration, password reset, etc.