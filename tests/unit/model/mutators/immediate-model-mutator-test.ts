import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {setupTest} from "ember-qunit";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | model | mutators | immediate-model-mutator-test", hooks => {
  const ctx = new ModelTestContext();
  setupTest(hooks);
  hooks.beforeEach(() => {
    ctx.reset();
  });
  test("splitUntil splits until predicate true", assert => {
    // language=XML
    const {root: initial, textNodes: {rangeStart}} = vdom`
      <modelRoot>
        <div>
          <span>
            <span>
              <text __id="rangeStart">abcd</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <span>
            <span>
              <text __id="rangeStart">ab</text>
            </span>
          </span>
          <span>
            <span>
              <text __id="rangeStart">cd</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;
    const position = ModelPosition.fromInTextNode(rangeStart, 2);
    const mut = new ImmediateModelMutator();
    const resultPos = mut.splitUntil(position, element => element.type === "div");
    assert.true(initial.sameAs(expected));
    assert.true(resultPos.sameAs(ModelPosition.fromPath(initial as ModelElement, [0, 1])));

  });
  module("Unit | model | mutators | immediate-model-mutator-test | unwrap", () => {
    test("unwrap simple element", assert => {
      // language=XML
      const {root: initial, elements: {wrapper}} = vdom`
        <modelRoot>
          <div __id="wrapper">
            <text>abc</text>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <text>abc</text>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const resultRange = mut.unwrap(wrapper);
      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0], [3])));

    });

    test("unwrap complex element", assert => {
      // language=XML
      const {root: initial, elements: {wrapper}} = vdom`
        <modelRoot>
          <span>
            <text>stuff</text>
          </span>
          <div>

            <div __id="wrapper">
              <text>abc</text>
              <span>
                <text>hello</text>
                <text>world</text>
              </span>
              <div/>
            </div>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <span>
            <text>stuff</text>
          </span>
          <div>
            <text>abc</text>
            <span>
              <text>hello</text>
              <text>world</text>
            </span>
            <div/>
          </div>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const resultRange = mut.unwrap(wrapper);
      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1, 0], [1, 5])));

    });
    test("unwrap complex nested elements in sequence", assert => {
      // language=XML
      const {root: initial, elements: {n0, n1, n2, n3}} = vdom`
        <modelRoot>
          <ul>
            <li>
              <text>content0</text>
            </li>
          </ul>
          <ul __id="n0">
            <li __id="n1">
              <ul __id="n2">
                <li __id="n3">
                  <text __id="n4">content10</text>
                </li>
              </ul>
            </li>
          </ul>
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

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <ul>
            <li>
              <text>content0</text>
            </li>
          </ul>
          <text __id="n4">content10</text>
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
      const mut = new ImmediateModelMutator();
      mut.unwrap(n0);
      mut.unwrap(n1);
      mut.unwrap(n2);
      mut.unwrap(n3);
      assert.true(initial.sameAs(expected));
    });
    test("unwrap with ensureBlocks inserts brs correctly", assert => {
      // language=XML
      const {root: initial, elements: {wrapper}} = vdom`
        <modelRoot>
          <div>
            <text>abcd</text>
            <div __id="wrapper">
              <text>content</text>
            </div>
            <text>efgh</text>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <div>
            <text>abcd</text>
            <br/>
            <text>content</text>
            <br/>
            <text>efgh</text>
          </div>
        </modelRoot>
      `;
      const mut = new ImmediateModelMutator();
      mut.unwrap(wrapper, true);
      assert.true(initial.sameAs(expected));
    });


  });
  module("Unit | model | mutators | immediate-model-mutator-test | inserting", () => {
    test("inserts into position correctly", assert => {
      // language=XML
      const {root: initial, textNodes: {rangeStart}} = vdom`
        <modelRoot>
          <text __id="rangeStart">abcd</text>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <text>abcd</text>
          <br/>
        </modelRoot>
      `;
      const mut = new ImmediateModelMutator();
      const pos = ModelPosition.fromAfterNode(rangeStart);
      mut.insertAtPosition(pos, new ModelElement("br"));

      assert.true(initial.sameAs(expected));

    });

    test("inserts into position correctly nested", assert => {
      // language=XML
      const {root: initial} = vdom`
        <modelRoot>
          <div>
            <text>abcd</text>
            <text>content</text>
            <text>efgh</text>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <div>
            <text>abcd</text>
            <text>content</text>
            <br/>
            <text>efgh</text>
          </div>
        </modelRoot>
      `;
      const range = ModelRange.fromPaths(initial as ModelElement, [0, 4], [0, 11]);
      const mut = new ImmediateModelMutator();
      mut.insertAtPosition(range.end, new ModelElement("br"));

      assert.true(initial.sameAs(expected));

    });

  });
  module("Unit | model | mutators | immediate-model-mutator-test | splitting", () => {
    test("split simple range", assert => {
      // language=XML
      const {root: initial, textNodes: {rangeStart}} = vdom`
        <modelRoot>
          <div>
            <text __id="rangeStart">abcd</text>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <div>
            <text>ab</text>
          </div>
          <div>
            <text>cd</text>
          </div>
        </modelRoot>
      `;
      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInTextNode(rangeStart, 2, 2);
      const resultRange = mut.splitRangeUntilElements(range, initial as ModelElement, initial as ModelElement, false);
      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [1])));
    });


    test("split simple uncollapsed range", assert => {
      // language=XML
      const {root: initial, textNodes: {rangeStart}} = vdom`
        <modelRoot>
          <div>
            <text __id="rangeStart">abcd</text>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <div>
            <text>a</text>
          </div>
          <div>
            <text>bc</text>
          </div>
          <div>
            <text>d</text>
          </div>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInTextNode(rangeStart, 1, 3);
      const resultRange = mut.splitRangeUntilElements(range, initial as ModelElement, initial as ModelElement, false);

      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [2])));
    });

    test("split simple uncollapsed range in text (child of root)", assert => {
      // language=XML
      const {root: initial, textNodes: {rangeStart}} = vdom`
        <modelRoot>
          <text __id="rangeStart">abcd</text>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <text>a</text>
          <text>bc</text>
          <text>d</text>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInTextNode(rangeStart, 1, 3);
      const resultRange = mut.splitRangeUntilElements(range, initial as ModelElement, initial as ModelElement, false);

      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [3])));
    });

    test("split simple uncollapsed range selecting div", assert => {
      // language=XML
      const {root: initial} = vdom`
        <modelRoot>
          <div>
            <text>abcd</text>
          </div>
          <div>
            <text>efgh</text>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <div>
            <text>abcd</text>
          </div>
          <div>
            <text>efgh</text>
          </div>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInNode(initial, 0, 1);
      const resultRange = mut.splitRangeUntilElements(range, initial as ModelElement, initial as ModelElement, false);

      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0], [1])));
    });

    test("split uneven uncollapsed range", assert => {
      // language=XML
      const {root: initial, textNodes: {rangeStart, rangeEnd}} = vdom`
        <modelRoot>
          <div>
            <text __id="rangeStart">abcd</text>
            <span>
              <text __id="rangeEnd">efgh</text>
            </span>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <div>
            <text>a</text>
          </div>
          <div>
            <text>bcd</text>
            <span>
              <text>ef</text>
            </span>
          </div>
          <div>
            <span>
              <text>gh</text>
            </span>
          </div>
        </modelRoot>
      `;
      const mut = new ImmediateModelMutator();
      const start = ModelPosition.fromInTextNode(rangeStart, 1);
      const end = ModelPosition.fromInTextNode(rangeEnd, 2);
      const range = new ModelRange(start, end);
      const resultRange = mut.splitRangeUntilElements(range, initial as ModelElement, initial as ModelElement, false);
      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [2])));
    });

    test("split complex uncollapsed range", assert => {
      // language=XML
      const {root: initial, elements: {rangeContainer}} = vdom`
        <modelRoot>
          <ul>
            <li>
              <text>content0</text>
            </li>
            <li>
              <ul __id="rangeContainer">
                <li>
                  <text>content10</text>
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
          <ul>
            <li>
              <ul>
                <li>
                  <text>content10</text>
                </li>
              </ul>
            </li>
          </ul>
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
      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInElement(rangeContainer, 0, 1);
      const resultRange = mut.splitRangeUntilElements(range, initial as ModelElement, initial as ModelElement, false);
      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1], [2])));
    });
  });
  module("Unit | model | mutators | immediate-model-mutator-test | insertText", () => {
    test("insert text into root", assert => {
      // language=XML
      const {root: initial} = vdom`
        <modelRoot/>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <text>abc</text>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInElement(initial as ModelElement, 0, 0);
      const resultRange = mut.insertText(range, "abc");
      assert.true(initial.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromInElement(initial as ModelElement, 3, 3)));

    });

    test("insert empty text into root", assert => {
      // language=XML
      const {root: initial} = vdom`
        <modelRoot/>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <text/>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInElement(initial as ModelElement, 0, 0);
      const resultRange = mut.insertText(range, "");
      assert.true(initial.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromInElement(initial as ModelElement, 0, 0)));

    });

    test("insert text into text node merges", assert => {
      // language=XML
      const {root: initial} = vdom`
        <modelRoot>
          <text>abef</text>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <text>abcdef</text>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const range = ModelRange.fromInElement(initial as ModelElement, 2, 2);
      const resultRange = mut.insertText(range, "cd");

      assert.true(initial.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromInElement(initial as ModelElement, 4, 4)));
    });
  });
});
