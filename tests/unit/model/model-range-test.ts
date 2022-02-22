import { module, test } from 'qunit';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { parseXml, vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { stackOverFlowOnGetMinimumConfinedRanges } from 'dummy/tests/unit/model/testing-vdoms';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import {
  elementHasType,
  nodeIsElementOfType,
} from '@lblod/ember-rdfa-editor/model/util/predicate-utils';
import { XmlReaderResult } from '@lblod/ember-rdfa-editor/model/readers/xml-reader';

module('Unit | model | model-range', () => {
  module('Unit | model | model-range | getMinimumConfinedRanges', () => {
    test('returns range if range is confined', (assert) => {
      const root = new ModelElement('div');
      const text = new ModelText('abc');
      root.addChild(text);

      const p1 = ModelPosition.fromInTextNode(text, 0);
      const p2 = ModelPosition.fromInTextNode(text, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.true(rslt[0].sameAs(range));
    });
    test('returns range if range is confined2', (assert) => {
      const root = new ModelElement('div');
      const t1 = new ModelText('abc');
      const div = new ModelElement('div');
      const t2 = new ModelText('def');
      const t3 = new ModelText('ghi');
      root.appendChildren(t1, div, t2, t3);

      const p1 = ModelPosition.fromInTextNode(t1, 0);
      const p2 = ModelPosition.fromInTextNode(t3, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.true(rslt[0].sameAs(range));
    });

    test('returns confined ranges', (assert) => {
      const root = new ModelElement('div');

      const s0 = new ModelElement('span');
      const t00 = new ModelText('t00');
      const t01 = new ModelText('t01');
      const t02 = new ModelText('t02');

      const s1 = new ModelElement('span');

      const s2 = new ModelElement('span');
      const t20 = new ModelText('t20');
      const t21 = new ModelText('t21');
      const t22 = new ModelText('t22');

      const s3 = new ModelElement('span');

      root.appendChildren(s0, s1, s2, s3);
      s0.appendChildren(t00, t01, t02);
      s2.appendChildren(t20, t21, t22);

      const p1 = ModelPosition.fromInTextNode(t00, 0);
      const p2 = ModelPosition.fromInTextNode(t22, 3);
      const range = new ModelRange(p1, p2);
      let rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 3);
      assert.true(
        rslt[0].sameAs(ModelRange.fromPaths(range.root, [0, 0], [0, 9]))
      );
      assert.true(rslt[0].isConfined());
      assert.true(rslt[1].sameAs(ModelRange.fromPaths(range.root, [1], [2])));
      assert.true(rslt[1].isConfined());
      assert.true(
        rslt[2].sameAs(ModelRange.fromPaths(range.root, [2, 0], [2, 9]))
      );
      assert.true(rslt[2].isConfined());
      const startInCA = ModelPosition.fromInElement(root, 0);
      const end = ModelPosition.fromInTextNode(t22, 3);
      const rangeWithStartInCA = new ModelRange(startInCA, end);
      rslt = rangeWithStartInCA.getMinimumConfinedRanges();
      assert.strictEqual(rslt.length, 2);
      assert.true(
        rslt[0].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [0], [2]))
      );
      assert.true(
        rslt[1].sameAs(
          ModelRange.fromPaths(rangeWithStartInCA.root, [2, 0], [2, 9])
        )
      );

      const start = ModelPosition.fromInTextNode(t00, 0);
      const endInCA = ModelPosition.fromInElement(root, 3);
      const rangeWithEndInCA = new ModelRange(start, endInCA);
      rslt = rangeWithEndInCA.getMinimumConfinedRanges();
      assert.strictEqual(rslt.length, 2);
      assert.true(
        rslt[0].sameAs(
          ModelRange.fromPaths(rangeWithStartInCA.root, [0, 0], [0, 9])
        )
      );
      assert.true(
        rslt[1].sameAs(ModelRange.fromPaths(rangeWithStartInCA.root, [1], [3]))
      );
    });

    test('returns confined ranges with uncles', (assert) => {
      // language=XML
      const xml = `
        <div>
          <span>
            <span>
              <!--                conf range 1-->
              <text __id="rangeStart">t000</text>
              <text>t001</text>
              <text>t002</text>
              <!--                /conf range 1-->
            </span>
            <!--                conf range 2-->
            <span>
              <text>t010</text>
            </span>
            <!--                /conf range 2-->
          </span>

          <!--                conf range 3-->
          <span/>
          <!--                /conf range 3-->

          <span>
            <!--                conf range 4-->
            <span>
              <text>t200</text>
            </span>
            <!--                /conf range 4-->
            <span>
              <!--                conf range 5-->
              <text>t210</text>
              <text>t211</text>
              <text __id="rangeEnd">t212</text>
              <!--                /conf range 5-->
            </span>
          </span>

          <span/>
        </div>
      `;
      const {
        textNodes: { rangeStart, rangeEnd },
      } = parseXml(xml);
      const p1 = ModelPosition.fromInTextNode(rangeStart, 0);
      const p2 = ModelPosition.fromInTextNode(rangeEnd, 2);
      const range = new ModelRange(p1, p2);
      const confinedRanges = range.getMinimumConfinedRanges();

      assert.strictEqual(confinedRanges.length, 5);
    });

    test("doesn't crash", (assert) => {
      // language=XML
      const { root } = stackOverFlowOnGetMinimumConfinedRanges;
      assert.true(true);
      assert.true(root !== null);
    });

    test('all ranges are confined', (assert) => {
      // language=XML
      const {
        elements: { rangeStart },
        textNodes: { rangeEnd },
      } = vdom`
        <modelRoot>
          <div __id="rangeStart">
            <span>
              <text>I will be gone</text>
              <span>
                <text __id="rangeEnd">efg</text>
              </span>
            </span>
          </div>
          <text>abcd</text>
        </modelRoot>
      `;
      const start = ModelPosition.fromInElement(rangeStart, 0);
      const end = ModelPosition.fromInTextNode(rangeEnd, 1);
      const range = new ModelRange(start, end);

      const result = range.getMinimumConfinedRanges();

      for (const rsltRange of result) {
        assert.true(rsltRange.isConfined());
      }
    });
  });
  module('Unit | model | model-range | getCommonAncestor', () => {
    test('returns null when start and end have different root', (assert) => {
      const root = new ModelElement('div');
      const root2 = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, [0]);
      const p2 = ModelPosition.fromPath(root2, [0]);

      const range = new ModelRange(p1, p2);

      assert.strictEqual(range.getCommonPosition(), null);
    });
    test('returns root when start and end are root', (assert) => {
      const root = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, []);
      const p2 = ModelPosition.fromPath(root, []);

      const range = new ModelRange(p1, p2);

      assert.true(
        range.getCommonPosition()?.sameAs(ModelPosition.fromPath(root, []))
      );
    });
  });

  module('Unit | model | model-range | getMaximizedRange', () => {
    test('gets the same range when start and end in commonAncestor', (assert) => {
      // language=XML
      const xml = `
        <div>
          <span>
            <text __id="testNode">test</text>
          </span>
        </div>
      `;
      const {
        textNodes: { testNode },
      } = parseXml(xml);

      const start = ModelPosition.fromInTextNode(testNode, 0);
      const end = ModelPosition.fromInTextNode(testNode, 3);
      const range = new ModelRange(start, end);

      const maximized = range.getMaximizedRange();
      assert.true(range.sameAs(maximized));
    });
    test('gets the maximized range', (assert) => {
      // language=XML
      const xml = `
        <div>
          <span __id="commonAncestor">
            <span>
              <text __id="rangeStart">start</text>
            </span>

            <span>
              <text>middle</text>
            </span>

            <span>
              <text __id="rangeEnd">end</text>
            </span>
          </span>
        </div>
      `;

      const {
        textNodes: { rangeStart, rangeEnd },
      } = parseXml(xml);

      const start = ModelPosition.fromInTextNode(rangeStart, 0);
      const end = ModelPosition.fromInTextNode(rangeEnd, 3);

      const range = new ModelRange(start, end);
      assert.deepEqual(range.start.path, [0, 0, 0]);
      assert.deepEqual(range.end.path, [0, 2, 3]);

      const maximized = range.getMaximizedRange();
      assert.deepEqual(maximized.start.path, [0, 0]);
      assert.deepEqual(maximized.end.path, [0, 3]);
    });

    module('Unit | model | model-range | findCommonAncestorsWhere', () => {
      test('collapsed selection inside an element', (assert) => {
        // language=XML
        const {
          elements: { testLi },
        } = vdom`
          <div>
            <ul>
              <li __id="testLi">
                <text>${INVISIBLE_SPACE}</text>
              </li>
            </ul>
          </div>
        `;

        const range = ModelRange.fromInElement(testLi, 0, 0);

        assert.true(range.hasCommonAncestorWhere(elementHasType('li')));
      });

      test('uncollapsed selection does not have common ancestors of type', (assert) => {
        // language=XML
        const {
          textNodes: { testText },
          elements: { testLi },
        } = vdom`
          <div>
            <text __id="testText">before li</text>
            <ul>
              <li __id="testLi">
                <text>${INVISIBLE_SPACE}</text>
              </li>
            </ul>
          </div>
        `;

        // debugger;
        const startPosition = ModelPosition.fromInTextNode(testText, 0);
        const endPosition = ModelPosition.fromInElement(testLi, 0);
        const range = new ModelRange(startPosition, endPosition);

        assert.false(range.hasCommonAncestorWhere(elementHasType('li')));
      });
    });
    module('Unit | model | model-range | findContainedNodesWhere', () => {
      test('collapsed range does not contain an element', (assert) => {
        // language=XML
        const {
          elements: { testLi },
        } = vdom`
          <div>
            <ul>
              <li __id="testLi">
                <text>${INVISIBLE_SPACE}</text>
              </li>
            </ul>
          </div>
        `;

        const range = ModelRange.fromInElement(testLi, 0, 0);

        assert.false(range.containsNodeWhere(nodeIsElementOfType('li')));
      });

      test('uncollapsed selection contains an element', (assert) => {
        // language=XML
        const {
          textNodes: { testText },
          elements: { testLi },
        } = vdom`
          <div>
            <text __id="testText">before li</text>
            <ul>
              <li __id="testLi">
                <text>${INVISIBLE_SPACE}</text>
              </li>
            </ul>
          </div>
        `;

        // debugger;
        const startPosition = ModelPosition.fromInTextNode(testText, 0);
        const endPosition = ModelPosition.fromInElement(testLi, 0);
        const range = new ModelRange(startPosition, endPosition);

        assert.true(range.containsNodeWhere(nodeIsElementOfType('li')));
      });
    });
  });
  module('Unit | model | model-range | contextNodes', (hooks) => {
    let testDoc: XmlReaderResult;
    let collapsedInText: ModelRange;
    let collapsedBeforeText: ModelRange;
    let collapsedAfterText: ModelRange;
    let unCollapsedInText: ModelRange;
    let collapsedInEmpty: ModelRange;
    let acrossTwoTextNodes: ModelRange;
    let overLineBreak: ModelRange;
    let endDeeperThanStart: ModelRange;
    let differentSubtrees: ModelRange;
    let aroundText: ModelRange;
    hooks.beforeEach(() => {
      //language=XML
      testDoc = vdom`
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
            <span>
              <text __id="text7">test</text>
            </span>
          </div>
          <div __id="div5">
            <span>
              <text __id="text8">test</text>
            </span>
            <br/>
            <span>
              <text __id="text9">test</text>
            </span>
          </div>
        </modelRoot>
      `;
      const {
        root,
        textNodes: { text1, text6, text7, text8, text9 },
        elements: { emptyDiv, div1, div2, div3 },
      } = testDoc;
      collapsedInText = ModelRange.fromInNode(text1, 1, 1);
      collapsedBeforeText = ModelRange.fromInNode(div1, 0, 0);
      collapsedAfterText = ModelRange.fromInNode(div1, 4, 4);
      collapsedInEmpty = ModelRange.fromInNode(emptyDiv, 0, 0);
      unCollapsedInText = ModelRange.fromInNode(text1, 1, 3);
      aroundText = ModelRange.fromAroundNode(text1);
      acrossTwoTextNodes = ModelRange.fromInNode(div2, 2, 6);
      overLineBreak = ModelRange.fromInNode(div3, 2, 7);
      endDeeperThanStart = new ModelRange(
        ModelPosition.fromInTextNode(text6, 2),
        ModelPosition.fromInTextNode(text7, 2)
      );
      differentSubtrees = new ModelRange(
        ModelPosition.fromInTextNode(text8, 2),
        ModelPosition.fromInTextNode(text9, 2)
      );
    });

    test('isInside gives correct nodes', (assert) => {
      const {
        root,
        elements: { div1 },
        textNodes: { text1 },
      } = testDoc;
      const collapsedInTextContext = [
        ...collapsedInText.contextNodes('rangeIsInside'),
      ];
      assert.deepEqual(collapsedInTextContext, [text1, div1, root]);

      const unCollapsedInTextContext = [
        ...unCollapsedInText.contextNodes('rangeIsInside'),
      ];
      assert.deepEqual(unCollapsedInTextContext, [text1, div1, root]);

      const aroundTextContext = [...aroundText.contextNodes('rangeIsInside')];
      assert.deepEqual(aroundTextContext, [div1, root]);
    });
    test('isInside with both sides sticky gives correct nodes', (assert) => {
      const {
        root,
        elements: { div1 },
        textNodes: { text1 },
      } = testDoc;
      const collapsedInTextContext = [
        ...collapsedInText.contextNodes({
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        }),
      ];
      assert.deepEqual(collapsedInTextContext, [text1, div1, root]);

      const unCollapsedInTextContext = [
        ...unCollapsedInText.contextNodes({
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        }),
      ];
      assert.deepEqual(unCollapsedInTextContext, [text1, div1, root]);

      const aroundTextContext = [
        ...aroundText.contextNodes({
          type: 'rangeIsInside',
          textNodeStickyness: { start: 'both', end: 'both' },
        }),
      ];
      assert.deepEqual(aroundTextContext, [text1, div1, root]);
    });
  });
});
