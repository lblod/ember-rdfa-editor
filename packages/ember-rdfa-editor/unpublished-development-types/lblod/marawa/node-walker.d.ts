declare module '@lblod/marawa/node-walker' {
  import RichNode, { RichNodeContent } from '@lblod/marawa/rich-node';

  export function walk(node: Node): RichNode;
  export default class NodeWalker {
    processDomNode(domNode: Node, parentNode?: Node, start?: number): RichNode;
    stepInDomNode(richNode: RichNode, childDomNode: Node): RichNode;
    stepNextDomNode(richNode: RichNode, nextDomChildren: Node[]): RichNode[];
    finishChildSteps(richNode: RichNode): void;
    processTextNode(richNode: RichNode): RichNode;
    processTagNode(richNode: RichNode): RichNode;
    processRegularTagNode(richNode: RichNode): RichNode;
    processVoidTagNode(richNode: RichNode): RichNode;
    processOtherNode(richNode: RichNode): RichNode;
    detectDomNodeType(domNode: Node): string;
    createRichNode(content: RichNodeContent): RichNode;
  }
}
