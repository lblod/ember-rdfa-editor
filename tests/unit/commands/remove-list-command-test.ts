import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import RemoveListCommand from "@lblod/ember-rdfa-editor/commands/remove-list-command";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils"
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants"

module("Unit | commands | remove-list-command", hooks => {
  const ctx = new ModelTestContext();
  let command: RemoveListCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new RemoveListCommand(ctx.model);
  });

  test("removing a simple list", assert => {
    // language=XML
    const {root: initial, textNodes: {content}} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text __id="content">test</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>test</text>
      </modelRoot>
    `;


    ctx.model.fillRoot(initial);

    ctx.modelSelection.collapseIn(content);
    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
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
    command.execute(CORE_OWNER);

    assert.strictEqual(model.rootModelNode.firstChild, content);
    assert.strictEqual(model.rootModelNode.children.length, 1);
  });

  test("removing a nested list item with more elements", assert => {
    // language=XML
    const {root: initial, textNodes: {rangeStart}} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>content0</text>
          </li>
          <li>
            <ul>
              <li>
                <text __id="rangeStart">content10</text>
              </li>
              <li>
                <text>content11</text>
              </li>
              <li>
                <text>content12</text>
              </li>
            </ul>
          </li>
          <li>
            <text>content2</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>content0</text>
          </li>
        </ul>
        <text>content10</text>
        <ul>
          <li>
            <ul>
              <li>
                <text>content11</text>
              </li>
              <li>
                <text>content12</text>
              </li>
            </ul>
          </li>
          <li>
            <text>content2</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    ctx.model.selection.collapseIn(rangeStart, 0);
    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("removing a complex nested list", assert => {
    // language=XML
    const {root: initial, textNodes: {rangeStart}} = vdom`
      <modelRoot>
        <ul>
          <li>
            <ul>
              <li>
                <text>content0</text>
              </li>
              <li>
                <ol>
                  <li/>
                  <li>
                    <ul>
                      <li/>
                      <li>
                        <text __id="rangeStart">content1</text>
                        <text>content2</text>
                      </li>
                      <li/>
                    </ul>
                  </li>
                </ol>
              </li>
            </ul>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li>
            <ul>
              <li>
                <text>content0</text>
              </li>
              <li>
                <ol>
                  <li/>
                  <li>
                    <ul>
                      <li/>
                    </ul>
                  </li>
                </ol>
              </li>
            </ul>
          </li>
        </ul>
        <text __id="rangeStart">content1</text>
        <text>content2</text>
        <ul>
          <li>
            <ul>
              <li>
                <ol>
                  <li>
                    <ul>
                      <li/>
                    </ul>
                  </li>
                </ol>
              </li>
            </ul>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    ctx.modelSelection.collapseIn(rangeStart);
    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
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

    // language=XML
    const {root: expectedRoot} = vdom`
      <dummy>
        <text>top item 1</text>
        <br/>
        <text>subitem 1</text>
        <br/>
        <text>subitem 2</text>
        <br/>
        <text>subitem 3</text>
        <ul>
          <li>
            <text>top item 2</text>
          </li>
        </ul>
      </dummy>
    `;

    const {modelSelection, model} = ctx;
    model.rootModelNode.addChild(initialState);
    const startPosition = ModelPosition.fromInTextNode(rangeStart, 3);
    const endPosition = ModelPosition.fromInTextNode(rangeEnd, rangeEnd.length);
    const range = new ModelRange(startPosition, endPosition);
    modelSelection.clearRanges();
    modelSelection.addRange(range);
    command.execute(CORE_OWNER);
    const resultRoot = model.rootModelNode;

    for (let i = 0; i < resultRoot.children.length; i++) {
      const actual = resultRoot.children[i];
      const expected = (expectedRoot as ModelElement).children[i];
      assert.true(actual.sameAs(expected));
    }
  });
});
