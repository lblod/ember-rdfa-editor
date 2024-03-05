import type Owner from '@ember/owner';
import {
  block_rdfa,
  doc,
  hard_break,
  horizontal_rule,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  bullet_list,
  bullet_list_input_rule,
  list_item,
  ordered_list,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
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
import {
  inputRules,
  type PluginConfig,
  SayController,
  Schema,
} from '@lblod/ember-rdfa-editor';
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
import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import sinon from 'sinon';

export const SAMPLE_SCHEMA = new Schema({
  nodes: {
    doc: doc({
      defaultLanguage: 'nl-BE',
      rdfaAware: true,
    }),
    paragraph,

    repaired_block,

    list_item: list_item({ rdfaAware: true }),
    ordered_list: ordered_list({ rdfaAware: true }),
    bullet_list: bullet_list({ rdfaAware: true }),
    placeholder,
    ...tableNodes({
      tableGroup: 'block',
      cellContent: 'block+',
      rdfaAware: true,
    }),
    heading: heading({ rdfaAware: true }),
    blockquote,

    horizontal_rule,
    code_block,

    text,

    image,

    hard_break,
    block_rdfa: block_rdfa({ rdfaAware: true }),
  },
  marks: {
    inline_rdfa,
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
export const SAMPLE_PLUGINS: PluginConfig = [
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
];

export function testEditor(
  schema: Schema,
  plugins: PluginConfig,
): { editor: SayEditor; controller: SayController } {
  const mockOwner: Owner = {
    factoryFor: sinon.fake(),
    lookup: sinon.fake(),
    register: sinon.fake(),
  };
  const element = document.createElement('div');
  const editor = new SayEditor({
    owner: mockOwner,
    target: element,
    baseIRI: 'http://test.org',
    schema,
    plugins,
  });
  const controller = new SayController(editor);
  return { editor, controller };
}
