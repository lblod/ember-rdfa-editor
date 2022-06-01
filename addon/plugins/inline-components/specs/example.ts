import {
  InlineComponentSpec,
  Properties,
  State,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';

export interface ExampleProps extends Properties {
  title: string;
  content: string;
}

export interface ExampleState extends State {
  contentVisible: boolean;
}
export default class ExampleSpec extends InlineComponentSpec {
  _renderStatic(props?: ExampleProps, _state?: State): string {
    const title = props?.title?.toString() || '';
    const content = props?.content?.toString() || '';
    return `
      <div>
        <h2>${title}</h2>
        <p>${content}</p>
      </div>
    `;
  }
  constructor() {
    super('inline-components/example-inline-component', 'span');
  }
}
