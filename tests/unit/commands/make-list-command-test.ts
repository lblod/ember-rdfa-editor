import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import MakeListCommand from "@lblod/ember-rdfa-editor/commands/make-list-command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";

module("Unit | commands | make-list-command", hooks => {
  const ctx = new ModelTestContext();
  let command: MakeListCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new MakeListCommand(ctx.model);
  });

  test("adds list in an empty document", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot/>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li></li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, 0);
    ctx.model.selectRange(range);

    command.execute("ul");
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("adds list in a document with only a new line", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
        <text>${"\n"}</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>${"\n"}</text>
        <ul>
          <li></li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 1, 1);
    ctx.model.selectRange(range);

    command.execute("ul");
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("creates list from lines of text", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
        <text>first line</text>
        <br/>
        <text>second line</text>
        <br/>
        <text>third line</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first line</text>
          </li>
          <li>
            <text>second line</text>
          </li>
          <li>
            <text>third line</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, ctx.model.rootModelNode.getMaxOffset());
    ctx.model.selectRange(range);

    command.execute("ul");
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("creates list from text before list", assert => {
    // language=XML
    const {root: initial, textNodes: {firstLine}} = vdom`
      <modelRoot>
        <text __id="firstLine">line before list</text>
        <ul>
          <li>
            <text>first li</text>
          </li>
          <li>
            <text>second li</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>line before list</text>
          </li>
          <li>
            <text>first li</text>
          </li>
          <li>
            <text>second li</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(firstLine, 1, 3);
    ctx.model.selectRange(range);

    command.execute("ul");
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
