import { type EditorState } from 'prosemirror-state';
import { type PNode } from '#root/prosemirror-aliases.ts';

export function getArticleNodes(state: EditorState) {
  const articles: { node: PNode; pos: number }[] = [];

  state.doc.descendants((node, pos) => {
    if (node.attrs['structureType'] === 'article') {
      articles.push({ node, pos });
      return false;
    }

    return true;
  });

  return articles;
}
