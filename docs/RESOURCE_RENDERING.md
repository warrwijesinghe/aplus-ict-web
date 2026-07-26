# Resource rendering

`ResourceImage` requests `GET /api/v1/public/resources/:resourceId/content` and falls back safely if a resource is absent. The frontend never constructs a storage path or exposes a storage key. Current Resource Service contracts do not expose named public content-variant URLs, so `thumbnail`, `small`, `medium`, `large`, and `original` selection cannot be applied client-side yet.
