Product Requirements Document: MERN RBAC System

Version: 1.0
Date: October 31, 2025
Status: Draft
Owner: Product Management

1. Overview & Introduction

This document outlines the requirements for a Role-Based Access Control (RBAC) system built on the MERN (MongoDB, Express, React, Node.js) stack. The core objective is to create a secure, scalable application where user permissions are fine-grained, data access is strictly controlled, and UI capabilities dynamically adapt based on a user's assigned role. This system will serve as a foundational boilerplate for future applications requiring multi-tenant or tiered-access security models.

2. Problem Statement

Many web applications need to restrict user actions and data visibility. A "one-size-fits-all" user model is insecure and impractical. Developers need a reliable, enforceable pattern to ensure that:

Sensitive data (e.g., user lists) is only visible to privileged users (e.g., Admins).

Destructive actions (e.g., deleting content) are restricted.

Users can only modify content they own (e.g., an Editor) or all content (e.g., an Admin).

The UI doesn't confuse users by showing them options they are not allowed to use.

This project solves this by implementing a robust RBAC system with clear role separation, enforced at both the API (backend) and presentation (frontend) layers.

3. User Personas & Roles

We will define three distinct roles with escalating privileges:

Viewer (Read-Only):

Goal: To consume content without modifying it.

Needs: A clean, read-only view of public or assigned content.

Frustrations: Seeing edit/delete buttons that don't work.

Editor (Content Creator):

Goal: To create, publish, and manage their own content.

Needs: The ability to create new posts, and edit or delete only the posts they have authored.

Frustrations: Not being able to edit another user's post, or accidentally having their content overwritten by others.

Admin (Super User):

Goal: To manage the entire platform, including all content and all users.

Needs: Full CRUD (Create, Read, Update, Delete) access over all content, regardless of author. Ability to view, add, or change the roles of other users.

Frustrations: Inefficient workflows for user management.

4. Key Features & Requirements

4.1. Authentication

F-AUTH-01: Users must be able to log in with a username and password.

F-AUTH-02: Upon successful login, the backend must generate a JSON Web Token (JWT) that includes the user's userId and role.

F-AUTH-03: The JWT shall be securely stored on the client (e.g., localStorage or httpOnly cookie).

F-AUTH-04: All protected API endpoints must require a valid, non-expired JWT.

F-AUTH-05: Users must be able to log out, which invalidates their token on the client.

4.2. Role-Based Access Control (RBAC)

F-RBAC-01 (Backend): The API must use middleware to enforce permissions for every protected endpoint.

F-RBAC-02 (Backend): Access shall be denied by default. A user must have an explicit permission to access a resource.

F-RBAC-03 (Backend): The system must support "ownership" rules. (e.g., posts:update:own vs. posts:update:any).

F-RBAC-04 (Frontend): The UI must dynamically adapt to user permissions.

F-RBAC-05 (Frontend): Buttons or links for restricted actions (e.g., "Edit," "Delete," "Admin Panel") must be hidden or disabled.

F-RBAC-06 (Frontend): Disabled controls should provide an explanatory tooltip on hover (e.g., "You can only edit your own posts").

F-RBAC-07 (Frontend): Client-side routes (e.g., /admin) must be protected by a route guard that checks the user's role.

4.3. Content Management (Posts)

F-POST-01: A "Post" shall consist of a title, content, and an author (linking to the User model).

F-POST-02: Viewers can read all posts but cannot see any edit/delete controls.

F-POST-03: Editors can read all posts. They can create new posts (which are assigned to them). They can update or delete only posts where their userId matches the post's author.

F-POST-04: Admins can read, update, and delete all posts, regardless of the author.

4.4. User Administration

F-ADMIN-01: There must be an "Admin Panel" page, accessible only to Admins.

F-ADMIN-02: The Admin Panel must display a list of all registered users and their roles.

(Future Enhancement): Admins should be able to change a user's role via this panel.

5. Role & Permission Matrix

This table defines the core logic. Permissions are checked in the backend middleware.

Action

Resource

Viewer

Editor

Admin

posts:read

GET /api/posts

Yes

Yes

Yes

posts:create

POST /api/posts

No

Yes

Yes

posts:update:own

PUT /api/posts/:id

No

Yes (if authorId == userId)

N/A

posts:update:any

PUT /api/posts/:id

No

No

Yes (All posts)

posts:delete:own

DELETE /api/posts/:id

No

Yes (if authorId == userId)

N/A

posts:delete:any

DELETE /api/posts/:id

No

No

Yes (All posts)

users:manage

GET /api/users

No

No

Yes

6. Technical Stack

Frontend: React (with React Router, Context API, Axios)

Backend: Node.js, Express.js

Database: MongoDB (with Mongoose)

Authentication: JSON Web Tokens (JWT), bcryptjs for password hashing

7. Non-Functional Requirements

Security: Passwords must be hashed and salted. API endpoints must be protected against unauthorized access. Implement CORS for the frontend domain.

Usability: The UI must be clean, responsive, and intuitive. Feedback (loading, errors, success) must be provided for all user actions.

Performance: API queries (especially for posts) should be efficient. The author field should be populated on the Post model.

8. Out of Scope (For V1)

User registration (Sign up)

Password reset ("Forgot Password")

Editing user roles via the Admin Panel (V1 is read-only)

Refresh tokens (Access tokens will be short-lived, e.g., 1 hour)

File uploads or complex post content

9. Success Metrics

Security: Zero successful unauthorized API requests in penetration testing.

Functionality: All permissions in the Role & Permission Matrix are successfully enforced in 100% of test cases.

User Experience: An Editor can successfully log in, create a post, and cannot edit an Admin's post. An Admin can edit the Editor's post.