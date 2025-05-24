export default function remarkExtractHeadings() {
  return (tree: any, file: any) => {
    const headings: {
      depth: number;
      text: string;
      slug: string;
    }[] = [];

    function visit(node: any): void {
      if (node.type === 'heading' && node.depth <= 3) {
        const text = node.children
          .filter((child: any) => child.type === 'text' || child.type === 'inlineCode')
          .map((child: any) => child.value)
          .join('');

        const slug = text
          .toLowerCase()
          .replace(/[^\w]+/g, '-')
          .replace(/(^-|-$)/g, '');

        headings.push({
          depth: node.depth,
          text,
          slug,
        });
      }

      if (node.children) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
    file.data.headings = headings;
  };
}
