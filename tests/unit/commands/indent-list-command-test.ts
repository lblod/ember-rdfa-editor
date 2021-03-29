import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import IndentListCommand from "@lblod/ember-rdfa-editor/commands/indent-list-command";
import {setupTest} from "ember-qunit";

module("Unit | commands | indent-list-command-test", hooks => {
  const ctx = new ModelTestContext();
  setupTest(hooks);
  hooks.beforeEach(() => {
    ctx.reset();
  });

  test("indents a simple list", assert => {
    // language=XML
    const {root: test, textNodes: {content}} = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
          </li>
          <li>
            <text __id="content">def</text>
          </li>
        </ul>
      </div>`;

    ctx.model.rootModelNode.addChild(test);
    const start = ModelPosition.fromInTextNode(content, 0);
    const range = new ModelRange(start, start);
    ctx.modelSelection.selectRange(range);
    const command = new IndentListCommand(ctx.model);
    command.execute();
    // language=XML
    const {root: rslt} = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
            <ul>
              <li>
                <text>def</text>
              </li>
            </ul>
          </li>
        </ul>
      </div>`;
    assert.true(rslt.sameAs(ctx.model.rootModelNode.firstChild));
  });
});
