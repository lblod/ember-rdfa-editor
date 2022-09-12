import { module, test } from 'qunit';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import InsertOperation from '@lblod/ember-rdfa-editor/model/operations/insert-operation';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';

module('Unit | model | operations | insert-operation-test', function () {
  test('inserts into empty root', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <text __dirty="content,node">abc</text>
      </modelRoot>
    `;

    const { root: nodeToInsert } = vdom`
      <text __dirty="content,node">abc</text>`;

    const op = new InsertOperation(
      undefined,
      ModelRange.fromInElement(initial as ModelElement, 0, 0),
      nodeToInsert
    );
    op.execute();
    assert.true(initial.sameAs(expected));
  });
  test('inserts element into empty root', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <div __dirty="content,node">
          <text __dirty="content,node">abc</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: nodeToInsert } = vdom`
      <div>
        <text>abc</text>
      </div>`;

    const op = new InsertOperation(
      undefined,
      ModelRange.fromInElement(initial as ModelElement, 0, 0),
      nodeToInsert
    );
    op.execute();
    assert.true(initial.sameAs(expected));
  });
  test('inserts into root when collapsed', function (assert) {
    //language=XML
    const {
      root: initial,
      elements: { rangeAnchor },
    } = vdom`
      <modelRoot __id="rangeAnchor">
        <span/>
      </modelRoot>
    `;
    //language=XML
    const { root: nodeToInsert } = vdom`
      <text>abc</text>`;

    const op = new InsertOperation(
      undefined,
      ModelRange.fromInNode(rangeAnchor, 0, 0),
      nodeToInsert
    );
    //language=XML
    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <text __dirty="node,content">abc</text>
        <span/>
      </modelRoot>
    `;
    op.execute();
    assert.true(expected.sameAs(initial));
  });
  test('inserts into root when collapsed2', function (assert) {
    const root = new ModelElement('div');
    const s0 = new ModelElement('span');
    root.addChild(s0);
    //language=XML
    const {
      root: initial,
      elements: { rangeAnchor },
    } = vdom`
      <modelRoot __id="rangeAnchor">
        <span/>
      </modelRoot>
    `;

    //language=XML
    const { root: nodeToInsert } = vdom`
      <text>abc</text>`;
    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <span/>
        <text __dirty="content,node">abc</text>
      </modelRoot>
    `;

    const op = new InsertOperation(
      undefined,
      ModelRange.fromInNode(rangeAnchor, 1, 1),
      nodeToInsert
    );
    op.execute();
    assert.true(expected.sameAs(initial));
  });
  test('replaces when not collapsed', function (assert) {
    const root = new ModelElement('div');
    const s0 = new ModelElement('span');
    root.addChild(s0);

    const nodeToInsert = new ModelText('abc');

    const op = new InsertOperation(
      undefined,
      ModelRange.fromPaths(root, [0], [1]),
      nodeToInsert
    );
    op.execute();
    assert.strictEqual(root.length, 1);
    assert.strictEqual(root.firstChild, nodeToInsert);
  });
  test('replaces complex range', function (assert) {
    const {
      root: initial,
      textNodes: { t00, t22 },
    } = vdom`
      <modelRoot>
        <span>
          <text __id="t00">t00</text>
          <text>t01</text>
          <text>t02</text>
        </span>
        <span>
          <text>t10</text>
          <text>t11</text>
          <text>t12</text>
        </span>
        <span>
          <text>t20</text>
          <text>t21</text>
          <text __id="t22">t22</text>
        </span>
        <span/>
      </modelRoot>
    `;
    const { root: nodeToInsert } = vdom`
      <text>abc</text>`;

    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <span __dirty="content">
          <text __dirty="node,content">abc</text>
        </span>
        <span __dirty="content"/>
        <span/>
      </modelRoot>
    `;
    const p1 = ModelPosition.fromInTextNode(t00, 0);
    const p2 = ModelPosition.fromInTextNode(t22, 3);
    const op = new InsertOperation(
      undefined,
      new ModelRange(p1, p2),
      nodeToInsert
    );
    op.execute();
    assert.true(expected.sameAs(initial));
  });
  test('removes items when no nodes to insert are provided', function (assert) {
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
          <text __dirty="content">te</text>
        </div>
        <text __dirty="content">st</text>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const range = new ModelRange(start, end);
    const op = new InsertOperation(undefined, range);

    const resultRange = op.execute().defaultRange;

    assert.true(expected.sameAs(initial));
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(initial as ModelElement, [0, 2], [1])
      )
    );
  });
  test('inserts at start position', function (assert) {
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
      <modelRoot __dirty="content">
        <div __dirty="content">
          <text __dirty="content">ab</text>
          <text __dirty="node,content">ins0</text>
          <text __dirty="node,content">ins1</text>
        </div>
        <div __dirty="content">
          <span>
            <text __dirty="content">op</text>
          </span>
        </div>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const range = new ModelRange(start, end);
    const op = new InsertOperation(
      undefined,
      range,
      new ModelText('ins0'),
      new ModelText('ins1')
    );
    const resultRange = op.execute().defaultRange;
    assert.true(initial.sameAs(expected));
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(initial as ModelElement, [0, 2], [1, 0, 0])
      )
    );
  });
});
