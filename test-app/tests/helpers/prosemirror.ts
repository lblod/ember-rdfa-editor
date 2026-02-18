import { EditorState } from '@lblod/ember-rdfa-editor';
import type { ProsePlugin } from '@lblod/ember-rdfa-editor';
import { history, dropCursor } from '@lblod/ember-rdfa-editor';
import {
  blockRdfaWithConfig,
  docWithConfig,
  hard_break,
  horizontal_rule,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  bulletListWithConfig,
  bullet_list_input_rule,
  listItemWithConfig,
  orderedListWithConfig,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { inlineRdfaWithConfig } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { code } from '@lblod/ember-rdfa-editor/plugins/code/marks/code';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color';
import { inputRules, Schema } from '@lblod/ember-rdfa-editor';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
  space,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import { editableNodePlugin } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { rdfaInfoPlugin } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { removePropertiesOfDeletedNodes } from '@lblod/ember-rdfa-editor/plugins/remove-properties-of-deleted-nodes';
import { gapCursor } from '@lblod/ember-rdfa-editor/plugins/gap-cursor';
import { v4 as uuidv4 } from 'uuid';
import recreateUuidsOnPaste from '@lblod/ember-rdfa-editor/plugins/recreateUuidsOnPaste';
import { defaultAttributeValueGeneration } from '@lblod/ember-rdfa-editor/plugins/default-attribute-value-generation';

export const SAMPLE_SCHEMA = new Schema({
  nodes: {
    doc: docWithConfig({
      defaultLanguage: 'nl-BE',
      rdfaAware: true,
    }),
    paragraph,

    repaired_block: repairedBlockWithConfig({ rdfaAware: true }),

    list_item: listItemWithConfig(),
    ordered_list: orderedListWithConfig(),
    bullet_list: bulletListWithConfig(),
    placeholder,
    ...tableNodes({
      tableGroup: 'block',
      cellContent: 'block+',
    }),
    heading: headingWithConfig(),
    blockquote,

    horizontal_rule,
    code_block,

    text,

    image,

    hard_break,
    block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
    inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
  },
  marks: {
    code,
    em,
    strong,
    underline,
    strikethrough,
    subscript,
    superscript,
    highlight,

    color,
  },
});

export const SAMPLE_PLUGINS: ProsePlugin[] = [
  firefoxCursorFix(),
  chromeHacksPlugin(),
  lastKeyPressedPlugin,
  tablePlugin,
  tableKeymap,
  createInvisiblesPlugin(
    [space, hardBreak, paragraphInvisible, headingInvisible],
    {
      shouldShowInvisibles: false,
    },
  ),
  inputRules({
    rules: [
      bullet_list_input_rule(SAMPLE_SCHEMA.nodes.bullet_list),
      ordered_list_input_rule(SAMPLE_SCHEMA.nodes.ordered_list),
    ],
  }),
  editableNodePlugin(),
  dropCursor(),
  gapCursor(),
  history(),
  recreateUuidsOnPaste,
  defaultAttributeValueGeneration([
    {
      attribute: '__guid',
      generator() {
        return uuidv4();
      },
    },
    {
      attribute: '__rdfaId',
      generator() {
        return uuidv4();
      },
    },
  ]),
  removePropertiesOfDeletedNodes(),
  rdfaInfoPlugin(),
];

export interface NodeJsonSpec<S extends Schema = typeof SAMPLE_SCHEMA> {
  type: S extends Schema<infer X> ? X : never;
  attrs?: Record<string, unknown>;
  content?: NodeJsonSpec<S>[];
  text?: string;
}

export function makeState(
  docJson: NodeJsonSpec<typeof SAMPLE_SCHEMA>,
): EditorState {
  const schema = SAMPLE_SCHEMA;
  return EditorState.create({
    schema,
    plugins: SAMPLE_PLUGINS,
    doc: schema.nodeFromJSON(docJson),
  });
}
