import { typeOf } from '@ember/utils';

import NodeWalker from '@lblod/marawa/node-walker';
import RichNode from '@lblod/marawa/rich-node';

class TextNodeWalker extends NodeWalker {
  finishChildSteps(richNode: RichNode) {
    let myText = '';
    richNode.children.map((child) => {
      if (typeOf(child.text) === 'string') myText += child.text;
    });
    richNode.text = myText;
  }
}

function getTextContent(node: Node) {
  const walker = new TextNodeWalker();
  const processedNode = walker.processDomNode(node);
  return processedNode.text || '';
}

function processDomNode(node: Node) {
  const walker = new TextNodeWalker();
  return walker.processDomNode(node);
}

export { getTextContent, processDomNode };

export default TextNodeWalker;
