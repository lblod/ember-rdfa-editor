import { MarkSpec, NodeSpec } from 'prosemirror-model';
import { Plugin as ProsePlugin } from 'prosemirror-state';
import { NodeViewConstructor } from 'prosemirror-view';
import { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';

export interface NodeConfig {
  name: string;
  spec: NodeSpec;
  view?: NodeViewConstructor;
}

export interface MarkConfig {
  name: string;
  spec: MarkSpec;
}

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

  proseMirrorPlugins(): ProsePlugin[] {
    return [];
  }
}
