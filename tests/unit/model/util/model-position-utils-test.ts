import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelPositionUtils from "@lblod/ember-rdfa-editor/model/util/model-position-utils";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

module("Unit | model | util | model-position-utils", () => {
  module("Unit | model | util | model-position-utils | findNodeBeforePosition", () => {
    test("finds list right before cursor", assert => {
      // language=XML
      const {textNodes: {textNode}, elements: {list}} = vdom`
        <modelRoot>
          <ul __id="list">
            <li>
              <text>first</text>
            </li>
            <li>
              <text>second</text>
            </li>
          </ul>
          <text __id="textNode">third</text>
        </modelRoot>
      `;

      const cursorPosition = ModelPosition.fromInTextNode(textNode, 0);
      const result = ModelPositionUtils.findNodeBeforePosition(cursorPosition, ModelNodeUtils.isListContainer);
      assert.true(result?.sameAs(list));
    });

    test("finds list with table in between", assert => {
      // language=XML
      const {textNodes: {textNode}, elements: {list}} = vdom`
        <modelRoot>
          <ul __id="list">
            <li>
              <text>first</text>
            </li>
            <li>
              <text>second</text>
            </li>
          </ul>
          <table>
            <tbody>
              <tr>
                <td>
                  <text>cell1</text>
                </td>
                <td>
                  <text>cell2</text>
                </td>
              </tr>
            </tbody>
          </table>
          <text __id="textNode">third</text>
        </modelRoot>
      `;

      const cursorPosition = ModelPosition.fromInTextNode(textNode, 0);
      const result = ModelPositionUtils.findNodeBeforePosition(cursorPosition, ModelNodeUtils.isListContainer);
      assert.true(result?.sameAs(list));
    });

    test("returns null when no table not found", assert => {
      // language=XML
      const {textNodes: {textNode}} = vdom`
        <modelRoot>
          <ul>
            <li>
              <text>first</text>
            </li>
            <li>
              <text>second</text>
            </li>
          </ul>
          <text __id="textNode">third</text>
        </modelRoot>
      `;

      const cursorPosition = ModelPosition.fromInTextNode(textNode, 0);
      const result = ModelPositionUtils.findNodeBeforePosition(cursorPosition, ModelNodeUtils.isTableContainer);
      assert.true(result === null);
    });
  });

  module("Unit | model | util | model-position-utils | findNodeAfterPosition", () => {
    test("finds list right after cursor", assert => {
      // language=XML
      const {textNodes: {textNode}, elements: {list}} = vdom`
        <modelRoot>
          <text __id="textNode">first</text>
          <ul __id="list">
            <li>
              <text>second</text>
            </li>
            <li>
              <text>third</text>
            </li>
          </ul>
        </modelRoot>
      `;

      const cursorPosition = ModelPosition.fromInTextNode(textNode, textNode.length);
      const result = ModelPositionUtils.findNodeAfterPosition(cursorPosition, ModelNodeUtils.isListContainer);
      assert.true(result?.sameAs(list));
    });

    test("finds list with table in between", assert => {
      // language=XML
      const {textNodes: {textNode}, elements: {list}} = vdom`
        <modelRoot>
          <text __id="textNode">first</text>
          <table>
            <tbody>
              <tr>
                <td>
                  <text>cell1</text>
                </td>
                <td>
                  <text>cell2</text>
                </td>
              </tr>
            </tbody>
          </table>
          <ul __id="list">
            <li>
              <text>second</text>
            </li>
            <li>
              <text>third</text>
            </li>
          </ul>
        </modelRoot>
      `;

      const cursorPosition = ModelPosition.fromInTextNode(textNode, textNode.length);
      const result = ModelPositionUtils.findNodeAfterPosition(cursorPosition, ModelNodeUtils.isListContainer);
      assert.true(result?.sameAs(list));
    });

    test("returns null when no table not found", assert => {
      // language=XML
      const {textNodes: {textNode}} = vdom`
        <modelRoot>
          <text __id="textNode">first</text>
          <ul __id="list">
            <li>
              <text>second</text>
            </li>
            <li>
              <text>third</text>
            </li>
          </ul>
        </modelRoot>
      `;

      const cursorPosition = ModelPosition.fromInTextNode(textNode, textNode.length);
      const result = ModelPositionUtils.findNodeAfterPosition(cursorPosition, ModelNodeUtils.isTableContainer);
      assert.true(result === null);
    });
  });
});
