import { typeOf } from '@ember/utils';

import NodeWalker from '@lblod/marawa/node-walker';

class TextNodeWalker extends NodeWalker {
  finishChildSteps( richNode ) {
    let myText = "";
    richNode.children.map( (child) => {
      if (typeOf(child.text) === "string")
        myText += child.text;
    } );
    richNode.text = myText;
  }
}

function getTextContent( node ) {
  const walker = new TextNodeWalker();
  const processedNode = walker.processDomNode( node );
  return processedNode.text || "";
}

function processDomNode( node ) {
  const walker = new TextNodeWalker();
  return walker.processDomNode( node );
}

export { getTextContent, processDomNode };

export default TextNodeWalker;
