import { module, test } from 'qunit';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import { parseXml, vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { stackOverFlowOnGetMinimumConfinedRanges } from 'dummy/tests/unit/model/testing-vdoms';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import {
  elementHasType,
  nodeIsElementOfType,
} from '@lblod/ember-rdfa-editor/utils/predicate-utils';

module('Unit | model | model-range', function () {
  module('Unit | model | model-range | getMinimumConfinedRanges', function () {
    test('returns range if range is confined', function (assert) {
      const root = new ModelElement('div');
      const text = new ModelText('abc');
      root.addChild(text);

      const p1 = ModelPosition.fromInTextNode(root as ModelElement, text, 0);
      const p2 = ModelPosition.fromInTextNode(root as ModelElement, text, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.true(rslt[0].sameAs(range));
    });
    test('returns range if range is confined2', function (assert) {
      const root = new ModelElement('div');
      const t1 = new ModelText('abc');
      const div = new ModelElement('div');
      const t2 = new ModelText('def');
      const t3 = new ModelText('ghi');
      root.appendChildren(t1, div, t2, t3);

      const p1 = ModelPosition.fromInTextNode(root as ModelElement, t1, 0);
      const p2 = ModelPosition.fromInTextNode(root as ModelElement, t3, 2);
      const range = new ModelRange(p1, p2);
      const rslt = range.getMinimumConfinedRanges();

      assert.strictEqual(rslt.length, 1);
      assert.true(rslt[0].sameAs(range));
    });

    test('returns confined ranges', function (assert) {
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

      const p1 = ModelPosition.fromInTextNode(root as ModelElement, t00, 0);
      const p2 = ModelPosition.fromInTextNode(root as ModelElement, t22, 3);
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
      const startInCA = ModelPosition.fromInElement(
        root as ModelElement,
        root,
        0
      );
      const end = ModelPosition.fromInTextNode(root as ModelElement, t22, 3);
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

      const start = ModelPosition.fromInTextNode(root as ModelElement, t00, 0);
      const endInCA = ModelPosition.fromInElement(
        root as ModelElement,
        root,
        3
      );
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

    test('returns confined ranges with uncles', function (assert) {
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
        root,
        textNodes: { rangeStart, rangeEnd },
      } = parseXml(xml);
      const p1 = ModelPosition.fromInTextNode(
        root as ModelElement,
        rangeStart,
        0
      );
      const p2 = ModelPosition.fromInTextNode(
        root as ModelElement,
        rangeEnd,
        2
      );
      const range = new ModelRange(p1, p2);
      const confinedRanges = range.getMinimumConfinedRanges();

      assert.strictEqual(confinedRanges.length, 5);
    });

    test("doesn't crash", function (assert) {
      // language=XML
      const { root } = stackOverFlowOnGetMinimumConfinedRanges;
      assert.true(true);
      assert.notStrictEqual(root, null);
    });

    test('all ranges are confined', function (assert) {
      // language=XML
      const {
        root,
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
      const start = ModelPosition.fromInElement(
        root as ModelElement,
        rangeStart,
        0
      );
      const end = ModelPosition.fromInTextNode(
        root as ModelElement,
        rangeEnd,
        1
      );
      const range = new ModelRange(start, end);

      const result = range.getMinimumConfinedRanges();

      assert.expect(result.length);
      for (const rsltRange of result) {
        assert.true(rsltRange.isConfined());
      }
    });
  });
  module('Unit | model | model-range | getCommonAncestor', function () {
    test('returns null when start and end have different root', function (assert) {
      const root = new ModelElement('div');
      const root2 = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, [0]);
      const p2 = ModelPosition.fromPath(root2, [0]);

      const range = new ModelRange(p1, p2);

      assert.strictEqual(range.getCommonPosition(), null);
    });
    test('returns root when start and end are root', function (assert) {
      const root = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, []);
      const p2 = ModelPosition.fromPath(root, []);

      const range = new ModelRange(p1, p2);

      assert.true(
        range.getCommonPosition()?.sameAs(ModelPosition.fromPath(root, []))
      );
    });
  });

  module('Unit | model | model-range | getMaximizedRange', function () {
    test('gets the same range when start and end in commonAncestor', function (assert) {
      // language=XML
      const xml = `
        <div>
          <span>
            <text __id="testNode">test</text>
          </span>
        </div>
      `;
      const {
        root,
        textNodes: { testNode },
      } = parseXml(xml);

      const start = ModelPosition.fromInTextNode(
        root as ModelElement,
        testNode,
        0
      );
      const end = ModelPosition.fromInTextNode(
        root as ModelElement,
        testNode,
        3
      );
      const range = new ModelRange(start, end);

      const maximized = range.getMaximizedRange();
      assert.true(range.sameAs(maximized));
    });
    test('gets the maximized range', function (assert) {
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
        root,
        textNodes: { rangeStart, rangeEnd },
      } = parseXml(xml);

      const start = ModelPosition.fromInTextNode(
        root as ModelElement,
        rangeStart,
        0
      );
      const end = ModelPosition.fromInTextNode(
        root as ModelElement,
        rangeEnd,
        3
      );

      const range = new ModelRange(start, end);
      assert.deepEqual(range.start.path, [0, 0, 0]);
      assert.deepEqual(range.end.path, [0, 2, 3]);

      const maximized = range.getMaximizedRange();
      assert.deepEqual(maximized.start.path, [0, 0]);
      assert.deepEqual(maximized.end.path, [0, 3]);
    });

    module(
      'Unit | model | model-range | findCommonAncestorsWhere',
      function () {
        test('collapsed selection inside an element', function (assert) {
          // language=XML
          const {
            root,
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

          const range = ModelRange.fromInElement(
            root as ModelElement,
            testLi,
            0,
            0
          );

          assert.true(range.hasCommonAncestorWhere(elementHasType('li')));
        });

        test('uncollapsed selection does not have common ancestors of type', function (assert) {
          // language=XML
          const {
            root,
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
          const startPosition = ModelPosition.fromInTextNode(
            root as ModelElement,
            testText,
            0
          );
          const endPosition = ModelPosition.fromInElement(
            root as ModelElement,
            testLi,
            0
          );
          const range = new ModelRange(startPosition, endPosition);

          assert.false(range.hasCommonAncestorWhere(elementHasType('li')));
        });
      }
    );
    module('Unit | model | model-range | findContainedNodesWhere', function () {
      test('collapsed range does not contain an element', function (assert) {
        // language=XML
        const {
          root,
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

        const range = ModelRange.fromInElement(
          root as ModelElement,
          testLi,
          0,
          0
        );

        assert.false(range.containsNodeWhere(nodeIsElementOfType('li')));
      });

      test('uncollapsed selection contains an element', function (assert) {
        // language=XML
        const {
          root,
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
        const startPosition = ModelPosition.fromInTextNode(
          root as ModelElement,
          testText,
          0
        );
        const endPosition = ModelPosition.fromInElement(
          root as ModelElement,
          testLi,
          0
        );
        const range = new ModelRange(startPosition, endPosition);

        assert.true(range.containsNodeWhere(nodeIsElementOfType('li')));
      });
    });
  });
});
