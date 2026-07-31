# A Plus ICT Web

## Student enrollment model

Google login creates an account only. A student separately enrolls for free in either the Sinhala or English A/L ICT course; only enrolled courses show learning progress or allow free chapter access. The first enrollment captures a student profile (name, mobile/WhatsApp contacts, A/L year, school, district and medium); Google email remains read-only. Paid lesson access remains a separate entitlement.

The current frontend uses `src/features/student/student-learning.js`, an explicitly temporary browser-local mock adapter, because the new student endpoints are not yet available. It does not claim server persistence and can be replaced with API calls for profile, enrollments, enroll, course/lesson progress, and chapter completion. Expected endpoints are documented in the product brief: `/api/student/profile`, `/api/student/enrollments`, `/api/courses/:courseId/enrollment`, `/api/courses/:courseId/enroll`, and course/lesson/chapter progress endpoints.

The A Plus ICT Web application is the public website and Student LMS. It displays the dynamic A/L ICT catalogue, starts Google student sign-in, presents free and paid lessons in one flow, records progress and supports individual lesson ordering.

```powershell
copy .env.example .env
npm ci
npm run dev
```

Set one value only for backend access: `VITE_API_URL=http://localhost:4000`. In the Docker stack, Nginx supplies `/api` as the same-origin API base.
