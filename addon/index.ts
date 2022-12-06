export {
  EmberInlineComponent,
  emberComponent,
} from '@lblod/ember-rdfa-editor/core/prosemirror';

export { WidgetSpec } from '@lblod/ember-rdfa-editor/core/prosemirror';
export { Node as PNode, NodeSpec, MarkSpec } from 'prosemirror-model';
export { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
export {
  Plugin as ProsePlugin,
  PluginKey,
  EditorState,
  Transaction,
} from 'prosemirror-state';
export {
  EditorView,
  DecorationSet,
  Decoration,
  NodeView,
  NodeViewConstructor,
} from 'prosemirror-view';
