import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';

import IntlService from 'ember-intl/services/intl';
import { TextSelection } from 'prosemirror-state';
import { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { tracked } from '@glimmer/tracking';

type Args = {
  controller?: SayController;
};
export default class Color extends Component<Args> {
  @service declare intl: IntlService;
  @tracked selectedColor = 'black';

  get controller() {
    return this.args.controller;
  }

  get currentStyle() {
    return this.setActiveColor();
  }

  @action
  onDone(selectedColorInfo: { _rgba: number[] }) {
    const rgba = selectedColorInfo._rgba;
    let color = 'rgba(';

    rgba.forEach((code, index) => {
      if (index === rgba.length - 1) {
        color += ` ${code})`;
      } else {
        color += ` ${code},`;
      }
    });

    this.setColorMark(color);
  }

  setColorMark(color: string) {
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
            return tr.addStoredMark(mark);
          });
        } else {
          this.controller.withTransaction((tr) => {
            return tr.addStoredMark(mark);
          });
        }
      } else {
        this.controller.withTransaction((tr) => {
          return tr.addMark($from.pos, $to.pos, mark);
        });
      }

      this.controller.focus();
    }
  }

  setActiveColor() {
    if (this.controller) {
      const state = this.controller.mainEditorState;
      const { selection } = state;
      const marks = state.storedMarks;
      const markType = state.schema.marks.color;

      if (marks?.length) {
        const markSet = markType.isInSet(marks);
        const color = markSet?.attrs?.color as Option<string>;

        this.selectedColor = color || 'black';
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

        const markSet = markType.isInSet(node?.marks || []);
        const color = markSet?.attrs?.color as Option<string>;

        this.selectedColor = color || 'black';
      }
    }

    return null;
  }
}
