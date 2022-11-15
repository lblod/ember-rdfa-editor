import { ModelInlineComponent } from '../inline-components/model-inline-component';
import { XmlWriterContext } from '@lblod/ember-rdfa-editor/core/model/writers/xml-writer';

export default class XmlInlineComponentWriter {
  constructor(private document: XMLDocument) {}

  write(_component: ModelInlineComponent, _context: XmlWriterContext): Element {
    const el = this.document.createElement('inline-component');
    return el;
  }
}
