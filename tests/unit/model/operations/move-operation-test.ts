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
    const targetPos = ModelPosition.fromInElement(target, 0);
    const op = new MoveOperation(srcRange, targetPos);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 4])));
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
    const targetPos = ModelPosition.fromInElement(target,  0);
    const op = new MoveOperation(srcRange, targetPos);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0, 0], [0, 2])));
  });
});
