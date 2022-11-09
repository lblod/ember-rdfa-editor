import { module, test } from 'qunit';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ReplaceStep from '@lblod/ember-rdfa-editor/core/state/steps/replace-step';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { modelRangeToSimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { testState } from 'dummy/tests/test-utils';

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
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });

    const step = new ReplaceStep({
      range: modelRangeToSimpleRange(
        ModelRange.fromInElement(initial, initial, 0, 0)
      ),
      nodes: [nodeToInsert],
    });
    const actual = step.getResult(initialState);

    assert.true(actual.state.document.sameAs(expected));
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
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });

    const step = new ReplaceStep({
      range: modelRangeToSimpleRange(
        ModelRange.fromInElement(initial, initial, 0, 0)
      ),
      nodes: [nodeToInsert],
    });
    const actual = step.getResult(initialState);
    assert.true(actual.state.document.sameAs(expected));
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

    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const step = new ReplaceStep({
      range: modelRangeToSimpleRange(
        ModelRange.fromInNode(initial, rangeAnchor, 0, 0)
      ),
      nodes: [nodeToInsert],
    });
    //language=XML
    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <text __dirty="node,content">abc</text>
        <span/>
      </modelRoot>
    `;
    const actual = step.getResult(initialState);
    assert.true(actual.state.document.sameAs(expected));
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

    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const step = new ReplaceStep({
      range: modelRangeToSimpleRange(
        ModelRange.fromInNode(initial, rangeAnchor, 1, 1)
      ),
      nodes: [nodeToInsert],
    });
    const actual = step.getResult(initialState);
    assert.true(actual.state.document.sameAs(expected));
  });
  test('replaces when not collapsed', function (assert) {
    const root = new ModelElement('div');
    const s0 = new ModelElement('span');
    root.addChild(s0);

    const nodeToInsert = new ModelText('abc');

    const initialState = testState({ document: root });
    const step = new ReplaceStep({
      range: modelRangeToSimpleRange(ModelRange.fromPaths(root, [0], [1])),
      nodes: [nodeToInsert],
    });

    const actual = step.getResult(initialState);
    assert.strictEqual(actual.state.document.length, 1);
    assert.strictEqual(actual.state.document.firstChild, nodeToInsert);
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
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const p1 = ModelPosition.fromInTextNode(initial, t00, 0);
    const p2 = ModelPosition.fromInTextNode(initial, t22, 3);

    const step = new ReplaceStep({
      range: modelRangeToSimpleRange(new ModelRange(p1, p2)),
      nodes: [nodeToInsert],
    });
    const actual = step.getResult(initialState);
    assert.true(actual.state.document.sameAs(expected));
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
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const start = ModelPosition.fromInTextNode(initial, rangeStart, 2);
    const end = ModelPosition.fromInTextNode(initial, rangeEnd, 2);
    const range = modelRangeToSimpleRange(new ModelRange(start, end));
    const step = new ReplaceStep({ range });

    const actual = step.getResult(initialState);
    assert.true(actual.state.document.sameAs(expected));
    const resultRange = actual.mapper.mapRange(range);
    assert.deepEqual(
      resultRange,
      modelRangeToSimpleRange(
        ModelRange.fromPaths(actual.state.document, [0, 2], [1])
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
          <text __dirty="content">abins0</text>
          <text __dirty="node,content">ins1</text>
        </div>
        <div __dirty="content">
          <span>
            <text __dirty="content">op</text>
          </span>
        </div>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeStart,
      2
    );
    const end = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeEnd,
      2
    );
    const range = modelRangeToSimpleRange(new ModelRange(start, end));
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const step = new ReplaceStep({
      range,

      nodes: [new ModelText('ins0'), new ModelText('ins1')],
    });
    const actual = step.getResult(initialState);
    const resultRange = actual.mapper.mapRange(range, { startBias: 'left' });
    assert.true(
      actual.state.document.sameAs(expected),
      QUnit.dump.parse(actual.state.document)
    );
    assert.deepEqual(
      resultRange,
      modelRangeToSimpleRange(
        ModelRange.fromPaths(actual.state.document, [0, 2], [1, 0, 0])
      )
    );
  });
});
