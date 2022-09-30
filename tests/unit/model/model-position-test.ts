import { module, test } from 'qunit';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { RelativePosition } from '@lblod/ember-rdfa-editor/utils/types';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';

module('Unit | model | model-position', function () {
  module('Unit | model | model-position | getCommonAncestor', function () {
    test('returns null when start and end have different root', function (assert) {
      const root = new ModelElement('div');
      const root2 = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, [0]);
      const p2 = ModelPosition.fromPath(root2, [0]);

      assert.strictEqual(p1.getCommonPosition(p2), null);
    });
    test('returns root when start and end are root', function (assert) {
      const root = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, []);
      const p2 = ModelPosition.fromPath(root, []);
      assert.true(
        p1.getCommonPosition(p2)?.sameAs(ModelPosition.fromPath(root, []))
      );
    });

    test('returns correct common ancestor', function (assert) {
      const root = new ModelElement('div');
      const common = new ModelElement('span');

      const t1 = new ModelText('abc');
      const t2 = new ModelText('def');
      root.addChild(common);
      common.appendChildren(t1, t2);

      const p1 = ModelPosition.fromInTextNode(t1, 1);
      const p2 = ModelPosition.fromInTextNode(t2, 1);
      assert.strictEqual(p1.getCommonAncestor(p2), common);
    });

    test('returns correct common ancestor 2', function (assert) {
      // language=XML
      const {
        elements: { common },
        textNodes: { rangeStart, rangeEnd },
      } = vdom`
        <modelRoot>
          <div __id="common">
            <text __id="rangeStart">abcd</text>
            <div>
              <text __id="rangeEnd">efgh</text>
            </div>
          </div>
        </modelRoot>
      `;

      const p1 = ModelPosition.fromInTextNode(rangeStart, 2);
      const p2 = ModelPosition.fromInTextNode(rangeEnd, 2);
      assert.strictEqual(p1.getCommonAncestor(p2), common);
    });

    test('returns correct common ancestor for collapsed range at end', function (assert) {
      // language=XML
      const {
        elements: { common },
      } = vdom`
        <modelRoot>
          <div __id="common">
            <text>abcd</text>
            <div>
              <text>efgh</text>
            </div>
          </div>
        </modelRoot>
      `;

      const p1 = ModelPosition.fromInElement(common, common.getMaxOffset());
      const p2 = ModelPosition.fromInElement(common, common.getMaxOffset());
      assert.strictEqual(p1.getCommonAncestor(p2), common);
    });
  });
  module('Unit | model | model-position | split', function () {
    test('splits text nodes correctly', function (assert) {
      const root = new ModelElement('div');

      const text = new ModelText('abc');
      root.addChild(text);

      const range = ModelRange.fromPaths(root, [0, 0], [0, 1]);

      range.start.split();
      range.end.split();

      assert.strictEqual(root.length, 2);
      assert.strictEqual((root.children[0] as ModelText).content, 'a');
      assert.strictEqual((root.children[1] as ModelText).content, 'bc');
    });

    test('splits text nodes correctly with saveEdges', function (assert) {
      const root = new ModelElement('div');

      const text = new ModelText('abc');
      root.addChild(text);

      const range = ModelRange.fromPaths(root, [0, 0], [0, 1]);

      range.start.split();
      range.end.split();

      assert.strictEqual(root.length, 2);
      assert.strictEqual((root.children[0] as ModelText).content, 'a');
      assert.strictEqual((root.children[1] as ModelText).content, 'bc');
    });
    test('splits correctly 2 with saveEdges', function (assert) {
      const root = new ModelElement('p', { debugInfo: 'root' });

      const t1 = new ModelText(`a paragraph with Lorem ipsum Itaque consequatur
    maxime repudiandae eos est. Et et officia est dolore eum ipsam laborum recusandae.
    Ab excepturi cum mollitia ut.…`);
      const br1 = new ModelElement('br');
      const t2 = new ModelText(` and a break (or two ?)`);
      const br2 = new ModelElement('br');

      root.appendChildren(t1, br1, t2, br2);

      const range = ModelRange.fromPaths(root, [0, 5], [0, 10]);
      range.start.split();
      range.end.split();

      assert.strictEqual(root.length, 6);
      assert.strictEqual((root.children[0] as ModelText).content, 'a par');
      assert.strictEqual((root.children[1] as ModelText).content, 'agrap');
      // don't reformat this
      assert.strictEqual(
        (root.children[2] as ModelText).content,
        `h with Lorem ipsum Itaque consequatur
    maxime repudiandae eos est. Et et officia est dolore eum ipsam laborum recusandae.
    Ab excepturi cum mollitia ut.…`
      );
    });
  });

  module('Unit | model | model-position | comparePath', function () {
    test('recognizes identical paths', function (assert) {
      const path1 = [0, 1, 2, 3];
      const path2 = [0, 1, 2, 3];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.EQUAL
      );
    });

    test('path1 before path2', function (assert) {
      let path1 = [0];
      let path2 = [1];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.BEFORE
      );

      path1 = [0, 1, 2, 3, 3];
      path2 = [0, 1, 2, 3, 4];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.BEFORE
      );
    });

    test('path1 after path2', function (assert) {
      let path1 = [1];
      let path2 = [0];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.AFTER
      );

      path1 = [0, 1, 2, 3, 4];
      path2 = [0, 1, 2, 3, 3];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.AFTER
      );
    });
    test('path1 shorter than path2', function (assert) {
      let path1 = [1];
      let path2 = [1, 1];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.BEFORE
      );

      path1 = [0, 1, 2, 3, 4];
      path2 = [0, 1, 2, 3, 4, 1];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.BEFORE
      );
    });
    test('path1 longer than path2', function (assert) {
      let path1 = [1, 1];
      let path2 = [1];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.AFTER
      );

      path1 = [0, 1, 2, 3, 4, 1];
      path2 = [0, 1, 2, 3, 4];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.AFTER
      );
    });
  });

  module('Unit | model | model-position | findAncestors', function () {
    test('finds root when only valid node', function (assert) {
      // language=XML
      const {
        root,
        textNodes: { testNode },
      } = vdom`
        <div>
          <text __id="testNode">abc</text>
        </div>`;
      const pos = ModelPosition.fromInTextNode(testNode, 1);
      const rslt = pos.findAncestors();
      assert.deepEqual(rslt, [root]);
    });
    test('finds nothing when no valid node', function (assert) {
      // language=XML
      const {
        textNodes: { testNode },
      } = vdom`
        <div>
          <text __id="testNode">abc</text>
        </div>`;
      const pos = ModelPosition.fromInTextNode(testNode, 1);
      const rslt = pos.findAncestors((elem) => elem.type === 'a');
      assert.deepEqual(rslt, []);
    });
    test('finds all valid nodes', function (assert) {
      // language=XML
      const {
        textNodes: { testNode },
        elements: { span0, span1 },
      } = vdom`
        <div>
          <span __id="span1">
            <div>
              <span __id="span0">
                <text __id="testNode">abc</text>
              </span>
            </div>
          </span>
        </div>`;
      const pos = ModelPosition.fromInTextNode(testNode, 1);
      const rslt = pos.findAncestors((elem) => elem.type === 'span');
      assert.deepEqual(rslt, [span0, span1]);
    });
  });
  module('Unit | model | model-position | charactersBefore', function () {
    test('gives empty string when no characters before', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 0);
      const result = position.charactersBefore(3);
      assert.strictEqual(result, '');
    });
    test('gives empty string when amount 0', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 3);
      const result = position.charactersBefore(0);
      assert.strictEqual(result, '');
    });
    test('gives empty string when in front of element', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text>abc</text>
          <span/>
          <text __id="textNode">def</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 0);
      const result = position.charactersBefore(0);
      assert.strictEqual(result, '');
    });
    test('gives desired characters', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 3);
      const result = position.charactersBefore(2);
      assert.strictEqual(result, 'bc');
    });
    test('gives desired characters when amount too big', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 3);
      const result = position.charactersBefore(20);
      assert.strictEqual(result, 'abc');
    });

    test('gives desired characters when inside a string', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 1);
      const result = position.charactersBefore(1);
      assert.strictEqual(result, 'a');
    });

    test('gives desired characters when inside a string over boundaries', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text>abc</text>
          <text __id="textNode">def</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 0);
      const result = position.charactersBefore(1);
      assert.strictEqual(result, 'c');
    });
    test('gives desired multiple characters when inside a string over boundaries', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text>abc</text>
          <text __id="textNode">def</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 2);
      const result = position.charactersBefore(4);
      assert.strictEqual(result, 'bcde');
    });
  });
  module('Unit | model | model-position | charactersAfter', () => {
    test('gives empty string when no characters after', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 3);
      const result = position.charactersAfter(3);
      assert.strictEqual(result, '');
    });
    test('gives empty string when amount 0', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 3);
      const result = position.charactersAfter(0);
      assert.strictEqual(result, '');
    });
    test('gives empty string when in front of element', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
          <span/>
          <text>def</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 3);
      const result = position.charactersAfter(0);
      assert.strictEqual(result, '');
    });
    test('gives desired characters', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 0);
      const result = position.charactersAfter(2);
      assert.strictEqual(result, 'ab');
    });
    test('gives desired characters when amount too big', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 0);
      const result = position.charactersAfter(20);
      assert.strictEqual(result, 'abc');
    });

    test('gives desired characters when inside a string', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 1);
      const result = position.charactersAfter(1);
      assert.strictEqual(result, 'b');
    });

    test('gives desired characters when inside a string over boundaries', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
          <text>def</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 3);
      const result = position.charactersAfter(1);
      assert.strictEqual(result, 'd');
    });
    test('gives desired multiple characters when inside a string over boundaries', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
          <text>def</text>
        </modelRoot>
      `;
      const position = ModelPosition.fromInTextNode(textNode, 1);
      const result = position.charactersAfter(4);
      assert.strictEqual(result, 'bcde');
    });
  });
  module('Unit | model | model-position | shiftedBy', function () {
    test('gives equivalent pos when already at start and moving left', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const pos = ModelPosition.fromInTextNode(textNode, 0);
      const result = pos.shiftedBy(-10);
      assert.true(result.sameAs(pos));
    });
    test('gives equivalent pos when already at end and moving right', function (assert) {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;
      const pos = ModelPosition.fromInTextNode(textNode, 3);
      const result = pos.shiftedBy(10);
      assert.true(result.sameAs(pos));
    });
    test('shifts by amount, counting elements as 1', function (assert) {
      // language=XML
      const {
        elements: { parent },
      } = vdom`
        <modelRoot __id="parent">
          <text>abc</text>
          <span>
            <text>will be skipped over</text>
          </span>
          <text>def</text>
        </modelRoot>
      `;
      const pos = ModelPosition.fromInElement(parent, 4);
      const expected = ModelPosition.fromInElement(parent, 3);
      const result = pos.shiftedBy(-1);
      assert.true(result.sameAs(expected));
    });
  });
  module('Unit | model | model-position | shiftedVisually', () => {
    test('shifts by amount - in text node', function (assert) {
      const {
        textNodes: { text },
      } = vdom`
        <modelRoot>
          <text __id="text">abc</text>
        </modelRoot>
      `;
      const referencePos = ModelPosition.fromInTextNode(text, 1);
      const oneLeft = ModelPosition.fromInTextNode(text, 0);
      const oneRight = ModelPosition.fromInTextNode(text, 2);
      assert.true(oneLeft.sameAs(referencePos.shiftedVisually(-1)));
      assert.true(oneRight.sameAs(referencePos.shiftedVisually(1)));
    });
    test('shifts by amount - at doc boundaries', function (assert) {
      const {
        textNodes: { text },
      } = vdom`
        <modelRoot>
          <text __id="text">a</text>
        </modelRoot>
      `;
      const referencePosLeft = ModelPosition.fromInTextNode(text, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text, 1);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);
      assert.true(
        referencePosLeft.sameAs(shiftedLeft),
        shiftedLeft.path.toString()
      );
      assert.true(
        referencePosRight.sameAs(shiftedRight),
        shiftedRight.path.toString()
      );
    });
    test('shifts by amount - descends into inline element', function (assert) {
      const {
        textNodes: { text, textLeft, textRight },
      } = vdom`
        <modelRoot>
          <span>
            <text __id="textLeft">ab</text>
          </span>
          <text __id="text">c</text>
          <span>
            <text __id="textRight">d</text>
          </span>
        </modelRoot>
      `;
      const referencePosLeft = ModelPosition.fromInTextNode(text, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text, 1);
      const oneLeft = ModelPosition.fromInTextNode(textLeft, 1);
      const oneRight = ModelPosition.fromInTextNode(textRight, 1);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      const shiftedRight = referencePosRight.shiftedVisually(1);
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifts by amount - at beginning of li tag', function (assert) {
      const {
        textNodes: { text1, text2, text3 },
      } = vdom`
        <modelRoot>
          <ul>
            <li>
              <text __id="text1">ab</text>
            </li>
            <li>
              <text __id="text2">c</text>
            </li>
            <li>
              <text __id="text3">de</text>
            </li>
          </ul>
        </modelRoot>
      `;

      const referencePosLeft = ModelPosition.fromInTextNode(text2, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text2, 1);

      const oneLeft = ModelPosition.fromInTextNode(text1, 2);
      const oneRight = ModelPosition.fromInTextNode(text3, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifts by amount - sublists', function (assert) {
      const {
        textNodes: { text1, text2, text3, text4 },
      } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text __id="text1">ab</text>
            <ul>
              <li>
                  <text __id="text2">cd</text>
              </li>
              <li>
                  <text __id="text3">ef</text>
              </li>
            </ul>
          </li>
          <li>
            <text __id="text4">gh</text>
            <ul/>
          </li>
        </ul>
      </modelRoot>
      `;
      const referencePosLeft = ModelPosition.fromInTextNode(text2, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text3, 2);

      const oneLeft = ModelPosition.fromInTextNode(text1, 2);
      const oneRight = ModelPosition.fromInTextNode(text4, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });

    test('shifted by amount - going out of a list', function (assert) {
      const {
        textNodes: { text1, text2, text3 },
      } = vdom`
      <modelRoot>
        <text __id="text1">ab</text>
        <ul>
            <li>
                <text __id="text2">cd</text>
            </li>
        </ul>
        <text __id="text3">ef</text>
      </modelRoot>
      `;

      const referencePosLeft = ModelPosition.fromInTextNode(text2, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text2, 2);

      const oneLeft = ModelPosition.fromInTextNode(text1, 2);
      const oneRight = ModelPosition.fromInTextNode(text3, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifted by amount - span inside li', function (assert) {
      const {
        textNodes: { text1, text2, text3 },
      } = vdom`
        <modelRoot>
          <ul>
            <li>
              <span __id="span1">
                <text __id="text1">ab</text>
              </span>
            </li>
            <li>
              <span>
                <text __id="text2">c</text>
              </span>
            </li>
            <li>
              <span __id="span2">
                <text  __id="text3">de</text>
              </span>
            </li>
          </ul>
        </modelRoot>
      `;

      const referencePosLeft = ModelPosition.fromInTextNode(text2, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text2, 1);

      const oneLeft = ModelPosition.fromInNode(text1, 2);
      const oneRight = ModelPosition.fromInNode(text3, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifted by amount - br', function (assert) {
      const {
        textNodes: { text1, text2, text3 },
      } = vdom`
      <modelRoot>
        <text __id="text1">ab</text>
        <br/>
        <text __id="text2">cd</text>
        <br/>
        <text __id="text3">ef</text>
      </modelRoot>
      `;
      const referencePosLeft = ModelPosition.fromInTextNode(text2, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text2, 2);

      const oneLeft = ModelPosition.fromInTextNode(text1, 2);

      const oneRight = ModelPosition.fromInTextNode(text3, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifted by amount - invisible spaces', function (assert) {
      const {
        textNodes: { text1, text2, text3 },
      } = vdom`
      <modelRoot>
        <text __id="text1">ab${INVISIBLE_SPACE}</text>
        <text __id="text2">${INVISIBLE_SPACE}cd${INVISIBLE_SPACE}</text>
        <text __id="text3">${INVISIBLE_SPACE}ef</text>
      </modelRoot>
      `;
      const referencePosLeft = ModelPosition.fromInTextNode(text2, 1);
      const referencePosRight = ModelPosition.fromInTextNode(text2, 3);

      const oneLeft = ModelPosition.fromInTextNode(text1, 1);

      const oneRight = ModelPosition.fromInTextNode(text3, 2);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifted by amount - lump node', function (assert) {
      const {
        textNodes: { baz, foo },
      } = vdom`
      <modelRoot>
        <text __id="baz">baz</text>
        <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode">
            <text>bar</text>
        </div>
        <text __id="foo">foo</text>
      </modelRoot>`;
      const referencePosLeft = ModelPosition.fromInTextNode(foo, 0);
      const referencePosRight = ModelPosition.fromInTextNode(baz, 3);

      const oneLeft = ModelPosition.fromInTextNode(baz, 3);

      const oneRight = ModelPosition.fromInTextNode(foo, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifted by amount - div before and after lump node', function (assert) {
      const {
        textNodes: { baz, foo },
        elements: { lump },
      } = vdom`
      <modelRoot>
        <div><text __id="baz">baz</text></div>
        <div __id="lump" property="http://lblod.data.gift/vocabularies/editor/isLumpNode">
            <text>bar</text>
        </div>
        <div><text __id="foo">foo</text></div>
      </modelRoot>`;
      const referencePosLeft = ModelPosition.fromInTextNode(foo, 0);
      const referencePosRight = ModelPosition.fromInTextNode(baz, 3);

      const oneLeft = ModelPosition.fromBeforeNode(lump);

      const oneRight = ModelPosition.fromInTextNode(foo, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
    test('shifted by amount - br between divs', function (assert) {
      const {
        textNodes: { foo },
        elements: { br },
      } = vdom`
      <modelRoot>
        <div>
          <text __id="baz">baz</text>
        </div>
        <br __id="br"/>
        <div>
          <text __id="foo">foo</text>
        </div>
      </modelRoot>`;
      const referencePosLeft = ModelPosition.fromInTextNode(foo, 0);
      const referencePosRight = ModelPosition.fromBeforeNode(br);

      const oneLeft = ModelPosition.fromBeforeNode(br);

      const oneRight = ModelPosition.fromInTextNode(foo, 0);

      const shiftedLeft = referencePosLeft.shiftedVisually(-1);
      const shiftedRight = referencePosRight.shiftedVisually(1);

      assert.true(oneLeft.sameAs(shiftedLeft), shiftedLeft.path.toString());
      assert.true(oneRight.sameAs(shiftedRight), shiftedRight.path.toString());
    });
  });
  module('Unit | model | model-position | nodeAfter', () => {
    test('two empty text nodes', function (assert) {
      const div = new ModelElement('div');
      const text1 = new ModelText('');
      const text2 = new ModelText('');
      div.appendChildren(text1, text2);
      const pos = ModelPosition.fromBeforeNode(text1);
      assert.strictEqual(pos.nodeAfter(), null);
    });
  });
});
