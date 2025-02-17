import type Owner from '@ember/owner';

import { type Plugin as ProsePlugin } from 'prosemirror-state';
import { history } from 'prosemirror-history';
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
import { rdfaInfoPlugin } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { removePropertiesOfDeletedNodes } from '@lblod/ember-rdfa-editor/plugins/remove-properties-of-deleted-nodes';
import { dropCursor } from 'prosemirror-dropcursor';
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
];
// the SayEditor class adds a few always-on plugins, which
// we won't get in test-utils that don't need to make an instance
// of the SayEditor class
//
// This is clunky, and points at the class being a codesmell, but it's how it
// works atm
export const SAMPLE_PLUGINS_WITH_CORE: ProsePlugin[] = [
  ...SAMPLE_PLUGINS,
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
