import { RenderSpec, Serializable } from '../../../model/util/render-spec';
import {
  BaseComponent,
  InlineComponent,
} from '../../../model/inline-components/model-inline-component';

export interface ExampleProperties
  extends Record<string, Serializable | undefined> {
  headLine?: string;
  content?: string;
}

export default class ExampleInlineComponent extends InlineComponent<ExampleProperties> {
  constructor() {
    super('example-inline-component', 'div');
  }

  render(props: ExampleProperties = {}): RenderSpec {
    return {
      tag: 'example-component',
      attributes: props,
    };
  }
}

export class ExampleComponent extends BaseComponent {
  get headline() {
    return this.getAttributeValue('headline');
  }

  get content() {
    return this.getAttributeValue('content');
  }

  static get observedAttributes() {
    return ['headline', 'content'];
  }

  click() {
    console.log('Hello!');
    this.setAttribute('headline', 'New Headline');
  }

  render() {
    return `<div style='border: 2px solid;padding:10px;width:60%;'>
              <h1>${this.headline}</h1>
              <hr/>
              <h2>${this.content}</h2>
              <button onclick="this.getRootNode().host.click()">Button</button>
              <img src='https://emberjs.com/images/tomsters/a11y-tomster750w-2137b8b891485dd920ccf5c0d5d1645d.png'></img>
            </div>`;
  }
}
