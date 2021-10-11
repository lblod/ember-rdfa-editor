import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {CORE_OWNER, INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import InsertNewLiCommand from "lists-plugin/commands/insert-newLi-command";

//TODO: These tests serve at the moment as a documentation for
// what the command currently does, and as a way of catching possible
// regressions for things that might depend on its behavior.
// In particular, all the extra empty textnodes should not be there.

module("Unit | commands | insert-new-li-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertNewLiCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertNewLiCommand(ctx.model);
  });

  test("insert li - single empty li - collapsed selection", assert => {
    // language=XML
    const {root: initial, elements: {testLi}} = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>${INVISIBLE_SPACE}</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
          </li>
          <li>
            <text>${INVISIBLE_SPACE}</text>
          </li>
        </ul>
      </div>
    `;

    ctx.model.rootModelNode.addChild(initial);
    ctx.modelSelection.selectRange(ModelRange.fromInElement(testLi, 0, 0));
    command.execute(CORE_OWNER);
    const actual = ctx.model.rootModelNode.firstChild;

    assert.true(actual.sameAs(expected));
  });

  test("insert li - single nonempty li - collapsed selection in front", assert => {
    // language=XML
    const {root: initial, elements: {testLi}} = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
          </li>
          <li>
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    ctx.model.rootModelNode.addChild(initial);
    ctx.modelSelection.selectRange(ModelRange.fromInElement(testLi, 0, 0));
    command.execute(CORE_OWNER);
    const actual = ctx.model.rootModelNode.firstChild;

    assert.true(actual.sameAs(expected));
  });

  test("insert li - single nonempty li - collapsed selection at end", assert => {
    // language=XML
    const {root: initial, elements: {testLi}} = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
          </li>
          <li>
          </li>
        </ul>
      </div>
    `;

    ctx.model.rootModelNode.addChild(initial);
    ctx.modelSelection.selectRange(ModelRange.fromInElement(testLi, 3, 3));
    command.execute(CORE_OWNER);
    const actual = ctx.model.rootModelNode.firstChild;

    assert.true(actual.sameAs(expected));
  });

  test("insert li - single nonempty li - collapsed selection in middle", assert => {
    // language=XML
    const {root: initial, elements: {testLi}} = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
            <text>a</text>
          </li>
          <li>
            <text>bc</text>
          </li>
        </ul>
      </div>
    `;

    ctx.model.rootModelNode.addChild(initial);
    ctx.modelSelection.selectRange(ModelRange.fromInElement(testLi, 1, 1));
    command.execute(CORE_OWNER);
    const actual = ctx.model.rootModelNode.firstChild;

    assert.true(actual.sameAs(expected));
  });

  test("insert li - single nonempty li with elements - collapsed selection inside child elem", assert => {
    // language=XML
    const {root: initial, textNodes: {insideChild}} = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
            <span>
              <text __id="insideChild">child</text>
            </span>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
            <span>
              <text>c</text>
            </span>
          </li>
          <li>
            <span>
              <text>hild</text>
            </span>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    ctx.model.rootModelNode.addChild(initial);
    ctx.modelSelection.selectRange(ModelRange.fromInTextNode(insideChild, 1, 1));
    command.execute(CORE_OWNER);
    const actual = ctx.model.rootModelNode.firstChild;

    assert.true(actual.sameAs(expected));
  });

  test("insert li - single nonempty li - uncollapsed within li", assert => {
    // language=XML
    const {root: initial, elements: {testLi}} = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abcd</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
            <text>a</text>
          </li>
          <li>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    ctx.model.rootModelNode.addChild(initial);
    ctx.modelSelection.selectRange(ModelRange.fromInElement(testLi, 1, 3));
    command.execute(CORE_OWNER);
    const actual = ctx.model.rootModelNode.firstChild;

    assert.true(actual.sameAs(expected));
  });

  test("insert li - single nonempty li with elements - uncollapsed within li", assert => {
    // language=XML
    const {root: initial, elements: {testLi}} = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
            <div>
              <text>inside child</text>
            </div>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
            <text>a</text>
          </li>
          <li>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    ctx.model.rootModelNode.addChild(initial);
    ctx.modelSelection.selectRange(ModelRange.fromInElement(testLi, 1, testLi.getMaxOffset() - 1));
    command.execute(CORE_OWNER);
    const actual = ctx.model.rootModelNode.firstChild;

    assert.true(actual.sameAs(expected));
  });
});

