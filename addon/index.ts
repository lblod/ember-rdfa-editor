export * from 'prosemirror-keymap';
import { Decoration } from 'prosemirror-view';

export { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';

export {
  WidgetSpec,
  ProseController,
  default as ProseMirror,
  WidgetLocation,
} from '@lblod/ember-rdfa-editor/core/prosemirror';

export * from 'prosemirror-model';
export { Node as PNode, DOMParser as ProseParser } from 'prosemirror-model';

export * from 'prosemirror-state';
export { Plugin as ProsePlugin } from 'prosemirror-state';

export * from 'prosemirror-view';

export * from 'prosemirror-commands';

export * from 'prosemirror-transform';

export * from 'prosemirror-history';

export type InlineDecorationSpec = NonNullable<
  Parameters<typeof Decoration.inline>[3]
>;
