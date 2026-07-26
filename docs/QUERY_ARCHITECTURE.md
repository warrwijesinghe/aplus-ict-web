# Query architecture

`src/api/query-keys.js` organizes auth, content, learning, and commerce cache keys. Page components call API modules rather than Axios. Mutations invalidate their parent `learning` or `commerce/orders` queries after successful progress/order operations. API query functions pass TanStack Query abort signals through Axios.
