import { module, test } from 'qunit';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { RelativePosition } from '@lblod/ember-rdfa-editor/model/util/types';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';

module('Unit | model | model-position', () => {
  module('Unit | model | model-position | getCommonAncestor', () => {
    test('returns null when start and end have different root', (assert) => {
      const root = new ModelElement('div');
      const root2 = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, [0]);
      const p2 = ModelPosition.fromPath(root2, [0]);

      assert.strictEqual(p1.getCommonPosition(p2), null);
    });
    test('returns root when start and end are root', (assert) => {
      const root = new ModelElement('div');
      const p1 = ModelPosition.fromPath(root, []);
      const p2 = ModelPosition.fromPath(root, []);
      assert.true(
        p1.getCommonPosition(p2)?.sameAs(ModelPosition.fromPath(root, []))
      );
    });

    test('returns correct common ancestor', (assert) => {
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

    test('returns correct common ancestor 2', (assert) => {
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

    test('returns correct common ancestor for collapsed range at end', (assert) => {
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
  module('Unit | model | model-position | split', () => {
    test('splits text nodes correctly', (assert) => {
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

    test('splits text nodes correctly with saveEdges', (assert) => {
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
    test('splits correctly 2 with saveEdges', (assert) => {
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

  module('Unit | model | model-position | comparePath', () => {
    test('recognizes identical paths', (assert) => {
      const path1 = [0, 1, 2, 3];
      const path2 = [0, 1, 2, 3];
      assert.strictEqual(
        ModelPosition.comparePath(path1, path2),
        RelativePosition.EQUAL
      );
    });

    test('path1 before path2', (assert) => {
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

    test('path1 after path2', (assert) => {
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
    test('path1 shorter than path2', (assert) => {
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
    test('path1 longer than path2', (assert) => {
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

  module('Unit | model | model-position | findAncestors', () => {
    test('finds root when only valid node', (assert) => {
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
    test('finds nothing when no valid node', (assert) => {
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
    test('finds all valid nodes', (assert) => {
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
  module('Unit | model | model-position | charactersBefore', () => {
    test('gives empty string when no characters before', (assert) => {
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
    test('gives empty string when amount 0', (assert) => {
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
    test('gives empty string when in front of element', (assert) => {
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
    test('gives desired characters', (assert) => {
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
    test('gives desired characters when amount too big', (assert) => {
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

    test('gives desired characters when inside a string', (assert) => {
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

    test('gives desired characters when inside a string over boundaries', (assert) => {
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
    test('gives desired multiple characters when inside a string over boundaries', (assert) => {
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
  module('Unit | model | model-position | shiftedBy', () => {
    test('gives equivalent pos when already at start and moving left', (assert) => {
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
    test('gives equivalent pos when already at end and moving right', (assert) => {
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
    test('shifts by amount, counting elements as 1', (assert) => {
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
    test('shifts by amount - in text node', (assert) => {
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
    test('shifts by amount - at doc boundaries', (assert) => {
      const {
        textNodes: { text },
      } = vdom`
        <modelRoot>
          <text __id="text">a</text>
        </modelRoot>
      `;
      const referencePosLeft = ModelPosition.fromInTextNode(text, 0);
      const referencePosRight = ModelPosition.fromInTextNode(text, 1);
      assert.true(
        referencePosLeft.sameAs(referencePosLeft.shiftedVisually(-1))
      );
      assert.true(
        referencePosRight.sameAs(referencePosRight.shiftedVisually(1))
      );
    });
    test('shifts by amount - descends into inline element', (assert) => {
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
  });
});
