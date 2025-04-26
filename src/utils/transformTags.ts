export function generateSocialTags(tags: string[]): string[] {
  return tags.map(tag =>
    tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  );
}
