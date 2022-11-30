import RdfaEditorPlugin, {
  NodeConfig,
} from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import { tableEditing, tableNodes } from 'prosemirror-tables';
import { Plugin } from 'prosemirror-state';
import { arrayFrom, map } from 'iter-tools';
import { NodeSpec } from 'prosemirror-model';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';

export default class TablePlugin extends RdfaEditorPlugin {
  nodes(): NodeConfig[] {
    return arrayFrom(
      map(
        ([name, spec]: [string, NodeSpec]) => ({ name, spec }),
        Object.entries(
          tableNodes({
            tableGroup: 'block',
            cellContent: 'inline+',
            cellAttributes: {},
          })
        )
      )
    );
  }

  widgets(): WidgetSpec[] {
    return [
      {
        componentName: 'plugins/table/table-menu',
        desiredLocation: 'toolbarMiddle',
      },
    ];
  }

  proseMirrorPlugins(): Plugin[] {
    return [tableEditing({ allowTableNodeSelection: false })];
  }
}
