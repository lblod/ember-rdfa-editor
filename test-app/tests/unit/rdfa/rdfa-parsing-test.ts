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
  EditorState,
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
import type {
  IncomingTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { findNodesBySubject } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { isSome, unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import {
  SayDataFactory,
  sayDataFactory,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { testEditor } from 'test-app/tests/helpers/say-editor';
import { builders } from 'prosemirror-test-builder';

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
const testBuilders = builders(schema);

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

  test('it should parse rdfa-ids correctly', function (assert): void {
    const { controller } = testEditor(schema, plugins);
    const htmlContent = `
      <div
        class="say-editable say-block-rdfa"
        about="http://example.com/c3d0f3a2-1314-4686-aa30-f46fd1f988f7"
        data-say-id="c3d0f3a2-1314-4686-aa30-f46fd1f988f7"
      >
        <div
          style="display: none"
          class="say-hidden"
          data-rdfa-container="true"
        >
          <span property="ext:content" content="test" lang="nl-be"></span>
        </div>
        <div data-content-container="true">
            <p class="say-paragraph"></p>
        </div>
      </div>
      <div
        class="say-editable say-block-rdfa"
        data-label="literal"
        about="http://example.com/c3d0f3a2-1314-4686-aa30-f46fd1f988f7"
        property="ext:toLiteral"
        lang="nl-be"
        data-literal-node="true"
        data-say-id="f6a0b16d-0b7f-4c27-8111-a7ebf12ab103"
      >
        <div
          style="display: none"
          class="say-hidden"
          data-rdfa-container="true"
        >
        </div>
        <div data-content-container="true">
          <p class="say-paragraph">Some content</p>
        </div>
      </div>
    `;
    console.log('HTML Content: ', htmlContent);
    controller.initialize(htmlContent);
    const { doc } = controller.mainEditorState;
    console.log('Doc: ', doc);

    const resourceNode = findNodesBySubject(
      doc,
      'http://example.com/c3d0f3a2-1314-4686-aa30-f46fd1f988f7',
    )[0].value;
    assert.deepEqual(
      resourceNode.attrs['__rdfaId'],
      'c3d0f3a2-1314-4686-aa30-f46fd1f988f7',
    );
    const properties = resourceNode.attrs['properties'] as OutgoingTriple[];
    assert.strictEqual(properties.length, 2);
    const propertyToLiteralNode = properties.find(
      (prop) => prop.object.termType === 'LiteralNode',
    );
    assert.true(isSome(propertyToLiteralNode));
    assert.strictEqual(
      propertyToLiteralNode!.object.value,
      'f6a0b16d-0b7f-4c27-8111-a7ebf12ab103',
    );
  });
  test('it should parse a literal with multiple backlinks correctly', function (assert): void {
    // this is the new part, serializing an extra backlink from a literalNode in
    // the rdfaContainer
    const hiddenBacklinkHtml = `<span data-literal-node="true" data-say-id="d601c3e1-5065-4bb4-bcb0-44e3636669d8" about="http://test/2" property="http://test/testPred" datatype="" lang="" content="value"></span>`;
    const initialRender = `
    <div
      class="say-editable say-block-rdfa"
      about="http://test/1"
      data-say-id="07080c42-c2a0-4b5b-b808-37808d98294c"
    >
      <div
        style="display: none"
        class="say-hidden"
        data-rdfa-container="true"
      ></div>
      <div data-content-container="true">
        <div
          class="say-editable say-block-rdfa"
          about="http://test/1"
          property="http://test/testPred"
          datatype=""
          lang=""
          data-literal-node="true"
          data-say-id="d601c3e1-5065-4bb4-bcb0-44e3636669d8"
        >
          <div
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
          >
          ${hiddenBacklinkHtml}
          </div>
          <div data-content-container="true">
            <p class="say-paragraph">value</p>
          </div>
        </div>
      </div>
    </div>
    <div
      class="say-editable say-block-rdfa"
      about="http://test/2"
      data-say-id="9dce8308-cbf4-4e87-9abd-4c336393940f"
    >
      <div
        style="display: none"
        class="say-hidden"
        data-rdfa-container="true"
      ></div>
      <div data-content-container="true"><p class="say-paragraph"></p></div>
    </div> `;

    console.log('html', initialRender);
    const { controller } = testEditor(schema, plugins);
    controller.initialize(initialRender);
    const initialParse = controller.mainEditorState.doc;
    const { doc, block_rdfa, paragraph } = testBuilders;
    const df = new SayDataFactory();
    const expectedDoc = doc(
      {},
      block_rdfa(
        {
          rdfaNodeType: 'resource',
          subject: 'http://test/1',
          __rdfaId: '07080c42-c2a0-4b5b-b808-37808d98294c',
          properties: [
            {
              predicate: 'http://test/testPred',
              object: df.literalNode('d601c3e1-5065-4bb4-bcb0-44e3636669d8'),
            },
          ] satisfies OutgoingTriple[],
        },
        block_rdfa(
          {
            rdfaNodeType: 'literal',
            __rdfaId: 'd601c3e1-5065-4bb4-bcb0-44e3636669d8',
            backlinks: [
              {
                predicate: 'http://test/testPred',
                // it may seem weird these are literalnode relationships, but
                // it's because they need to store datatype and language
                subject: df.literalNode('http://test/1'),
              },
              // this is the new part, supporting multiple backlinks
              {
                predicate: 'http://test/testPred',
                subject: df.literalNode('http://test/2'),
              },
            ] satisfies IncomingTriple[],
          },
          paragraph('value'),
        ),
      ),
      block_rdfa(
        {
          rdfaNodeType: 'resource',
          subject: 'http://test/2',
          __rdfaId: '9dce8308-cbf4-4e87-9abd-4c336393940f',
          properties: [
            // this is also new, a second resource node pointing to the same
            // literal
            {
              predicate: 'http://test/testPred',
              object: df.literalNode('d601c3e1-5065-4bb4-bcb0-44e3636669d8'),
            },
          ] satisfies OutgoingTriple[],
        },
        paragraph(''),
      ),
    );
    // we need a bit more nesting for the assert
    QUnit.dump.maxDepth = 10;
    assert.propEqual(
      initialParse.toJSON(),
      expectedDoc.toJSON(),
      'html should get parsed correctly',
    );
    const secondRender = controller.htmlContent;
    controller.initialize(secondRender);
    const secondParse = controller.mainEditorState.doc;
    assert.propEqual(
      secondParse.toJSON(),
      expectedDoc.toJSON(),
      'second render should give a stable doc',
    );
    const thirdRender = controller.htmlContent;
    controller.initialize(thirdRender);
    const thirdParse = controller.mainEditorState.doc;
    assert.propEqual(
      thirdParse.toJSON(),
      expectedDoc.toJSON(),
      'third render should give a stable doc',
    );
  });
  test('literal nodes without relationships should stay in the doc across renders', function (assert) {
    const { doc, block_rdfa, paragraph } = testBuilders;
    const initialState = doc(
      {},
      block_rdfa(
        { rdfaNodeType: 'literal', __rdfaId: 'test-id' },
        paragraph('value'),
      ),
    );
    const state = EditorState.create({ schema, plugins, doc: initialState });
    const { controller } = testEditor(schema, plugins, state);
    const initialRender = controller.htmlContent;
    controller.initialize(initialRender);
    const secondState = controller.mainEditorState.doc;
    assert.propEqual(secondState.toJSON(), initialState.toJSON());
  });
});
