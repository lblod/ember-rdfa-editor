import { module, test } from 'qunit';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import globalTextRegionToModelRange from '@lblod/ember-rdfa-editor/utils/global-text-region-to-model-range';

module('Unit | Utility | global-offset-to-path', function () {
  test('returns the correct range for a simple text', function (assert) {
    // language=XML
    const {
      root,
      textNodes: { testNode },
    } = vdom`<div><text __id="testNode">abc</text></div>`;
    const calculatedRange = globalTextRegionToModelRange(
      root as ModelElement,
      0,
      3
    );
    const range = ModelRange.fromInTextNode(testNode, 0, 3);
    assert.deepEqual(range, calculatedRange);
  });

  test('returns the correct range with nested elements', function (assert) {
    // language=XML
    const {
      root,
      textNodes: { startNode, endNode },
    } = vdom`<div>
             <div>
               <text __id="startNode">abc</text>
             </div>
             <div>
               <span><text __id="endNode">abc</text></span>
             </div>
           </div>`;
    const calculatedRange = globalTextRegionToModelRange(
      root as ModelElement,
      0,
      6
    );
    const startPosition = ModelPosition.fromInTextNode(startNode, 0);
    const endPosition = ModelPosition.fromInTextNode(endNode, 3);
    const range = new ModelRange(startPosition, endPosition);
    assert.deepEqual(calculatedRange, range);
  });

  test('for the start of a region prefers the start of a textnode when possible', function (assert) {
    // language=XML
    const {
      root,
      textNodes: { preferedNode },
    } = vdom`<div>
           <div>
             <text __id="otherNode">abc</text>
           </div>
           <div>
             <span><text __id="preferedNode">abc</text></span>
           </div></div>`;
    const calculatedRange = globalTextRegionToModelRange(
      root as ModelElement,
      3,
      6
    );
    const range = ModelRange.fromInTextNode(preferedNode, 0, 3);
    assert.deepEqual(calculatedRange, range);
  });

  test('for the end of a region prefers the end of a textnode when possible', function (assert) {
    // language=XML
    const {
      root,
      textNodes: { preferedNode },
    } = vdom`<div>
           <div>
             <text __id="preferedNode">abc</text>
           </div>
           <div>
             <span><text >abc</text></span>
           </div></div>`;
    const calculatedRange = globalTextRegionToModelRange(
      root as ModelElement,
      0,
      3
    );
    const range = ModelRange.fromInTextNode(preferedNode, 0, 3);
    assert.deepEqual(calculatedRange, range);
  });

  test('for a substring of a text node it calculates the correct range', function (assert) {
    const {
      root,
      textNodes: { theNode },
    } = vdom`<div><text __id="theNode">some text here</text></div>`;
    const calculatedRange = globalTextRegionToModelRange(
      root as ModelElement,
      4,
      8
    );
    const range = ModelRange.fromInTextNode(theNode, 4, 8);
    assert.deepEqual(calculatedRange, range);
  });

  test('it correctly maps a void node to an offset of 1', function (assert) {
    const {
      root,
      textNodes: { theNode },
    } = vdom`<div><br /><text __id="theNode">some text here</text></div>`;
    const calculatedRange = globalTextRegionToModelRange(
      root as ModelElement,
      1,
      5
    );
    const range = ModelRange.fromInTextNode(theNode, 0, 4);
    assert.deepEqual(calculatedRange, range);
  });

  test('it correctly calculates the range when the region is spanning a void node', function (assert) {
    const {
      root,
      textNodes: { startNode, endNode },
    } = vdom`<div><text __id="startNode">some</text><br /><text __id="endNode">text here</text></div>`;
    const calculatedRange = globalTextRegionToModelRange(
      root as ModelElement,
      0,
      9
    );
    const startPosition = ModelPosition.fromInTextNode(startNode, 0);
    const endPosition = ModelPosition.fromInTextNode(endNode, 4);
    const range = new ModelRange(startPosition, endPosition);
    assert.deepEqual(calculatedRange, range);
  });
});
