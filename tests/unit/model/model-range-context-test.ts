import { module, test } from 'qunit';
import { XmlReaderResult } from '@lblod/ember-rdfa-editor/model/readers/xml-reader';
import ModelRange, {
  RangeContextStrategy,
} from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';

module('Unit | model | model-range | contextNodes', () => {
  //language=XML
  const testDoc: XmlReaderResult = vdom`
    <modelRoot>
      <div __id="emptyDiv"/>
      <div __id="div1">
        <text __id="text1">test</text>
      </div>
      <div __id="div2">
        <text __id="text2">test</text>
        <text __id="text3">test</text>
      </div>
      <div __id="div3">
        <text __id="text4">test</text>
        <br/>
        <text __id="text5">test</text>
      </div>
      <div __id="div4">
        <text __id="text6">test</text>
        <br/>
        <span __id="span1">
          <text __id="text7">test</text>
        </span>
      </div>
      <div __id="div5">
        <span __id="span2">
          <text __id="text8">test</text>
        </span>
        <br/>
        <span __id="span3">
          <text __id="text9">test</text>
        </span>
      </div>
    </modelRoot>
  `;
  const { root, textNodes, elements } = testDoc;
  const { text1, text2, text3, text4, text5, text6, text7, text8, text9 } =
    textNodes;
  const { emptyDiv, div1, div2, div3, div4, div5, span1, span2, span3 } =
    elements;

  const collapsedInText: ModelRange = ModelRange.fromInNode(text1, 1, 1);
  const collapsedBeforeText: ModelRange = ModelRange.fromInNode(div1, 0, 0);
  const collapsedAfterText: ModelRange = ModelRange.fromInNode(div1, 4, 4);
  const collapsedInEmpty: ModelRange = ModelRange.fromInNode(emptyDiv, 0, 0);
  const unCollapsedInText: ModelRange = ModelRange.fromInNode(text1, 1, 3);
  const aroundText: ModelRange = ModelRange.fromAroundNode(text1);
  const acrossTwoTextNodes: ModelRange = ModelRange.fromInNode(div2, 2, 6);
  const overLineBreak: ModelRange = ModelRange.fromInNode(div3, 2, 7);
  const endDeeperThanStart: ModelRange = new ModelRange(
    ModelPosition.fromInTextNode(text6, 2),
    ModelPosition.fromInTextNode(text7, 2)
  );
  const differentSubtrees: ModelRange = new ModelRange(
    ModelPosition.fromInTextNode(text8, 2),
    ModelPosition.fromInTextNode(text9, 2)
  );
  module(
    'Unit | model | model-range | contextNodes | isInside | sticky: none',
    () => {
      contextTest('collapsed in empty', collapsedInEmpty, 'rangeIsInside', [
        emptyDiv,
        root,
      ]);
      contextTest('collapsed in text', collapsedInText, 'rangeIsInside', [
        text1,
        div1,
        root,
      ]);

      contextTest(
        'collapsed before text',
        collapsedBeforeText,
        'rangeIsInside',
        [div1, root]
      );

      contextTest('collapsed after text', collapsedAfterText, 'rangeIsInside', [
        div1,
        root,
      ]);

      contextTest('uncollapsed in text', unCollapsedInText, 'rangeIsInside', [
        text1,
        div1,
        root,
      ]);

      contextTest('around text', aroundText, 'rangeIsInside', [div1, root]);

      contextTest(
        'across two text nodes',
        acrossTwoTextNodes,
        'rangeIsInside',
        [div2, root]
      );

      contextTest('over linebreak', overLineBreak, 'rangeIsInside', [
        div3,
        root,
      ]);

      contextTest(
        'end deeper than start',
        endDeeperThanStart,
        'rangeIsInside',
        [div4, root]
      );

      contextTest('different subtrees', differentSubtrees, 'rangeIsInside', [
        div5,
        root,
      ]);
    }
  );

  module(
    'Unit | model | model-range | contextNodes | isInside | sticky: start-both, end-both',
    () => {
      contextTest(
        'collapsed in empty',
        collapsedInEmpty,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [emptyDiv, root]
      );
      contextTest(
        'collapsed in text',
        collapsedInText,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [text1, div1, root]
      );

      contextTest(
        'collapsed before text',
        collapsedBeforeText,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [text1, div1, root]
      );

      contextTest(
        'collapsed after text',
        collapsedAfterText,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [text1, div1, root]
      );

      contextTest(
        'uncollapsed in text',
        unCollapsedInText,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [text1, div1, root]
      );

      contextTest(
        'around text',
        aroundText,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [text1, div1, root]
      );

      contextTest(
        'across two text nodes',
        acrossTwoTextNodes,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [div2, root]
      );

      contextTest(
        'over linebreak',
        overLineBreak,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [div3, root]
      );

      contextTest(
        'end deeper than start',
        endDeeperThanStart,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [div4, root]
      );

      contextTest(
        'different subtrees',
        differentSubtrees,
        {
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        },
        [div5, root]
      );
    }
  );
});

function contextTest(
  name: string,
  range: ModelRange,
  strategy: RangeContextStrategy,
  expectedNodes: ModelNode[]
) {
  return test(name, (assert) => {
    QUnit.dump.maxDepth = 2;
    const actualNodes = [...range.contextNodes(strategy)];
    assert.deepEqual(actualNodes, expectedNodes);
  });
}
