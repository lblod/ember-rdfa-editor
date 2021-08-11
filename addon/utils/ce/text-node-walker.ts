import { typeOf } from '@ember/utils';
import NodeWalker from '@lblod/marawa/node-walker';
import RichNode from "@lblod/marawa/rich-node";

export default class TextNodeWalker extends NodeWalker {
  finishChildSteps(richNode: RichNode): void {
    let myText = "";
    richNode.children.map((child) => {
      if (typeOf(child.text) === "string") {
        myText += child.text;
      }
    });

    richNode.text = myText;
  }
}

export function getTextContent(node: Node): string {
  const walker = new TextNodeWalker();
  const processedNode = walker.processDomNode(node);

  return processedNode.text || "";
}

export function processDomNode(node: Node): RichNode {
  const walker = new TextNodeWalker();
  return walker.processDomNode(node);
}
