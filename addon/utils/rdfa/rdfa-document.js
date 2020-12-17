import { walk as walkDomNode } from '@lblod/marawa/node-walker';
import { selectHighlight } from '../ce/editor/select';
import { cancelProperty } from '../ce/property-helpers';
import highlightProperty from '../ce/highlight-property';

/**
 * RdfaDocument is a virtual representation of the document
 * it creates a DOM copy that does not include highlights
 * both richNode and rootNode are calculated on the fly.
 *
 * This is both to protect the internal dom of the editor and to remove internals
 */
export default class RdfaDocument {
  constructor(editor) {
    this._rootNode = editor.rootNode;
    this.setHtmlContent = function(html) {
      const selection = editor.selectHighlight(editor.richNode.region);
      editor.update(selection, { set: { innerHTML: html}});
      editor.model.read();
      editor.model.write();
      editor.updateRichNode();
    };
  }

  get rootNode() {
    const { rootNode } = this._updateDocument();
    return rootNode;
  }

  get richNode() {
    const { richNode } = this._updateDocument();
    return richNode;
  }

  get htmlContent() {
    return this.rootNode.innerHTML;
  }

  _updateDocument() {
    const parser = new DOMParser();
    const document = parser.parseFromString(this._rootNode.outerHTML, "text/html");
    const rootNode = document.querySelector('body').firstChild;
    const richNode = walkDomNode(rootNode);
    const context = {richNode, rootNode};
    const selection = selectHighlight.bind(context)(richNode.region, {});
    cancelProperty(selection, context, highlightProperty);
    return { rootNode, richNode };
  }
}
