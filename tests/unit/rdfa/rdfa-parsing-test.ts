import { oneLineTrim } from 'common-tags';
import { module, test } from 'qunit';
import Owner from '@ember/owner';
import {
  block_rdfa,
  docWithConfig,
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
  PluginConfig,
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
import { findChildrenByAttr } from '@curvenote/prosemirror-utils';

const schema = new Schema({
  nodes: {
    doc: docWithConfig({
      defaultLanguage: 'nl-BE',
    }),
    paragraph,

    repaired_block,

    list_item,
    ordered_list,
    bullet_list,
    placeholder,
    ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
    heading,
    blockquote,

    horizontal_rule,
    code_block,

    text,

    image,

    hard_break,
    block_rdfa,
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
const plugins: PluginConfig = [
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
      bullet_list_input_rule(schema.nodes.bullet_list),
      ordered_list_input_rule(schema.nodes.ordered_list),
    ],
  }),
  editableNodePlugin,
];
const rdf = (suffix: string) =>
  `http://www.w3.org/1999/02/22-rdf-syntax-ns#${suffix}`;
const prov = (suffix: string) => `http://www.w3.org/ns/prov#${suffix}`;
module('rdfa | parsing', function () {
  test('it should convert rdfa correctly', function (assert) {
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
    const htmlContent = oneLineTrim`
    <div resource="http://test/1"
         __rdfaid="727c6ea9-b15f-4c64-be4e-f1b666ed78fb"
         __tag="div"
         class="say-editable">
         <span style="display: none">
           <span property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                 content="besluit:Besluit">
          </span>
        </span>
        <span>
          <p data-indentation-level="0"> H   </p>
          <div __rdfaid="ef0c2983-ccd9-4924-a640-42d2426a77bf"
               __tag="div"
               property="http://www.w3.org/ns/prov#value"
               about="http://test/1"
               class="say-editable">
               <span style="display: none"></span>
               <span><p data-indentation-level="0">test</p></span>
         </div>
       </span>
   </div>
    `;
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;
    const [{ node: decisionNode }] = findChildrenByAttr(
      doc,
      (attrs) => attrs.__rdfaId === '727c6ea9-b15f-4c64-be4e-f1b666ed78fb',
      true,
    );
    const actualProps: unknown = decisionNode.attrs.properties;
    const actualBacklinks: unknown = decisionNode.attrs.backlinks;
    const expectedProps = {
      [rdf('type')]: {
        object: 'besluit:Besluit',
        predicate: rdf('type'),
        type: 'attr',
      },
      [prov('value')]: {
        nodeId: 'ef0c2983-ccd9-4924-a640-42d2426a77bf',
        object: 'test',
        predicate: prov('value'),
        type: 'node',
      },
    };
    const expectedBacklinks = {};

    assert.deepEqual(actualProps, expectedProps);
    assert.deepEqual(actualBacklinks, expectedBacklinks);

    const [{ node: valueNode }] = findChildrenByAttr(
      doc,
      (attrs) => attrs.__rdfaId === 'ef0c2983-ccd9-4924-a640-42d2426a77bf',
      true,
    );
    const valueProps: unknown = valueNode.attrs.properties;
    const valueBacklinks: unknown = valueNode.attrs.backlinks;
    const expectedValueProps = {};
    const expectedValueBacklinks = {
      [prov('value')]: {
        subjectId: '727c6ea9-b15f-4c64-be4e-f1b666ed78fb',
        subject: 'http://test/1',
        predicate: prov('value'),
      },
    };
    assert.deepEqual(valueProps, expectedValueProps, 'valueProps');
    assert.deepEqual(valueBacklinks, expectedValueBacklinks, 'valueBacklinks');
  });
});
