import {module, test} from "qunit";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";

module("Unit | model | cleaners | list-cleaner-test", hooks => {

  test("should merge two adjacent lists", assert => {

    // language=XML
    const {root: initial} = vdom`
    <div>
      <ul>
        <li><text>content00</text></li>
      </ul>
      <ul>
        <li><text>content10</text></li>
      </ul>
    </div>
    `;

    const {root: expected} = vdom`
    <div>
      <ul>
        <li><text>content00</text></li>
        <li><text>content10</text></li>
      </ul>
    </div>
    `;

    const cleaner = new ListCleaner();

    cleaner.clean(initial);
    assert.true(initial.sameAs(expected));

  });
});


