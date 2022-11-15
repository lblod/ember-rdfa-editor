import { action } from '@ember/object';
import Component from '@glimmer/component';
import InlineComponentController from '@lblod/ember-rdfa-editor/model/inline-components/inline-component-controller';

type CounterArgs = {
  componentController: InlineComponentController;
};

export default class InlineComponentsPluginCounter extends Component<CounterArgs> {
  get componentController() {
    return this.args.componentController;
  }

  @action
  click() {
    this.componentController.setProperty('count', this.count + 1);
  }

  get count() {
    return this.componentController.getProperty('count') as number;
  }
}
