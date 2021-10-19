import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import SplitOperation from "@lblod/ember-rdfa-editor/core/operations/split-operation";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";

module("Unit | model | operations | split-operation-test", () => {
  const eventBus = new EventBus();
  test("doesn't split root", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
      </modelRoot>
    `;

    const range = ModelRange.fromPaths(initial as ModelElement, [0], [0]);
    const op = new SplitOperation(eventBus, range);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(range));

  });

  test("doesn't split root", assert => {
    // language=XML
    const {root: initial, textNodes: {rangeStart}} = vdom`
      <modelRoot>
        <text __id="rangeStart">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>ab</text>
        <text>cd</text>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(rangeStart, 2, 2);
    const op = new SplitOperation(eventBus, range);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(range));

  });
  test("splits an element", assert => {
    // language=XML
    const {root: initial, textNodes: {selectionStart}} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">abcd</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>ab</text>
        </div>
        <div>
          <text>cd</text>
        </div>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(selectionStart, 2, 2);
    const op = new SplitOperation(eventBus, range);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [1])));

  });
  test("only splits text when configured", assert => {
    // language=XML
    const {root: initial, textNodes: {selectionStart}} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">abcd</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>ab</text>
          <text>cd</text>
        </div>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(selectionStart, 2, 2);
    const op = new SplitOperation(eventBus, range, false);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(range));

  });
  test("uncollapsed splits both ends", assert => {
    // language=XML
    const {root: initial, textNodes: {selectionStart}} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">abcd</text>
        </div>
      </modelRoot>
    `;
    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">a</text>
        </div>
        <div>
          <text __id="selectionStart">bc</text>
        </div>
        <div>
          <text __id="selectionStart">d</text>
        </div>
      </modelRoot>
    `;
    const range = ModelRange.fromInTextNode(selectionStart, 1, 3);
    const op = new SplitOperation(eventBus, range);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [2])));

  });

  test("uncollapsed over multiple nodessplits both ends", assert => {
    // language=XML
    const {root: initial, textNodes: {selectionStart, selectionEnd}} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
          <div>
            <text>test</text>
          </div>
          <text __id="selectionEnd">cd</text>
        </div>
      </modelRoot>
    `;
    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
        </div>
        <div>
          <div>
            <text>test</text>
          </div>
        </div>
        <div>
          <text __id="selectionEnd">cd</text>
        </div>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(selectionStart, 2);
    const end = ModelPosition.fromInTextNode(selectionEnd, 0);
    const range = new ModelRange(start, end);
    const op = new SplitOperation(eventBus, range);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [2])));

  });

  test("uncollapsed over multiple nodes and levels splits both ends", assert => {
    // language=XML
    const {root: initial, textNodes: {selectionStart, selectionEnd}} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
          <div>
            <text>test</text>
          </div>
          <span>
            <text __id="selectionEnd">cd</text>
          </span>
        </div>
      </modelRoot>
    `;
    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
        </div>
        <div>
          <div>
            <text>test</text>
          </div>
          <span />
          <span>
            <text __id="selectionEnd">cd</text>
          </span>
        </div>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(selectionStart, 2);
    const end = ModelPosition.fromInTextNode(selectionEnd, 0);
    const range = new ModelRange(start, end);
    const op = new SplitOperation(eventBus, range);
    const resultRange = op.execute();

    assert.true(initial.sameAs(expected));
    assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [1,2])));

  });
});
