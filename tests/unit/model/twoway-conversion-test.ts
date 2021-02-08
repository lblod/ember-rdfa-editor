import {module, test} from "qunit";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import HtmlWriter from "@lblod/ember-rdfa-editor/model/writers/html-writer";
import ModelTestContext from "dummy/tests/utilities/model-test-context";

module("Unit | model | twoway-conversion", hooks => {
  let reader: HtmlReader;
  let writer: HtmlWriter;
  const ctx = new ModelTestContext();

  hooks.beforeEach(() => {
    ctx.reset();
    reader = new HtmlReader(ctx.model);
    writer = new HtmlWriter(ctx.model);
  });
  test("converting simple tree back and forth gives same tree", assert => {
    const p = document.createElement('p');
    p.innerHTML = `<p><ul><li> some text <div style="background-color:green"><a href="#">an <em> italic |- </em> link</a></div></li></ul></p>`;
    const read = reader.read(p);
    const written = writer.write(read) as HTMLElement;

    assert.strictEqual(written.outerHTML, p.outerHTML);

  });
  test("<i> gets converted to <em>", assert => {
    const p = document.createElement('p');
    p.innerHTML = `<p><ul> <li> some text <div style="background-color:green"><a href="#">an <i> italic |- </i> link</a></div></li> </ul></p>`;
    const read = reader.read(p);
    const written = writer.write(read) as HTMLElement;
    // the inner p will get broken up by the dom as per the html standard
    // this happens before the model reads it
    // https://developer.mozilla.org/en-us/docs/Web/HTML/Element/p
    const expected = `<p></p><ul><li> some text <div style="background-color:green"><a href="#">an <em> italic |- </em> link</a></div></li></ul><p></p>`;

    assert.strictEqual(written.innerHTML, expected);

  });

});
