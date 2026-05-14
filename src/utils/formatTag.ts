/** Convert tag slug to display label. e.g. "box_braids" → "Box Braids" */
export function formatTag(slug: string): string {
  return slug
    .split(/[_-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
