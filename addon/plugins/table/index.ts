import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';

import { goToNextCell, tableEditing } from 'prosemirror-tables';

export { tableNodes } from './table-nodes';

export const tableMenu: WidgetSpec = {
  componentName: 'plugins/table/table-menu',
  desiredLocation: 'toolbarMiddle',
};
export const tablePlugin: Plugin = tableEditing({
  allowTableNodeSelection: false,
});

export const tableKeymap = keymap({
  Tab: goToNextCell(1),
  'Shift-Tab': goToNextCell(-1),
});

