import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { Plugin } from 'prosemirror-state';

import { tableEditing } from 'prosemirror-tables';

export { tableNodes } from './table-nodes';

export const tableMenu: WidgetSpec = {
  componentName: 'plugins/table/table-menu',
  desiredLocation: 'toolbarMiddle',
};
export const tablePlugin: Plugin = tableEditing({
  allowTableNodeSelection: false,
});
