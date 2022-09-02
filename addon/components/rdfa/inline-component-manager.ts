import Component from '@glimmer/component';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import { ActiveComponentEntry } from '@lblod/ember-rdfa-editor/model/inline-components/inline-components-registry';
import { ModelInlineComponent } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';

interface InlineComponentManagerArgs {
  controller: Controller;
}

export default class InlineComponentManager extends Component<InlineComponentManagerArgs> {
  constructor(parent: unknown, args: InlineComponentManagerArgs) {
    super(parent, args);
  }

  get inlineComponents(): ActiveComponentEntry[] {
    console.log('GET ICs');
    console.log(this.args.controller);
    const result =
      this.args.controller?.currentState.inlineComponentsRegistry
        .activeComponents ||
      new Map<ModelInlineComponent, ActiveComponentEntry>();
    return [...result.values()];
  }
}
