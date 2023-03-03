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
    const currentColor = this.colors.find(this.colorIsActive);
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

  colorIsActive = (color: string) => {
    return this.isActive() === color;
  };

  isActive = () => {
    if (this.controller) {
      const state = this.controller.mainEditorState;
      const { selection } = state;
      const marks = state.storedMarks;

      if (marks?.length) {
        const color = Object.values(marks).find((item) => {
          return item.type.name === 'color';
        })?.attrs?.color as string;

        return color || 'black';
      } else {
        let node;

        if (selection instanceof TextSelection) {
          node = this.controller.mainEditorState.doc.nodeAt(
            selection.$from.pos
          );
        }

        if (node === null && selection.$from.parentOffset > 0) {
          node = this.controller.mainEditorState.doc.nodeAt(
            selection.$from.pos - 1
          );
        }

        const color = Object.values(node?.marks || {}).find((item) => {
          return item.type.name === 'color';
        })?.attrs?.color as string;

        return color || 'black';
      }
    }

    return '';
  };
}
