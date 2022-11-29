import RdfaEditorPlugin, {
  MarkConfig,
} from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import {WidgetSpec} from "@lblod/ember-rdfa-editor/core/prosemirror";

export default class CodeMarkPlugin extends RdfaEditorPlugin {
  widgets(): WidgetSpec[] {
    return [
      {
        componentName: 'code-mark-plugin/toolbar-button',
        desiredLocation: 'toolbarMiddle',
      },
    ];
  }

  marks(): MarkConfig[] {
    return [
      {
        name: 'code',
        spec: {
          parseDOM: [{ tag: 'code' }],
          toDOM() {
            return ['code', 0];
          },
        },
      },
    ];
  }
}
