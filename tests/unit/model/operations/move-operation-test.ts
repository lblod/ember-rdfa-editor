import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import MoveOperation from '@lblod/ember-rdfa-editor/model/operations/move-operation';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { OperationError } from '@lblod/ember-rdfa-editor/utils/errors';

module('Unit | model | operations | move-operation-test', function () {
  test('move simple range', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { target },
      textNodes: { source },
    } = vdom`
      <modelRoot>
        <div __id="target"/>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <div __dirty="content">
          <text>abcd</text>
        </div>
      </modelRoot>
    `;

    const srcRange = ModelRange.fromInTextNode(source, 0, 4);
    const targetPos = ModelPosition.fromInElement(target, 0);
    const op = new MoveOperation(undefined, srcRange, targetPos);
    const resultRange = op.execute().defaultRange;

    assert.true(initial.sameAs(expected, { ignoreDirtiness: false }));
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 4])
      )
    );
  });

  test('move simple range 2', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { target },
      textNodes: { source },
    } = vdom`
      <modelRoot>
        <div __id="target"/>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>bc</text>
        </div>
        <text>a</text>
        <text>d</text>
      </modelRoot>
    `;

    const srcRange = ModelRange.fromInTextNode(source, 1, 3);
    const targetPos = ModelPosition.fromInElement(target, 0);
    const op = new MoveOperation(undefined, srcRange, targetPos);
    const resultRange = op.execute().defaultRange;

    assert.true(initial.sameAs(expected));
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 2])
      )
    );
  });
  test('move uneven range inside textnode', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd, target },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="target">abcd</text>
        </div>
        <div>
          <span>
            <text __id="rangeStart">efgh</text>
            <span>
              <span>
                <text>ijkl</text>
              </span>
              <text>mnop</text>
              <text __id="rangeEnd">qrst</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>ab</text>
          <text>gh</text>
          <span>
            <text>ijkl</text>
          </span>

          <text>mnop</text>
          <text>qr</text>

          <text>cd</text>
        </div>

        <div>
          <span>
            <text>ef</text>
            <span>
              <text __id="rangeEnd">st</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const srcRange = new ModelRange(start, end);
    const targetPos = ModelPosition.fromInTextNode(target, 2);
    const op = new MoveOperation(undefined, srcRange, targetPos);
    const resultRange = op.execute().defaultRange;

    assert.true(initial.sameAs(expected));
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(initial as ModelElement, [0, 2], [0, 11])
      )
    );
  });
  test('throws when target inside src', function (assert) {
    // language=XML
    const {
      elements: { target },
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <div>
        <text __id="rangeStart">ab</text>
        <div __id="target"/>
        <text __id="rangeEnd">cd</text>
      </div>
    `;
    const start = ModelPosition.fromInTextNode(rangeStart, 0);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const targetPos = ModelPosition.fromInElement(target, 0);
    const srcRange = new ModelRange(start, end);

    const op = new MoveOperation(undefined, srcRange, targetPos);
    assert.throws(() => {
      op.execute();
    }, new OperationError('Cannot move to target inside source range'));
  });
});
