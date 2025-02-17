import { oneLineTrim } from 'common-tags';
import { module, test } from 'qunit';
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
import { testEditor } from '../../utils/editor';
import type {
  IncomingTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { findNodesBySubject } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

const schema = new Schema({
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
    heading: headingWithConfig({ rdfaAware: true }),
    blockquote,

    horizontal_rule,
    code_block,

    text,

    image,

    hard_break,
    block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
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
    <div resource="http://test/1" class="say-editable">
         <span style="display: none">
           <span property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                 resource="besluit:Besluit">
          </span>
        </span>
        <span>
          <p data-indentation-level="0"> H   </p>
          <div property="http://www.w3.org/ns/prov#value"
               class="say-editable">
               <span style="display: none"></span>
               <span><p data-indentation-level="0">test</p></span>
         </div>
       </span>
   </div>
    `;
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;
    const decisionNode = findNodesBySubject(doc, 'http://test/1')[0].value;
    const actualProps = decisionNode.attrs['properties'] as OutgoingTriple[];
    const actualBacklinks = decisionNode.attrs['backlinks'] as IncomingTriple[];

    assert.strictEqual(actualProps.length, 2);
    assert.deepArrayContains(actualProps, {
      object: sayDataFactory.namedNode('besluit:Besluit'),
      predicate: rdf('type'),
    });

    const expectedBacklinks: IncomingTriple[] = [];
    assert.deepEqual(actualBacklinks, expectedBacklinks);

    const propertyToLiteralNode = actualProps.find(
      (prop) => prop.object.termType === 'LiteralNode',
    );
    assert.ok(propertyToLiteralNode);

    const contentId = unwrap(propertyToLiteralNode).object.value;

    const { node: valueNode } = findNodeById(doc, contentId);
    const valueProps = valueNode.attrs['properties'] as OutgoingTriple[];
    const valueBacklinks = valueNode.attrs['backlinks'] as IncomingTriple[];
    const expectedValueProps: OutgoingTriple[] = [];
    const expectedValueBacklinks = [
      {
        subject: sayDataFactory.literalNode('http://test/1'),
        predicate: prov('value'),
      },
    ];
    assert.deepEqual(valueProps, expectedValueProps, 'valueProps');
    assert.deepEqual(valueBacklinks, expectedValueBacklinks, 'valueBacklinks');
  });

  test('it should convert rdfa with property spans correctly', function (assert): void {
    const { controller } = testEditor(schema, plugins);
    const htmlContent = oneLineTrim`
    <div resource="http://test/1" class="say-editable">
        <span style="display: none">
          <span property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type" resource="ext:BesluitNieuweStijl"></span>
          <span property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD"></span>
        </span>
        <span>
          <p data-indentation-level="0"> H   </p>
          <div class="say-editable"
               property="http://www.w3.org/ns/prov#value"
               >
               <span style="display: none"></span>
               <span><p data-indentation-level="0">test</p></span>
         </div>
       </span>
   </div>
    `;
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;
    const decisionNode = findNodesBySubject(doc, 'http://test/1')[0].value;
    const actualProps = decisionNode.attrs['properties'] as OutgoingTriple[];
    const actualBacklinks = decisionNode.attrs['backlinks'] as IncomingTriple[];
    assert.strictEqual(actualProps.length, 3);

    const expectedBacklinks: IncomingTriple[] = [];
    assert.deepArrayContains(actualProps, {
      object: sayDataFactory.namedNode('ext:BesluitNieuweStijl'),
      predicate: rdf('type'),
    });
    assert.deepArrayContains(actualProps, {
      object: sayDataFactory.namedNode(
        'http://publications.europa.eu/resource/authority/language/NLD',
      ),
      predicate: 'eli:language',
    });

    assert.deepEqual(actualBacklinks, expectedBacklinks);

    const propertyToLiteralNode = actualProps.find(
      (prop) => prop.object.termType === 'LiteralNode',
    );
    assert.ok(propertyToLiteralNode);

    const contentId = unwrap(propertyToLiteralNode).object.value;

    const { node: valueNode } = findNodeById(doc, contentId);
    const valueProps = valueNode.attrs['properties'] as OutgoingTriple[];
    const valueBacklinks = valueNode.attrs['backlinks'] as IncomingTriple[];
    const expectedValueProps: OutgoingTriple[] = [];
    const expectedValueBacklinks = [
      {
        subject: sayDataFactory.literalNode('http://test/1'),
        predicate: prov('value'),
      },
    ];
    assert.deepEqual(valueProps, expectedValueProps, 'valueProps');
    assert.deepEqual(valueBacklinks, expectedValueBacklinks, 'valueBacklinks');
  });
});
