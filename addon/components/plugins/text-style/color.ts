import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';

import IntlService from 'ember-intl/services/intl';
import { TextSelection } from 'prosemirror-state';

type Args = {
  controller?: SayController;
};
export default class Color extends Component<Args> {
  @service declare intl: IntlService;
  colors = ['black', 'red', 'green', 'blue', 'orange'];

  get controller() {
    return this.args.controller;
  }

  get currentStyle() {
    const currentColor: string = this.isActive();
    if (currentColor) {
      return `${this.intl.t('ember-rdfa-editor.color')} ${currentColor}`;
    } else {
      return this.intl.t('ember-rdfa-editor.default-color');
    }
  }

  @action
  enableColor(color: string) {
    if (this.controller) {
      const state = this.controller.mainEditorState;
      const { selection } = state;
      const { $from, $to, $cursor } = selection as TextSelection;
      const markType = state.schema.marks.color;

      const mark = markType.create({ color });
      if (markType && $cursor) {
        if (markType.isInSet(state.storedMarks || $cursor.marks())) {
          this.controller.withTransaction((tr) => {
            tr.removeStoredMark(markType);
            return tr.addStoredMark(markType.create({ color }));
          });
        } else {
          this.controller.withTransaction((tr) => {
            return tr.addStoredMark(markType.create({ color }));
          });
        }
      } else {
        this.controller.withTransaction((tr) => {
          return tr.addMark($from.pos, $to.pos, mark);
        });
      }
    }
  }

  colorIsActive = (color?: string) => this.isActive() === color;

  isActive = (): string => {
    if (this.controller) {
      const { selection } = this.controller.mainEditorState;

      let node;

      if (selection instanceof TextSelection) {
        node = this.controller.mainEditorState.doc.nodeAt(selection.$from.pos);
      }

      if (node === null) {
        node = this.controller.mainEditorState.doc.nodeAt(
          selection.$from.pos - 2
        );
      }

      const hasMarks =
        node?.marks.length !== undefined && node?.marks.length > 0;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return hasMarks && node?.marks[node?.marks.length - 1].attrs.color;
    }

    return '';
  };
}
