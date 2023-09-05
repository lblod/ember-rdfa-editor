export * from 'prosemirror-keymap';
import { Decoration } from 'prosemirror-view';

export { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';

export {
  default as ProseMirror,
  type PluginConfig,
} from '@lblod/ember-rdfa-editor/core/say-editor';

export * from 'prosemirror-model';
export { Node as PNode, DOMParser as ProseParser } from 'prosemirror-model';

export * from 'prosemirror-state';
export { Plugin as ProsePlugin } from 'prosemirror-state';

export * from 'prosemirror-view';

export * from 'prosemirror-transform';

export * from 'prosemirror-inputrules';

export type InlineDecorationSpec = NonNullable<
  Parameters<typeof Decoration.inline>[3]
>;

export { default as SayView } from '@lblod/ember-rdfa-editor/core/say-view';
export { default as SayController } from '@lblod/ember-rdfa-editor/core/say-controller';
