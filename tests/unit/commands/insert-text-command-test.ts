import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import InsertTextCommand from "@lblod/ember-rdfa-editor/commands/insert-text-command";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {NON_BREAKING_SPACE, SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";

module("Unit | commands | insert-text-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertTextCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertTextCommand(ctx.model);
  });


  test("inserts character into textnode", assert => {
    // language=XML
    const {root: initial, elements: {parent}} = vdom`
      <modelRoot>
        <div __id="parent">
          <text>abde</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>abcde</text>
        </div>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(parent, 2, 2);
    command.execute("c", range);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
  test("overwrites complex range", assert => {
    // language=XML
    const {root: initial, textNodes: {rangeStart, rangeEnd}} = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">abcd</text>
        </div>
        <div>
          <text>efgh</text>
          <div>
            <text __id="rangeEnd">ijkl</text>
          </div>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>abc</text>
        </div>
        <div>
          <div>
            <text>kl</text>
          </div>
        </div>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const range = new ModelRange(start, end);

    command.execute("c", range);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
  test("replaces spaces with nbsp when needed", assert => {
    // language=XML
    const {root: initial, elements: {parent}} = vdom`
      <modelRoot>
        <div __id="parent">
          <text>abcd${SPACE}</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>abcd${NON_BREAKING_SPACE}${SPACE}</text>
        </div>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(parent, 5, 5);
    command.execute(SPACE, range);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
  test("minimal case: space does not eat the character before it", assert => {
    // language=XML
    const {root: initial, textNodes: {selectionFocus}} = vdom`
      <modelRoot>
        <h1>
          <text>Notulen van de/het</text>
          <span>
            <text __id="selectionFocus">Gemeenteraad Laarne</text>
          </span>
        </h1>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <h1>
          <text>Notulen van de/het</text>
          <span>
            <text __id="selectionFocus">G emeenteraad Laarne</text>
          </span>
        </h1>
      </modelRoot>
    `;
    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(selectionFocus, 1, 1);
    command.execute(SPACE, range);
    assert.true(ctx.model.rootModelNode.sameAs(expected));

  });
  test("detected case: space does not eat the character before it", assert => {
    // language=XML
    const {root: initial, textNodes: {selectionFocus}} = vdom`
      <modelRoot>
        <h1 property="dc:title">
          <text __id="selectionFocus">Notulen van de/het</text>
          <span id="e0431768-cb7c-452a-a85d-7163a1ee3ee0">
            <span property="http://data.vlaanderen.be/ns/besluit#isGehoudenDoor"
                  typeof="http://data.vlaanderen.be/ns/besluit#Bestuursorgaan"
                  resource="http://data.lblod.info/id/bestuursorganen/f5c51e5e2f09f7f2c53f36127f4087da687e120264b4927286c9bbcf46dc12d6">
              <text>Gemeenteraad Laarne</text>
            </span>
          </span>
          <text>, van</text>
          <span id="fb4af6eb-ea5e-4413-9a39-54a9414cb762">
            <span property="besluit:geplandeStart" datatype="xsd:dateTime" content="2020-04-06T14:56:07.290Z">
              <text>6 april 2020, 16:56</text>
            </span>
          </span>
          <text></text>
        </h1>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <h1 property="dc:title">
          <text>Notul en van de/het</text>
          <span id="e0431768-cb7c-452a-a85d-7163a1ee3ee0">
            <span property="http://data.vlaanderen.be/ns/besluit#isGehoudenDoor"
                  typeof="http://data.vlaanderen.be/ns/besluit#Bestuursorgaan"
                  resource="http://data.lblod.info/id/bestuursorganen/f5c51e5e2f09f7f2c53f36127f4087da687e120264b4927286c9bbcf46dc12d6">
              <text>Gemeenteraad Laarne</text>
            </span>
          </span>
          <text>, van</text>
          <span id="fb4af6eb-ea5e-4413-9a39-54a9414cb762">
            <span property="besluit:geplandeStart" datatype="xsd:dateTime" content="2020-04-06T14:56:07.290Z">
              <text>6 april 2020, 16:56</text>
            </span>
          </span>
          <text></text>
        </h1>
      </modelRoot>
    `;
    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(selectionFocus, 5, 5);
    command.execute(SPACE, range);
    assert.true(ctx.model.rootModelNode.sameAs(expected));

  });
});
