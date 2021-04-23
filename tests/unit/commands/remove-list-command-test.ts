import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import RemoveListCommand from "@lblod/ember-rdfa-editor/commands/remove-list-command";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";

module("Unit | commands | remove-list-command", hooks => {
  const ctx = new ModelTestContext();
  let command: RemoveListCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new RemoveListCommand(ctx.model);
  });


  test("removing a simple list", assert => {

    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");
    const li = new ModelElement("li");
    const content = new ModelText("test");

    model.rootModelNode.addChild(ul);
    ul.addChild(li);
    li.addChild(content);

    modelSelection.collapseIn(content);
    command.execute();

    assert.strictEqual(model.rootModelNode.firstChild, content);
    assert.strictEqual(model.rootModelNode.children.length, 1);

  });

  test("removing a nested list", assert => {

    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");
    const li = new ModelElement("li");

    const ul2 = new ModelElement("ul");
    const li2 = new ModelElement("li");
    const content = new ModelText("test");

    model.rootModelNode.addChild(ul);
    ul.addChild(li);
    li.addChild(ul2);
    ul2.addChild(li2);
    li2.addChild(content);

    modelSelection.collapseIn(content);
    command.execute();

    assert.strictEqual(model.rootModelNode.firstChild, content);
    assert.strictEqual(model.rootModelNode.children.length, 1);

  });
  test("removing a nested listitem with more elements", assert => {
    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");

    const li0 = new ModelElement("li");
    const content0 = new ModelText("content li0");

    const li1 = new ModelElement("li");
    const ul1 = new ModelElement("ul");
    const li10 = new ModelElement("li");
    const content10 = new ModelText("content li10");
    const li11 = new ModelElement("li");
    const content11 = new ModelText("content li11");
    const li12 = new ModelElement("li");
    const content12 = new ModelText("content li12");

    const li2 = new ModelElement("li");
    const content2 = new ModelText("content li2");

    model.rootModelNode.addChild(ul);
    ul.appendChildren(li0, li1, li2);

    li0.addChild(content0);

    li1.addChild(ul1);
    ul1.appendChildren(li10, li11, li12);
    li10.addChild(content10);
    li11.addChild(content11);
    li12.addChild(content12);

    li2.addChild(content2);

    modelSelection.collapseIn(content10);
    command.execute();

    assert.strictEqual(model.rootModelNode.length, 3);
    assert.strictEqual(model.rootModelNode.children[0], ul);
    assert.strictEqual(ul.length, 1);

    assert.strictEqual(ul.firstChild.length, 1);
    assert.strictEqual((ul.firstChild as ModelElement).firstChild, content0);

    assert.strictEqual(model.rootModelNode.children[1], content10);

    assert.strictEqual(ul.length, 1);
    assert.strictEqual(ul.firstChild, li0);

    assert.strictEqual(li11.parent?.length, 2);
    assert.strictEqual(li11.nextSibling, li12);

  });

  test("removing a complex nested list", assert => {

    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");
    const li = new ModelElement("li");

    const ul2 = new ModelElement("ul");
    const li2 = new ModelElement("li");
    const li8 = new ModelElement("li");

    const ol = new ModelElement("ol");
    const li3 = new ModelElement("li");
    const li4 = new ModelElement("li");

    const ul4 = new ModelElement("ul");
    const li5 = new ModelElement("li");
    const li6 = new ModelElement("li");
    const li7 = new ModelElement("li");

    const content = new ModelText("test");
    const content1 = new ModelText("test2");
    const content2 = new ModelText("test3");

    model.rootModelNode.addChild(ul);

    ul.addChild(li);
    li.addChild(ul2);
    ul2.addChild(li2);
    li2.addChild(content);
    ul2.addChild(li8);
    li8.addChild(ol);

    ol.addChild(li3);
    ol.addChild(li4);
    li4.addChild(ul4);

    ul4.addChild(li5);
    ul4.addChild(li6);
    ul4.addChild(li7);
    li6.addChild(content1);
    li6.addChild(content2);

    /*
    ul
      li
        ul2
          li2
            content
          li8
           ul3
            li3
            li4
              ul4
                li5
                li6
                  content1
                  content2
                li7
    */

    modelSelection.collapseIn(content1);
    command.execute();

    assert.strictEqual(model.rootModelNode.children[0], ul);
    assert.strictEqual(model.rootModelNode.children[1], content1);
    assert.strictEqual(model.rootModelNode.children.length, 3);

  });

  test("removing list and a sublist using a selection", assert => {

    // language=XML
    const {root: initialState, textNodes: {rangeStart, rangeEnd}}
      = vdom`
      <ul>
        <li>
          <text __id="rangeStart">top item 1</text>
          <ul>
            <li>
              <text>subitem 1</text>
            </li>
            <li>
              <text>subitem 2</text>
            </li>
            <li>
              <text __id="rangeEnd">subitem 3</text>
            </li>
          </ul>
        </li>
        <li>
          <text>top item 2</text>
        </li>
      </ul>
    `;

    const {modelSelection, model} = ctx;


    // language=XML
    const {root: expectedRoot} = vdom`
      <dummy>
        <text>top item 1</text>
        <br />
        <text>subitem 1</text>
        <br />
        <text>subitem 2</text>
        <br />
        <text>subitem 3</text>
        <ul>
          <li>
            <text>top item 2</text>
          </li>
        </ul>
      </dummy>
    `;

    model.rootModelNode.addChild(initialState);
    const startPosition = ModelPosition.fromInTextNode(rangeStart, 3);
    const endPosition = ModelPosition.fromInTextNode(rangeEnd, rangeEnd.length);
    const range = new ModelRange(startPosition, endPosition);
    modelSelection.clearRanges();
    modelSelection.addRange(range);
    command.execute();
    const resultRoot = model.rootModelNode ;

    for (let i = 0; i < resultRoot.children.length; i++) {
      const actual = resultRoot.children[i];
      const expected = (expectedRoot as ModelElement).children[i];
      assert.true(actual.sameAs(expected));
    }
  });
});
