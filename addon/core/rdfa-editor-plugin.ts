import { MarkSpec, NodeSpec } from 'prosemirror-model';
import { Plugin as ProsePlugin } from 'prosemirror-state';
import { NodeViewConstructor } from 'prosemirror-view';
import { WidgetSpec } from './controllers/controller';

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

  constructor(options: unknown) {
    this.options = options;
  }

  initialize(options?: unknown): Promise<void> | void {
    this.options = options;
  }

  abstract nodes?(): NodeConfig[];

  abstract marks?(): MarkConfig[];

  abstract widgets?(): WidgetSpec[];

  abstract proseMirrorPlugins?(): ProsePlugin[];
}
