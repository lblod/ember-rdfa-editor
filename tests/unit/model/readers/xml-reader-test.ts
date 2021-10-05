import {module, test} from "qunit";
import {parseXml, vdom} from "@lblod/ember-rdfa-editor/util/xml-utils"
import ModelTestContext from "dummy/tests/utilities/model-test-context";

module("Unit | model | readers | xml-reader-test", () => {

  test("rootElement gets read as a modelrootnode", assert => {
    const context = new ModelTestContext();
    context.reset();

    // language=XML
    const {root} = vdom`<modelRoot />`;
    assert.true(root.sameAs(context.model.rootModelNode));

  });
  test("test xml", assert => {
    const xml = `
      <div>
        this text will be ignored because it's not inside a text node
        this is also the case for whitespace, so you can format this however you want
        <span __id="coolSpan">
<!--          this is a comment, it will also be ignored -->
          <text __id="myText" bold="true">content</text>
          <span>
            <text>inside test</text>
          </span>
          <text>content2</text>
        </span>
        <p testAttr="value" __id="paragraph" />
        <span>this text is also ignored<text>but this isn't</text></span>
        <img><document><invalidNodeName>warning: there are no checks for invalid html/model state</invalidNodeName></document></img>
      </div>`;

    const {root, elements: {coolSpan, paragraph}, textNodes: {myText}} = parseXml(xml);

    assert.strictEqual(root.length, 4);
    assert.strictEqual(coolSpan.length, 3);
    assert.strictEqual(myText.content, "content");
    assert.strictEqual(paragraph.getAttribute("testAttr"), "value");

  });
});

