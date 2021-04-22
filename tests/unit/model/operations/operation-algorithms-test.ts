import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/model/operations/operation-algorithms";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | model | operations | operation-algorithms-test", () => {
  test("should only remove selected nodes", assert => {
    const {root: initial, elements: {rangeStart}, textNodes: {rangeEnd}} = vdom`
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
    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div __id="rangeStart">
          <span>
            <span>
              <text __id="rangeEnd">fg</text>
            </span>
          </span>
        </div>
        <text>abcd</text>
      </modelRoot>
    `;
    const start = ModelPosition.fromInElement(rangeStart, 0);
    const end = ModelPosition.fromInTextNode(rangeEnd, 1);
    OperationAlgorithms.remove(new ModelRange(start, end));

    console.log(initial.toXml());
    assert.true(initial.sameAs(expected));
  });
});
