import Component from '@glimmer/component';
import { action } from '@ember/object';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import { tracked } from '@glimmer/tracking';
import { SelectionChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';

interface Args {
  controller: Controller;
}

export default class SuperscriptButton extends Component<Args> {
  @tracked isSuperscript = false;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    this.args.controller.onEvent(
      'selectionChanged',
      this.updateProperties.bind(this)
    );
  }

  updateProperties(event: SelectionChangedEvent) {
    this.isSuperscript = event.payload.hasMark('superscript');
  }

  @action toggle() {
    this.setMark(!this.isSuperscript, 'superscript');
  }

  @action
  setMark(value: boolean, markName: string, attributes = {}) {
    if (value) {
      this.args.controller.executeCommand(
        'add-mark-to-selection',
        markName,
        attributes
      );
    } else {
      this.args.controller.executeCommand(
        'remove-mark-from-selection',
        markName,
        attributes
      );
    }
  }
}
