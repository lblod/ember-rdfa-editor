import { action } from '@ember/object';
import Component from '@glimmer/component';
import InlineComponentController from '@lblod/ember-rdfa-editor/core/model/inline-components/inline-component-controller';

type CounterArgs = {
  componentController: InlineComponentController;
};

export default class InlineComponentsPluginCounter extends Component<CounterArgs> {
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
