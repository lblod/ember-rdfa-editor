import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { MarkSpec } from 'prosemirror-model';

export const subscript: MarkSpec = {
  excludes: 'subscript superscript',
  parseDOM: [{ tag: 'sub' }],
  toDOM() {
    return ['sub', 0];
  },
};

export const subscriptWidget: WidgetSpec = {
  componentName: 'plugins/subscript/button',
  desiredLocation: 'toolbarMiddle',
};
