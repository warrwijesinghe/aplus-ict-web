// Temporary browser mock. It is deliberately isolated so the API adapter can
// replace it without changing pages or components. Data is per browser only.
const key = 'aplus-ict-student-learning-v1';
const read = () => JSON.parse(localStorage.getItem(key) || '{"profile":null,"enrollments":[],"progress":{}}');
const write = (state) => localStorage.setItem(key, JSON.stringify(state));
const wait = (value) => Promise.resolve(value);

export const studentLearningApi = {
  profile: () => wait(read().profile),
  saveProfile: (profile) => {
    const state = read();
    state.profile = { ...state.profile, ...profile, updatedAt: new Date().toISOString() };
    write(state);
    return wait(state.profile);
  },
  enrollments: () => wait(read().enrollments),
  enrollment: (courseId) => wait(read().enrollments.find((item) => item.courseId === courseId) || null),
  enroll: (course) => {
    const state = read();
    let enrollment = state.enrollments.find((item) => item.courseId === course.id);
    if (!enrollment) {
      enrollment = { id: crypto.randomUUID(), courseId: course.id, courseSlug: course.slug, status: 'active', enrolledAt: new Date().toISOString(), lastAccessedAt: null };
      state.enrollments.push(enrollment);
      write(state);
    }
    return wait(enrollment);
  },
  progress: (courseId) => wait(read().progress[courseId] || null),
  recordActivity: (courseId, chapterId) => {
    const state = read();
    state.progress[courseId] = { ...(state.progress[courseId] || {}), lastChapterId: chapterId, lastAccessedAt: new Date().toISOString() };
    write(state);
    return wait(state.progress[courseId]);
  }
};

export const isProfileComplete = (profile) => Boolean(profile?.fullName && profile?.mobileNumber && profile?.whatsAppNumber && profile?.examYear && profile?.schoolName && profile?.district && profile?.preferredMedium);
