import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import InsertXmlCommand from "@lblod/ember-rdfa-editor/commands/insert-xml-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import {oneLineTrim} from "common-tags";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | commands | insert-xml-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertXmlCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertXmlCommand(ctx.model);
  });

  test("inserts correctly in empty document", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot/>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const xmlToInsert = oneLineTrim`<div><text>hello world</text></div>`;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, 0);
    ctx.model.selectRange(range);

    command.execute(xmlToInsert);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts correctly in document with empty text node", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
        <text/>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text/>
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const xmlToInsert = oneLineTrim`<div><text>hello world</text></div>`;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, 0);
    ctx.model.selectRange(range);

    command.execute(xmlToInsert);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
