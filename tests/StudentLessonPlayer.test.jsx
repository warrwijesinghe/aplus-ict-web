import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ActivityRenderer } from '../src/components/learning/StudentLessonPlayer.jsx';

const renderActivity = (activity) => render(<MemoryRouter><ActivityRenderer activity={{ id: 'activity-1', title: 'Activity title', completionMode: 'manual', ...activity }} /></MemoryRouter>);

describe('student lesson activity renderers', () => {
  it('renders text activities through the server-sanitized content field', () => {
    renderActivity({ type: 'rich_text', content: '<p>Safe learning content</p>' });
    expect(screen.getByText('Safe learning content')).toBeInTheDocument();
  });

  it('renders each safe activity shell and a future-safe fallback', () => {
    const cases = [
      [{ type: 'label', content: '<strong>Topic label</strong>' }, 'Topic label'],
      [{ type: 'video', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }, 'Open video on YouTube'],
      [{ type: 'image' }, 'Image unavailable.'],
      [{ type: 'pdf' }, 'Resource unavailable.'],
      [{ type: 'file' }, 'Resource unavailable.'],
      [{ type: 'download' }, 'Resource unavailable.'],
      [{ type: 'external_link', externalUrl: 'https://example.com' }, 'Open external learning resource'],
      [{ type: 'practical_activity', instructions: '<p>Build a worksheet</p>' }, 'Build a worksheet'],
      [{ type: 'assignment', instructions: 'Read the brief' }, 'Student submission is not available yet.'],
      [{ type: 'quiz', instructions: 'Quiz introduction' }, 'Quiz attempts are not available yet.'],
      [{ type: 'embed' }, 'This learning activity is not supported in the student player yet.'],
    ];
    cases.forEach(([activity, expected]) => {
      const view = renderActivity(activity);
      expect(screen.getByText(expected)).toBeInTheDocument();
      view.unmount();
    });
  });

  it('never renders protected fields for a locked activity', () => {
    renderActivity({ type: 'rich_text', isLocked: true, content: '<p>private body</p>', youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ', externalUrl: 'https://private.example' });
    expect(screen.getByText('Premium activity')).toBeInTheDocument();
    expect(screen.queryByText('private body')).not.toBeInTheDocument();
    expect(screen.queryByText('Open video on YouTube')).not.toBeInTheDocument();
  });
});
