import {module, test} from "qunit";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator";

module("Unit | model | cleaners | list-cleaner-test", () => {

  test("should merge two adjacent lists", assert => {
    // language=XML
    const {root: initial, elements: {container}} = vdom`
      <div __id="container">
        <ul>
          <li>
            <text>content00</text>
          </li>
        </ul>
        <ul>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
            <text>content00</text>
          </li>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    const cleaner = new ListCleaner();
    const mutator = new ImmediateModelMutator();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range, mutator);

    assert.true(initial.sameAs(expected));
  });

  test("does not merge lists on a different level", assert => {
    // language=XML
    const {root: initial, elements: {container}} = vdom`
      <div __id="container">
        <ul>
          <li>
            <text>content00</text>
          </li>
        </ul>
        <div>
          <ul>
            <li>
              <text>content10</text>
            </li>
          </ul>
        </div>
      </div>
    `;

    const expected = initial.clone();
    const mutator = new ImmediateModelMutator();
    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range, mutator);

    assert.true(initial.sameAs(expected));
  });

  test("does not merge lists with different attributes", assert => {
    // language=XML
    const {root: initial, elements: {container}} = vdom`
      <div __id="container">
        <ul test="a">
          <li>
            <text>content00</text>
          </li>
        </ul>
        <ul test="b">
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    const expected = initial.clone();

    const mutator = new ImmediateModelMutator();
    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range, mutator);

    assert.true(initial.sameAs(expected));
  });

  test("should merge lists with different but ignored attributes", assert => {
    // language=XML
    const {root: initial, elements: {container}} = vdom`
      <div __id="container">
        <ul __dummy_test_attr="a">
          <li>
            <text>content00</text>
          </li>
        </ul>
        <ul __dummy_test_attr="b">
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul __dummy_test_attr="b">
          <li>
            <text>content00</text>
          </li>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    const mutator = new ImmediateModelMutator();
    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range, mutator);

    assert.true(initial.sameAs(expected));
  });
  test("should merge nested lists correctly", assert => {
    // language=XML
    const {root: initial, elements:{container}} = vdom`
      <div __id="container">
        <ul>
          <li>
            <text>content00</text>
            <ul>
              <li>
                <text>abc</text>
              </li>
            </ul>
            <ul>
              <li>
                <text>def</text>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const {root: expected} = vdom`
      <div>
        <ul>
          <li>
            <text>content00</text>
            <ul>
              <li>
                <text>abc</text>
              </li>
              <li>
                <text>def</text>
              </li>
            </ul>
          </li>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    const mutator = new ImmediateModelMutator();
    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range, mutator);

    assert.true(initial.sameAs(expected));
  });
});


