import { Decoration } from 'prosemirror-view';

export {
  WidgetSpec,
  ProseController,
  default as ProseMirror,
  WidgetLocation,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
export * from 'prosemirror-model';
export { Node as PNode, DOMParser as ProseParser } from 'prosemirror-model';

export { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
export * from 'prosemirror-state';
export {
  Plugin as ProsePlugin,
  Selection,
  TextSelection,
  Command,
} from 'prosemirror-state';
export * from 'prosemirror-view';
export type InlineDecorationSpec = NonNullable<
  Parameters<typeof Decoration.inline>[3]
>;
