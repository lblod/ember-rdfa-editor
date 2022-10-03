import { action } from '@ember/object';
import Component from '@glimmer/component';
import InlineComponentController from '@lblod/ember-rdfa-editor/core/model/inline-components/inline-component-controller';

type InlineComponentsCounterArgs = {
  componentController: InlineComponentController;
};

export default class InlineComponentsCounter extends Component<InlineComponentsCounterArgs> {
  get componentController() {
    return this.args.componentController;
  }

  @action
  click() {
    this.componentController.setStateProperty('count', this.count + 1);
  }

  get count() {
    return (this.componentController.getStateProperty('count') as number) || 0;
  }
}
