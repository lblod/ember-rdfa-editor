import { oneLineTrim } from 'common-tags';
import { module, test } from 'qunit';
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
  PNode,
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
import {
  findChildrenByAttr,
  type NodeWithPos,
} from '@curvenote/prosemirror-utils';
import { testEditor } from 'dummy/tests/utils/editor';
import type {
  IncomingTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

const schema = new Schema({
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
    ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
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
  editableNodePlugin(),
];
const rdf = (suffix: string) =>
  `http://www.w3.org/1999/02/22-rdf-syntax-ns#${suffix}`;
const prov = (suffix: string) => `http://www.w3.org/ns/prov#${suffix}`;

function findNodeById(doc: PNode, id: string): NodeWithPos {
  const result = findChildrenByAttr(
    doc,
    (attrs) => attrs['__rdfaId'] === id,
    true,
  );
  if (result.length > 1) {
    throw new Error(
      'should never have more than one one with the same rdfa id',
    );
  } else if (result.length === 0) {
    throw new Error('node not found');
  }
  return result[0];
}

module('rdfa | parsing', function () {
  test('it should convert rdfa correctly', function (assert) {
    const { controller } = testEditor(schema, plugins);
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
    const { node: decisionNode } = findNodeById(
      doc,
      '727c6ea9-b15f-4c64-be4e-f1b666ed78fb',
    );
    const actualProps = decisionNode.attrs['properties'] as
      | OutgoingTriple[]
      | undefined;
    const actualBacklinks = decisionNode.attrs['backlinks'] as
      | IncomingTriple[]
      | undefined;
    const expectedProps: OutgoingTriple[] = [
      {
        object: sayDataFactory.namedNode('besluit:Besluit'),
        predicate: rdf('type'),
      },
      {
        predicate: prov('value'),
        object: sayDataFactory.literalNode(
          'ef0c2983-ccd9-4924-a640-42d2426a77bf',
        ),
      },
    ];
    const expectedBacklinks: IncomingTriple[] = [];

    assert.deepEqual(actualProps, expectedProps);
    assert.deepEqual(actualBacklinks, expectedBacklinks);

    const { node: valueNode } = findNodeById(
      doc,
      'ef0c2983-ccd9-4924-a640-42d2426a77bf',
    );
    const valueProps = valueNode.attrs['properties'] as
      | OutgoingTriple[]
      | undefined;
    const valueBacklinks = valueNode.attrs['backlinks'] as
      | IncomingTriple[]
      | undefined;
    const expectedValueProps: OutgoingTriple[] = [];
    const expectedValueBacklinks: IncomingTriple[] = [
      {
        subject: sayDataFactory.resourceNode('http://test/1'),
        predicate: prov('value'),
      },
    ];
    assert.deepEqual(valueProps, expectedValueProps, 'valueProps');
    assert.deepEqual(valueBacklinks, expectedValueBacklinks, 'valueBacklinks');
  });

  test('it should convert rdfa with property spans correctly', function (assert): void {
    const { controller } = testEditor(schema, plugins);
    const htmlContent = oneLineTrim`
    <div resource="http://test/1"
         __rdfaid="727c6ea9-b15f-4c64-be4e-f1b666ed78fb"
         __tag="div"
         class="say-editable">
        <span style="display: none">
          <span property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type" content="ext:BesluitNieuweStijl"></span>
          <span property="eli:language" content="http://publications.europa.eu/resource/authority/language/NLD"></span>
        </span>
        <span>
          <p data-indentation-level="0"> H   </p>
          <div __rdfaid="ef0c2983-ccd9-4924-a640-42d2426a77bf"
               __tag="div"
               class="say-editable"
               property="http://www.w3.org/ns/prov#value"
               about="http://test/1"
               >
               <span style="display: none">

</span>
               <span><p data-indentation-level="0">test</p></span>
         </div>
       </span>
   </div>
    `;
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;
    const { node: decisionNode } = findNodeById(
      doc,
      '727c6ea9-b15f-4c64-be4e-f1b666ed78fb',
    );
    const actualProps = decisionNode.attrs['properties'] as
      | OutgoingTriple[]
      | undefined;
    const actualBacklinks = decisionNode.attrs['backlinks'] as
      | IncomingTriple[]
      | undefined;

    const expectedProps: OutgoingTriple[] = [
      {
        object: sayDataFactory.namedNode('ext:BesluitNieuweStijl'),
        predicate: rdf('type'),
      },
      {
        object: sayDataFactory.namedNode(
          'http://publications.europa.eu/resource/authority/language/NLD',
        ),
        predicate: 'eli:language',
      },
      {
        object: sayDataFactory.literalNode(
          'ef0c2983-ccd9-4924-a640-42d2426a77bf',
        ),

        predicate: prov('value'),
      },
    ];
    const expectedBacklinks: IncomingTriple[] = [];

    assert.deepEqual(actualProps, expectedProps);
    assert.deepEqual(actualBacklinks, expectedBacklinks);

    const { node: valueNode } = findNodeById(
      doc,
      'ef0c2983-ccd9-4924-a640-42d2426a77bf',
    );
    const valueProps = valueNode.attrs['properties'] as
      | OutgoingTriple[]
      | undefined;
    const valueBacklinks = valueNode.attrs['backlinks'] as
      | IncomingTriple[]
      | undefined;
    const expectedValueProps: OutgoingTriple[] = [];
    const expectedValueBacklinks: IncomingTriple[] = [
      {
        subject: sayDataFactory.resourceNode('http://test/1'),
        predicate: prov('value'),
      },
    ];
    assert.deepEqual(valueProps, expectedValueProps, 'valueProps');
    assert.deepEqual(valueBacklinks, expectedValueBacklinks, 'valueBacklinks');
  });
});
