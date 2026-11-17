import { describe, expect, it } from 'vitest';
import { groupLessonTopics, topicBranch } from '../src/utils/lesson-topics.js';

describe('student lesson hierarchy', () => {
  it('nests numbered topics and returns the path to the active subtopic', () => {
    const topics = [
      { id: '1', title: '1 Foundations' },
      { id: '1.1', title: '1.1 Data' },
      { id: '1.1.1', title: '1.1.1 Formats' },
      { id: '2', title: '2 Networks' }
    ];
    const grouped = groupLessonTopics(topics);
    expect(grouped.map(({ topic }) => topic.id)).toEqual(['1', '2']);
    expect(grouped[0].children[0].children[0].topic).toBe(topics[2]);
    expect(topicBranch(grouped, '1.1.1')).toEqual(['1', '1.1', '1.1.1']);
  });

  it('keeps visible subtopics accessible when a parent is absent', () => {
    const child = { id: 'child', title: '2.1 Data' };
    expect(groupLessonTopics([child])[0].topic).toBe(child);
    expect(topicBranch(groupLessonTopics([child]), 'absent')).toEqual([]);
  });
});
