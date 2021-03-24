import {module, test} from "qunit";
import {parseXml} from "@lblod/ember-rdfa-editor/model/util/xml-utils";

module("Unit | model | readers | xml-reader-test", hooks => {
  test("test xml", assert => {
    // language=XML
    const xml = `
      <div>
        <span __id="coolSpan">
          <text __id="myText" bold="true">content</text>
          <span>
            <text>inside test</text>
          </span>
          <text>content2</text>
        </span>
        <p testAttr="value"></p>
        <span></span>
      </div>`;

    const {root, elements: {coolSpan}, textNodes: {myText}} = parseXml(xml);

    assert.strictEqual(root.length, 3);
    assert.strictEqual(coolSpan.length, 3);
    assert.strictEqual(myText.content, "content");
  });
});

