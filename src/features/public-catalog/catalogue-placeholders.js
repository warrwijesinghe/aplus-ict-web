export const alIctTracks = {
  'sinhala-medium': {
    apiSlug: 'al-ict-sinhala-medium',
    medium: 'Sinhala Medium',
    label: 'සිංහල මාධ්‍ය',
    description: 'A/L ICT පාඩම් සිංහලෙන්, structured learning flow එකක් සමඟ.'
  },
  'english-medium': {
    apiSlug: 'al-ict-english-medium',
    medium: 'English Medium',
    label: 'English Medium',
    description: 'A/L ICT syllabus lessons in English Medium with the same structured path.'
  }
};

export const unpublishedLessons = Array.from({ length: 13 }, (_, index) => ({
  code: `ALICT_L${String(index + 1).padStart(2, '0')}`,
  lessonNumber: index + 1,
  title: `Lesson ${String(index + 1).padStart(2, '0')}`,
  summary: 'Official medium-specific title and content will appear here once published.',
  displayOrder: index + 1,
  isPlaceholder: true
}));
