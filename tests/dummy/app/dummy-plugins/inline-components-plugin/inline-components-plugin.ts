import RdfaEditorPlugin, {
  NodeConfig,
} from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import cardConfig from './inline-component-models/card';
import counterConfig from './inline-component-models/counter';
import dropdownConfig from './inline-component-models/dropdown';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';

export default class InlineComponentsPlugin extends RdfaEditorPlugin {
  widgets(): WidgetSpec[] {
    return [
      {
        componentName: 'inline-components-plugin/rdfa-ic-plugin-insert',
        desiredLocation: 'insertSidebar',
      },
    ];
  }

  nodes(): NodeConfig[] {
    return [dropdownConfig, counterConfig, cardConfig];
  }
}
