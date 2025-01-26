import { isComment } from './isComment.ts';
import { traverseComments } from './traverseComments.ts';

export function removeNodesBetweenComments(
  rootNode: Node,
  start: string,
  end: string,
): void {
  function isClosingComment(node: Node): boolean {
    return isComment(node) && node.data === end;
  }

  traverseComments(rootNode, (comment) => {
    if (comment.data === start) {
      let node = comment.nextSibling;

      comment.remove();

      while (node && !isClosingComment(node)) {
        const { nextSibling } = node;
        node.remove();
        node = nextSibling;
      }

      if (node && isClosingComment(node)) {
        node.remove();
      }
    }

    return true;
  });
}
