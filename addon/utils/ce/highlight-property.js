import EditorProperty from './editor-property';
import { isList } from './dom-helpers';

class HighlightProperty extends EditorProperty {
  constructor({attributes = { 'data-editor-highlight': true}})  {
    super({attributes});
  }
  permittedContent(richNode) {
    const length = richNode.end - richNode.start;
    if (richNode.type == 'tag' && isList(richNode.domNode)) {
      return richNode.children;
    }
    else {
      const text = new String(richNode.domNode.textContent);
      if (length > 0 && text != " " && (text.trim().length > 0))
        return [richNode];
      else
        return [];
    }
  }
}
const highlightProperty = new HighlightProperty({});
export default highlightProperty;
