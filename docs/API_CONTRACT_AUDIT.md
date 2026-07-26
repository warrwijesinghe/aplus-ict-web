# API contract audit

Inspected from the Phase 1 service source on 2026-07-26. All responses use
`{ success: true, data }` except paginated endpoints, which return
`{ success: true, data: { items }, pagination }`.

## Auth service (`VITE_AUTH_API_URL`)

| Endpoint                       | Request / response                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/v1/auth/register`   | `{ firstName, lastName?, email, password }` → `{ user, accessToken }`, sets HTTP-only refresh cookie. Password: 8–128 chars, letter and number. |
| `POST /api/v1/auth/login`      | `{ email, password }` → `{ user, accessToken }`, sets refresh cookie. Invalid credentials are `401 INVALID_CREDENTIALS`.                        |
| `POST /api/v1/auth/refresh`    | Cookie only → `{ accessToken }`, rotates refresh cookie.                                                                                        |
| `POST /api/v1/auth/logout`     | Cookie only; always clears the cookie.                                                                                                          |
| `POST /api/v1/auth/logout-all` | Bearer token; invalidates all sessions.                                                                                                         |
| `GET /api/v1/auth/me`          | Bearer token → `{ user }`; user has `roles: [{ id, code, name }]` and `permissions: string[]`.                                                  |

## Content service (`VITE_CONTENT_API_URL`)

| Endpoint                                           | Notes                                                                                                                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/catalog/subjects`                     | Paginated published subjects; accepts `search`, `page`, `limit`.                                                                                                                                                 |
| `GET /api/v1/catalog/courses`                      | Published courses; accepts `search`, `subjectId`, `subjectSlug`, `academicLevel`, `grade`, `medium`, `page`, `limit`.                                                                                            |
| `GET /api/v1/catalog/courses/:slug`                | Published detail. Optional bearer token; authenticated-only courses return `401 AUTHENTICATION_REQUIRED` when signed out.                                                                                        |
| `GET /api/v1/catalog/courses/:courseId/curriculum` | Published modules and lessons; same visibility rule.                                                                                                                                                             |
| `GET /api/v1/catalog/lessons/:lessonId/preview`    | Public preview lessons only. Sections include `sectionType`, `content`, `configuration`, `resourceId`, `externalUrl`.                                                                                            |
| `GET /api/v1/admin/content/*`                      | Authenticated management API. The service currently has no permission middleware on these routes; UI therefore uses client-side permission guards only as a usability measure and does not present edit actions. |

Course fields include `thumbnailResourceId`, `estimatedDurationHours`, `Subject`, and `CourseModules`. Lesson preview section types are `heading`, `rich_text`, `video`, `image`, `download`, `embed`, and `callout`.

## Learning service (`VITE_LEARNING_API_URL`)

| Endpoint                                               | Request / response                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `GET /api/v1/learning/me/enrolments`                   | Current student's paginated enrolments.                                     |
| `GET /api/v1/learning/me/enrolments/:enrolmentId`      | `{ enrolment, progress }`.                                                  |
| `GET /api/v1/learning/me/courses/:courseId/progress`   | Course progress summary.                                                    |
| `POST /api/v1/learning/me/lessons/:lessonId/start`     | `{ courseId, moduleId }`.                                                   |
| `PATCH /api/v1/learning/me/lessons/:lessonId/progress` | `{ courseId, moduleId, progressPercent?, timeSpentSecondsDelta? }`.         |
| `POST /api/v1/learning/me/lessons/:lessonId/complete`  | `{ courseId, moduleId }`.                                                   |
| `POST /api/v1/learning/me/lessons/:lessonId/access`    | `{ courseId, moduleId }` → access decision.                                 |
| `GET /api/v1/admin/learning/enrolments`                | Requires `learning.enrolments.read`; supports server-side filtering/paging. |

## Commerce service (`VITE_COMMERCE_API_URL`)

| Endpoint                                                          | Request / response                                                                                                                                                               |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/store/products`                                      | Active products; accepts `search`, `productType`, `page`, `limit`. Product has safe `availability`, prices as decimal strings, `thumbnailResourceId`, and entitlement summaries. |
| `GET /api/v1/store/products/:slug`                                | Active product detail.                                                                                                                                                           |
| `GET /api/v1/commerce/me/orders`                                  | Current customer's paginated orders.                                                                                                                                             |
| `POST /api/v1/commerce/me/orders`                                 | `Idempotency-Key` required; `{ items: [{ productId, quantity }], deliveryMethod?, shippingAddress?, customerPhone?, customerNote? }`. Server calculates all prices.              |
| `GET /api/v1/commerce/me/orders/:orderId`                         | Customer order detail.                                                                                                                                                           |
| `POST /api/v1/commerce/me/orders/:orderId/cancel`                 | `{ reason? }`.                                                                                                                                                                   |
| `POST /api/v1/commerce/me/orders/:orderId/payments/bank-transfer` | `Idempotency-Key` required; `{ customerReference, proofResourceId? }`; creates a pending payment.                                                                                |
| `GET /api/v1/commerce/me/orders/:orderId/payments`                | Payment history.                                                                                                                                                                 |

## Resource service (`VITE_RESOURCE_API_URL`)

| Endpoint                                           | Notes                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `GET /api/v1/public/resources/:resourceId`         | Public metadata only.                                                  |
| `GET /api/v1/public/resources/:resourceId/content` | Public resource content.                                               |
| `GET /api/v1/resources/:resourceId/content`        | Authenticated content; resource visibility is enforced by the service. |
| `GET /api/v1/resources/:resourceId/download`       | Authenticated attachment download.                                     |

Metadata intentionally omits storage keys. Variants are metadata rather than public variant URLs; the client must request content through the resource API.

## Infrastructure finding

`aplus-ict-infra/nginx/nginx.conf` currently forwards `/api/auth/`, `/api/content/`, etc. directly to service roots, while the services expose `/api/v1/...`. That gateway configuration does **not** map browser routes to the documented service routes. Development therefore uses direct service URLs. Production needs compatible gateway rewrites (or public service paths) before `VITE_API_GATEWAY_URL` can be selected.

## Permission and endpoint gaps

- The requested teacher-only content ownership/listing endpoint is not present; admin content list routes return the generic management list and do not enforce permissions server-side.
- The public product contract does not include entitlement access duration, long description, or an explicit maximum order quantity; the client uses the server's validator maximum of 20 per item.
- Public catalogue data has no product-to-course mapping, so course pages cannot infer a product CTA.
- Resource variants have no named public URL endpoint. Named variant selection can only be advisory until the Resource Service adds it.
