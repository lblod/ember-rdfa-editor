export * from 'prosemirror-keymap';
import { isFullUri, isPrefixedUri } from '@lblod/marawa/rdfa-helpers';
import { Decoration } from 'prosemirror-view';
import { type CurieOptions, string } from 'yup';
import { addMethod } from 'yup';
import { isNone } from './utils/_private/option';

export {
  getRdfaAttrs,
  rdfaAttrs,
  rdfaAttrSpec,
} from '#root/core/schema';
export type { RdfaAttrs } from '#root/core/schema';

export {
  default as ProseMirror,
  type PluginConfig,
} from '#root/core/say-editor';

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

export { default as SayView } from '#root/core/say-view';
export { default as SayController } from '#root/core/say-controller';
addMethod(
  string,
  'curie',
  function curie({ allowEmpty = false }: CurieOptions = {}) {
    return this.test(
      'is-curie',
      '${path} is not a valid CURIE',
      (value?: string) => {
        if (isNone(value)) {
          return false;
        }

        if (allowEmpty && value.length === 0) {
          return true;
        }
        return isFullUri(value) || isPrefixedUri(value);
      },
    );
  },
);
