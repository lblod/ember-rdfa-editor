import { ModelInlineComponent } from '../inline-components/model-inline-component';
import Writer from './writer';

export default class XmlInlineComponentWriter
  implements Writer<ModelInlineComponent, Element>
{
  constructor(private document: XMLDocument) {}

  write(_component: ModelInlineComponent): Element {
    const el = this.document.createElement('inline-component');
    return el;
  }
}
