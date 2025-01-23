import { isComment } from './isComment';
import { traverse } from './traverse';

type Callback = (node: Comment) => boolean;

export function traverseComments(rootNode: Node, callback: Callback): void {
  traverse(rootNode, (node) => {
    if (!isComment(node)) {
      return true;
    }

    return callback(node);
  });
}
