import { isFullUri, isPrefixedUri } from '@lblod/marawa/rdfa-helpers';
import { Decoration } from 'prosemirror-view';
import { type CurieOptions, string } from 'yup';
import { addMethod } from 'yup';
import { isNone } from './utils/_private/option.ts';

export { keydownHandler, keymap } from 'prosemirror-keymap';

export { getRdfaAttrs, rdfaAttrs, rdfaAttrSpec } from '#root/core/schema.ts';

export type { RdfaAttrs } from '#root/core/schema.ts';

export {
  default as ProseMirror,
  type PluginConfig,
} from '#root/core/say-editor.ts';

export type {
  AttributeSpec,
  Attrs,
  DOMOutputSpec,
  GenericParseRule,
  MarkSpec,
  NodeSpec,
  ParseOptions,
  ParseRule,
  SchemaSpec,
  StyleParseRule,
  TagParseRule,
} from 'prosemirror-model';

export {
  ContentMatch,
  DOMParser,
  DOMSerializer,
  Fragment,
  Mark,
  MarkType,
  Node,
  NodeRange,
  NodeType,
  ReplaceError,
  ResolvedPos,
  Schema,
  Slice,
} from 'prosemirror-model';

export type {
  Command,
  EditorStateConfig,
  PluginSpec,
  PluginView,
  SelectionBookmark,
  StateField,
} from 'prosemirror-state';

export {
  AllSelection,
  EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
  Selection,
  SelectionRange,
  TextSelection,
  Transaction,
} from 'prosemirror-state';

export type {
  DecorationAttrs,
  DecorationSource,
  DirectEditorProps,
  DOMEventMap,
  EditorProps,
  MarkViewConstructor,
  NodeView,
  NodeViewConstructor,
} from 'prosemirror-view';
export { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

export type { Mappable } from 'prosemirror-transform';

export {
  AddMarkStep,
  AddNodeMarkStep,
  AttrStep,
  canJoin,
  canSplit,
  DocAttrStep,
  dropPoint,
  findWrapping,
  insertPoint,
  joinPoint,
  liftTarget,
  Mapping,
  MapResult,
  RemoveMarkStep,
  RemoveNodeMarkStep,
  ReplaceAroundStep,
  replaceStep,
  ReplaceStep,
  Step,
  StepMap,
  StepResult,
  Transform,
} from 'prosemirror-transform';

export {
  closeDoubleQuote,
  closeSingleQuote,
  ellipsis,
  emDash,
  InputRule,
  inputRules,
  openDoubleQuote,
  openSingleQuote,
  smartQuotes,
  textblockTypeInputRule,
  undoInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules';
export { history } from 'prosemirror-history';
export { dropCursor } from 'prosemirror-dropcursor';

export { PNode, ProseParser, ProsePlugin } from '#root/prosemirror-aliases.ts';
export type InlineDecorationSpec = NonNullable<
  Parameters<typeof Decoration.inline>[3]
>;

export { default as SayView } from '#root/core/say-view.ts';
export { default as SayController } from '#root/core/say-controller.ts';
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
