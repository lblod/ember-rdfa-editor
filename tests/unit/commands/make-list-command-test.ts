import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import MakeListCommand from "@lblod/ember-rdfa-editor/commands/make-list-command";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

module("Unit | commands | make-list-command", hooks => {
  const ctx = new ModelTestContext();
  let command: MakeListCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new MakeListCommand(ctx.model);
  });

  test("adding a list in a document with only a new line", assert => {
    const {modelSelection, model} = ctx;
    const rangeStart = new ModelText();
    rangeStart.content = `
`;
    model.rootModelNode.addChild(rangeStart);
    const startPosition = ModelPosition.fromPath(model.rootModelNode, [1]);
    const range = new ModelRange(startPosition, startPosition);
    modelSelection.clearRanges();
    modelSelection.addRange(range);
    command.execute("ul");
    const resultRoot = model.rootModelNode as ModelElement;
    const ul = model.rootModelNode.children.find((node) => ModelNode.isModelElement(node) && (node as ModelElement).type === "ul");
    assert.ok(ul);
    const ulElement = ul as ModelElement;
    assert.equal(ulElement.childCount, 1);
  })
})
