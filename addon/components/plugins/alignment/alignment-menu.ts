import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  ALIGNMENT_OPTIONS,
  type AlignmentOption,
  DEFAULT_ALIGNMENT,
} from '@lblod/ember-rdfa-editor/plugins/alignment';
import { setAlignment } from '@lblod/ember-rdfa-editor/plugins/alignment/commands';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller?: SayController;
};
export default class AlignmentMenu extends Component<Args> {
  @service declare intl: IntlService;
  options = ALIGNMENT_OPTIONS;

  get controller() {
    return this.args.controller;
  }

  get currentAlignment() {
    if (this.controller) {
      const { selection } = this.controller.mainEditorState;
      const anchorAlignment = selection.$anchor.parent.attrs['alignment'] as
        | AlignmentOption
        | undefined;
      return anchorAlignment ?? DEFAULT_ALIGNMENT;
    } else {
      return DEFAULT_ALIGNMENT;
    }
  }

  get enabled() {
    return this.controller?.checkCommand(setAlignment({ option: 'left' }));
  }

  setAlignment = (option: AlignmentOption) => {
    this.controller?.doCommand(setAlignment({ option }));
  };

  labelFor = (option: AlignmentOption) => {
    return this.intl.t(`ember-rdfa-editor.alignment.options.${option}`);
  };
}
