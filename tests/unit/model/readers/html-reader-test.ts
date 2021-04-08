import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {dom, domStripped, vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

module("Unit | model | readers | html-reader", hooks => {

  let reader: HtmlReader;
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
    reader = new HtmlReader(ctx.model);
  });

  test("read simple tree", assert => {
    const doc = dom`<p>abc</p>`;
    // language=XML
    const {root: expected} = vdom`
      <p>
        <text>abc</text>
      </p>`;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual.sameAs(expected));
  });
  test("read tree with textStyle elements", assert => {

    const doc = dom`<span><strong>abc</strong></span>`;

    // language=XML
    const {root: expected} = vdom`
      <span>
        <text bold="true">abc</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    console.log(actual.toXml());
    assert.true(actual.sameAs(expected));
  });

  test("read tree with nested textStyle elements", assert => {

    // language=HTML
    const doc = dom`<span><strong><em><u>abc</u></em></strong></span>`;

    // language=XML
    const {root: expected} = vdom`
      <span>
        <text bold="true" italic="true" underline="true">abc</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual.sameAs(expected));
  });

  test("read tree with nested textStyle elements 2", assert => {

    // language=HTML
    const doc = dom`<span><strong><em><u>abc</u>def</em></strong></span>`;

    // language=XML
    const {root: expected} = vdom`
      <span>
        <text bold="true" italic="true" underline="true">abc</text>
        <text bold="true" italic="true">def</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual.sameAs(expected));
  });

  // Note that the DOM specification limits the types of element which can be children of textStyle elements:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong
  // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#phrasing_content
  test("read tree with nested textStyle elements and other elements", assert => {

    // language=HTML
    const doc = domStripped`
      <span>
        <strong>
          <br/>
          <em>
            <br/>
            <u>abc</u>
            <span>def</span>
            ghi
          </em>
        </strong>
      </span>`;

    // language=XML
    const {root: expected} = vdom`
      <span>
        <br/>
        <br/>
        <text bold="true" italic="true" underline="true">abc</text>
        <span>
          <text bold="true" italic="true">def</text>
        </span>
        <text bold="true" italic="true">ghi</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual.sameAs(expected));
  });
  test("read tree with highlights", assert => {

    // language=HTML
    const doc = domStripped`
      <span>
          <span data-editor-highlight="true">abc</span>
        <strong>
          <span data-editor-highlight="true">def</span>
        </strong>
      </span>`;

    // language=XML
    const {root: expected} = vdom`
      <span>
        <text highlighted="true">abc</text>
        <text bold="true" highlighted="true">def</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual.sameAs(expected));
  });
  test("reads table", assert => {

    // language=HTML
    const doc = domStripped`
      <table>
        <thead>
        <tr>
          <th>header0</th>
          <th>header1</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <th>cell00</th>
          <th>cell01</th>
        </tr>
        <tr>
          <th>cell10</th>
          <th>cell11</th>
        </tr>
        </tbody>
      </table>`;

    // language=XML
    const {root: expected} = vdom`
      <table>
        <thead>
          <tr>
            <th>
              <text>header0</text>
            </th>
            <th>
              <text>header1</text>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              <text>cell00</text>
            </th>
            <th>
              <text>cell01</text>
            </th>
          </tr>
          <tr>
            <th>
              <text>cell10</text>
            </th>
            <th>
              <text>cell11</text>
            </th>
          </tr>
        </tbody>
      </table>
    `;

    const actual = reader.read(doc.body.firstChild!)!;

    assert.true(actual.sameAs(expected));
    assert.strictEqual((((actual.root as ModelTable)
      // the header row is also counted
      .getCell(0, 1) as ModelElement)
      .firstChild as ModelText)
      .content, "cell00");
  });
});
