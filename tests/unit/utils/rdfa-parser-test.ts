import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import {RdfaParser} from "@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser";

module("Unit | utils | rdfa-parser-test", hooks => {
  test("parses simple dom correctly", assert => {
    // language=XML
    const {root} = vdom`
      <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person"> <!-- about:alice -->
        <p>
          <span property="name">
            <text>Alice Birpemswick</text>
          </span>
          <text>Email:</text>
          <a property="mbox" href="mailto:alice@example.com">
            <text>alice@example.com</text>
          </a>
          <text>Phone:</text>
          <a property="phone" href="tel:+1-617-555-7332">
            <text>+1 617.555.7332</text>
          </a>
        </p>
      </div>`;

    const parser = new RdfaParser({baseIRI: "http://example.com"});
    const dataset = parser.parse(root);
    const quads = [...dataset];
    console.log(quads);
    assert.strictEqual(dataset.size, 5);
  });
});
