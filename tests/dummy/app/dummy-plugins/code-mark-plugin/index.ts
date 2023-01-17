import { MarkSpec, WidgetSpec } from '@lblod/ember-rdfa-editor';

export const codeMarkButton: WidgetSpec = {
  componentName: 'code-mark-plugin/toolbar-button',
  desiredLocation: 'toolbarMiddle',
};

export const code: MarkSpec = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return ['code', 0];
  },
};
