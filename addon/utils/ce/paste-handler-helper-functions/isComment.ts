export function isComment(node: Node): node is Comment {
  return node.nodeType === Node.COMMENT_NODE;
}
