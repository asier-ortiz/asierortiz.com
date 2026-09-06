/**
 * Wraps every Markdown table in a `div.table-wrap` so wide tables scroll
 * horizontally inside the article instead of widening the whole page on
 * narrow screens. Tables with four or more columns also get `data-wide`,
 * which the stylesheet uses to keep their columns readable.
 */
export default function rehypeTableWrap() {
  return (tree: any) => {
    function visit(node: any, parent: any, index: number): void {
      if (node.type === 'element' && node.tagName === 'table' && parent) {
        if (parent.tagName === 'div' && parent.properties?.className?.includes('table-wrap')) {
          return;
        }
        const columns = countColumns(node);
        node.properties = { ...(node.properties ?? {}), 'data-cols': String(columns) };
        if (columns >= 4) {
          node.properties['data-wide'] = '';
        }
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [node],
        };
        return;
      }
      if (node.children) {
        node.children.forEach((child: any, i: number) => visit(child, node, i));
      }
    }

    visit(tree, null, 0);
  };
}

function countColumns(table: any): number {
  let max = 0;
  function walk(node: any): void {
    if (node.type === 'element' && node.tagName === 'tr') {
      const cells = node.children.filter(
        (child: any) => child.type === 'element' && (child.tagName === 'td' || child.tagName === 'th')
      ).length;
      if (cells > max) max = cells;
      return;
    }
    node.children?.forEach(walk);
  }
  walk(table);
  return max;
}
