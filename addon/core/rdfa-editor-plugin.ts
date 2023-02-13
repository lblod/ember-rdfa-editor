import { MarkSpec, NodeSpec } from 'prosemirror-model';
import { Plugin as ProsePlugin } from 'prosemirror-state';
import { NodeViewConstructor } from 'prosemirror-view';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { Keymap } from '@lblod/ember-rdfa-editor/core/keymap';

/**
 *
 * @deprecated NodeConfig is deprecated and will be removed in version 3.0.
 */
export interface NodeConfig {
  name: string;
  spec: NodeSpec;
  view?: NodeViewConstructor;
}

/**
 *
 * @deprecated MarkConfig is deprecated and will be removed in version 3.0.
 */
export interface MarkConfig {
  name: string;
  spec: MarkSpec;
}

/**
 *
 * @deprecated RdfaEditor plugins are deprecated and will be removed in version 3.0.
 */
export default abstract class RdfaEditorPlugin {
  options: unknown;

  initialize(options?: unknown): Promise<void> | void {
    this.options = options;
  }

  nodes(): NodeConfig[] {
    return [];
  }

  marks(): MarkConfig[] {
    return [];
  }

  widgets(): WidgetSpec[] {
    return [];
  }

  keymaps(): Keymap[] {
    return [];
  }

  proseMirrorPlugins(): ProsePlugin[] {
    return [];
  }
}
