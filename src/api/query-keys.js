export const queryKeys = {
  auth: { me: ['auth', 'me'] },
  content: {
    subjects: (params = {}) => ['content', 'subjects', params],
    courses: (params = {}) => ['content', 'courses', params],
    course: (slug) => ['content', 'course', slug],
    curriculum: (id) => ['content', 'curriculum', id],
    preview: (id) => ['content', 'preview', id]
  },
  learning: {
    enrolments: (params = {}) => ['learning', 'enrolments', params],
    progress: (id) => ['learning', 'progress', id]
  },
  commerce: {
    products: (params = {}) => ['commerce', 'products', params],
    product: (slug) => ['commerce', 'product', slug],
    orders: (params = {}) => ['commerce', 'orders', params],
    order: (id) => ['commerce', 'order', id]
  }
};
