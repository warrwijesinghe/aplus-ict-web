const topicNumber = (topic) => (topic.title || topic.titleEn || topic.name || '').match(/^(\d+(?:\.\d+)*)(?:[.)])?\s+\S/)?.[1];

export const groupLessonTopics = (topics = []) => {
  const nodes = topics.map((topic) => ({ topic, number: topicNumber(topic), children: [] }));
  const byNumber = new Map();
  for (const node of nodes) {
    if (node.number) byNumber.set(node.number, byNumber.has(node.number) ? null : node);
  }
  const roots = [];
  for (const node of nodes) {
    const numberParts = node.number?.split('.') || [];
    let parent;
    while (numberParts.length > 1 && !parent) {
      numberParts.pop();
      parent = byNumber.get(numberParts.join('.'));
    }
    (parent?.children || roots).push(node);
  }
  return roots;
};

export const topicBranch = (nodes, topicId) => {
  for (const node of nodes) {
    if (node.topic.id === topicId) return [node.topic.id];
    const branch = topicBranch(node.children, topicId);
    if (branch.length) return [node.topic.id, ...branch];
  }
  return [];
};
