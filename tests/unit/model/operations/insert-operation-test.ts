import { module, test } from 'qunit';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import InsertOperation from '@lblod/ember-rdfa-editor/model/operations/insert-operation';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';

module('Unit | model | operations | insert-operation-test', () => {
  test('inserts into empty root', (assert) => {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>abc</text>
      </modelRoot>
    `;

    const { root: nodeToInsert } = vdom`<text>abc</text>`;

    const op = new InsertOperation(
      ModelRange.fromInElement(initial as ModelElement, 0, 0),
      nodeToInsert
    );
    op.execute();
    assert.true(initial.sameAs(expected));
  });
  test('inserts element into empty root', (assert) => {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>abc</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: nodeToInsert } = vdom`
      <div>
        <text>abc</text>
      </div>`;

    const op = new InsertOperation(
      ModelRange.fromInElement(initial as ModelElement, 0, 0),
      nodeToInsert
    );
    op.execute();
    assert.true(initial.sameAs(expected));
  });
  test('inserts into root when collapsed', (assert) => {
    const root = new ModelElement('div');
    const s0 = new ModelElement('span');
    root.addChild(s0);

    const nodeToInsert = new ModelText('abc');

    const op = new InsertOperation(
      ModelRange.fromPaths(root, [0], [0]),
      nodeToInsert
    );
    op.execute();
    assert.strictEqual(root.length, 2);
    assert.strictEqual(root.firstChild, nodeToInsert);
  });
  test('inserts into root when collapsed2', (assert) => {
    const root = new ModelElement('div');
    const s0 = new ModelElement('span');
    root.addChild(s0);

    const nodeToInsert = new ModelText('abc');

    const op = new InsertOperation(
      ModelRange.fromPaths(root, [1], [1]),
      nodeToInsert
    );
    op.execute();
    assert.strictEqual(root.length, 2);
    assert.strictEqual(root.lastChild, nodeToInsert);
  });
  test('replaces when not collapsed', (assert) => {
    const root = new ModelElement('div');
    const s0 = new ModelElement('span');
    root.addChild(s0);

    const nodeToInsert = new ModelText('abc');

    const op = new InsertOperation(
      ModelRange.fromPaths(root, [0], [1]),
      nodeToInsert
    );
    op.execute();
    assert.strictEqual(root.length, 1);
    assert.strictEqual(root.firstChild, nodeToInsert);
  });
  test('replaces complex range', (assert) => {
    const { root, s0, s2, s3, t00, t22 } = buildStructure1();

    const nodeToInsert = new ModelText('abc');

    const p1 = ModelPosition.fromInTextNode(t00, 0);
    const p2 = ModelPosition.fromInTextNode(t22, 3);
    const op = new InsertOperation(new ModelRange(p1, p2), nodeToInsert);
    op.execute();
    assert.strictEqual(root.length, 3);
    assert.strictEqual(root.children[0], s0);
    assert.strictEqual(root.children[1], s2);
    assert.strictEqual(root.children[2], s3);
    assert.strictEqual(s0.length, 1);
    assert.strictEqual(s0.children[0], nodeToInsert);
    assert.strictEqual(s2.length, 0);
    assert.strictEqual(s3.length, 0);
  });
  test('removes items when no nodes to insert are provided', (assert) => {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">test</text>
        </div>
        <text __id="rangeEnd">test</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>te</text>
        </div>
        <text>st</text>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const range = new ModelRange(start, end);
    const op = new InsertOperation(range);

    const resultRange = op.execute();

    assert.true(expected.sameAs(initial));
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(initial as ModelElement, [1], [1])
      )
    );
  });
  test('inserts at start position', (assert) => {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">abcd</text>
        </div>
        <span>
          <text>efgh</text>
        </span>
        <div>
          <span>
            <text>ijkl</text>
          </span>
          <span>
            <text __id="rangeEnd">mnop</text>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>ab</text>
          <text>ins0</text>
          <text>ins1</text>
        </div>
        <div>
          <span>
            <text>op</text>
          </span>
        </div>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const range = new ModelRange(start, end);
    const op = new InsertOperation(
      range,
      new ModelText('ins0'),
      new ModelText('ins1')
    );
    const resultRange = op.execute();
    assert.true(initial.sameAs(expected));
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(initial as ModelElement, [0, 2], [0, 10])
      )
    );
  });
});

function buildStructure1() {
  const root = new ModelElement('div');

  const s0 = new ModelElement('span');
  const t00 = new ModelText('t00');
  const t01 = new ModelText('t01');
  const t02 = new ModelText('t02');

  const s1 = new ModelElement('span');
  const t10 = new ModelText('t10');
  const t11 = new ModelText('t11');
  const t12 = new ModelText('t12');

  const s2 = new ModelElement('span');
  const t20 = new ModelText('t20');
  const t21 = new ModelText('t21');
  const t22 = new ModelText('t22');

  const s3 = new ModelElement('span');

  root.appendChildren(s0, s1, s2, s3);
  s0.appendChildren(t00, t01, t02);
  s1.appendChildren(t10, t11, t12);
  s2.appendChildren(t20, t21, t22);

  return { root, s0, s1, s2, s3, t00, t01, t02, t10, t11, t12, t20, t21, t22 };
}
