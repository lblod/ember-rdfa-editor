import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import MoveOperation from "@lblod/ember-rdfa-editor/model/operations/move-operation";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";


module("Unit | model | operations | move-operation-test", () => {
  test("move simple range", assert => {
    // language=XML
    const {root: initial, elements: {target}, textNodes: {source}} = vdom`
      <modelRoot>
        <div __id="target"/>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>abcd</text>
        </div>
      </modelRoot>
    `;

    const srcRange = ModelRange.fromInTextNode(source, 0, 4);
    const targetRange = ModelRange.fromInElement(target, 0, 0);
    const op = new MoveOperation(srcRange, targetRange);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 4])))
  });

  test("move simple range 2", assert => {
    // language=XML
    const {root: initial, elements: {target}, textNodes: {source}} = vdom`
      <modelRoot>
        <div __id="target"/>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>bc</text>
        </div>
        <text>a</text>
        <text>d</text>
      </modelRoot>
    `;

    const srcRange = ModelRange.fromInTextNode(source, 1, 3);
    const targetRange = ModelRange.fromInElement(target, 0, 0);
    const op = new MoveOperation(srcRange, targetRange);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 2])));
  });
  test("overwrite range", assert => {
    // language=XML
    const {root: initial, elements: {target}, textNodes: {source}} = vdom`
      <modelRoot>
        <div __id="target">
          <span>
            <text>I will be gone</text>
          </span>
        </div>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>bc</text>
        </div>
        <text>a</text>
        <text>d</text>
      </modelRoot>
    `;

    const srcRange = ModelRange.fromInTextNode(source, 1, 3);
    const targetRange = ModelRange.fromInElement(target, 0, 1);
    const op = new MoveOperation(srcRange, targetRange);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 2])));
  });

  test("overwrite uneven range", assert => {
    // language=XML
  const {root: initial, elements: {target}, textNodes: {source, targetRangeEnd}} = vdom`
      <modelRoot>
        <div __id="target">
          <span>
            <text>I will be gone</text>
            <span>
              <text __id="targetRangeEnd">efg</text>
            </span>
          </span>
        </div>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>bc</text>
          <text>fg</text>
        </div>
        <text>a</text>
        <text>d</text>
      </modelRoot>
    `;

    const srcRange = ModelRange.fromInTextNode(source, 1, 3);
    const targetStart = ModelPosition.fromInElement(target, 0);
    const targetEnd = ModelPosition.fromInTextNode(targetRangeEnd, 1);
    const targetRange = new ModelRange(targetStart, targetEnd);
    const op = new MoveOperation(srcRange, targetRange);
    const resultRange = op.execute();

    console.log(initial.toXml());
    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 2])));
  });
});
