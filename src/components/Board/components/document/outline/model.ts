export const MAX_TOPICS = 12;
export const CHILD_MIN = 1;
export const CHILD_MAX = 10;
export const NESTED_MIN = 0;
export const NESTED_MAX = 6;
export const TITLE_MAX = 180;

export type TopicDraft = {
  id: string;
  title: string;
  childCount: number;
  nestedCount: number;
};

export type OutlineNode = {
  number: string;
  title: string;
  children: OutlineNode[];
};

export function clampCount(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function buildOutline(
  topics: { title: string; childCount: number; nestedCount: number }[],
): OutlineNode[] {
  return topics.map((topic, index) => {
    const major = index + 1;
    const childCount = clampCount(topic.childCount, CHILD_MIN, CHILD_MAX);
    const nestedCount = clampCount(topic.nestedCount, NESTED_MIN, NESTED_MAX);
    return {
      number: String(major),
      title: topic.title.trim().slice(0, TITLE_MAX),
      children: Array.from({ length: childCount }, (_, child) => {
        const minor = child + 1;
        const number = `${major}.${minor}`;
        return {
          number,
          title: "",
          children: Array.from({ length: nestedCount }, (_, nested) => ({
            number: `${number}.${nested + 1}`,
            title: "",
            children: [],
          })),
        };
      }),
    };
  });
}

export function renameNode(nodes: OutlineNode[], number: string, title: string): OutlineNode[] {
  return nodes.map((node) => {
    if (node.number === number) return { ...node, title };
    if (node.children.length === 0) return node;
    return { ...node, children: renameNode(node.children, number, title) };
  });
}

export function formatOutline(nodes: OutlineNode[]): string {
  const lines: string[] = [];
  const walk = (node: OutlineNode, depth: number) => {
    const title = node.title.trim();
    lines.push(`${"    ".repeat(depth)}${node.number}. ${title}`.trimEnd());
    node.children.forEach((child) => walk(child, depth + 1));
  };
  nodes.forEach((node) => walk(node, 0));
  return lines.join("\n");
}
