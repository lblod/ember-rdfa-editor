import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { MarkSpec } from 'prosemirror-model';

export const superscript: MarkSpec = {
  excludes: 'superscript subscript',
  parseDOM: [{ tag: 'sup' }],
  toDOM() {
    return ['sup', 0];
  },
};

export const superscriptWidget: WidgetSpec = {
  componentName: 'plugins/superscript/button',
  desiredLocation: 'toolbarMiddle',
};
