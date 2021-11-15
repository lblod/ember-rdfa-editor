import {module, test} from 'qunit';
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import GenTreeWalker from "@lblod/ember-rdfa-editor/model/util/gen-tree-walker";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

module("Unit | model | utils | gen-tree-walker-test", () => {

  module("Unit | model | utils | gen-tree-walker-test | subtree", () => {
    test("single node - no filter", assert => {
      // language=XML
      const {root, elements: {e0}} = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromSubTree({root});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test("trivial dom - no filter", assert => {
      // language=XML
      const {root, elements: {n0}, textNodes: {n1}} = vdom`
        <div __id="n0">
          <text __id="n1">test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromSubTree({root});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], n0);
      assert.strictEqual(nodes[1], n1);
    });
    test("complex dom - no filter", assert => {
      // language=XML
      const {root, elements: {n0, n3, n5, n6}, textNodes: {n1, n2, n4}} = vdom`
        <div __id="n0">
          <text __id="n1">test</text>
          <text __id="n2">test</text>
          <span __id="n3">
            <text __id="n4">test</text>
          </span>
          <div __id="n5"/>
          <div __id="n6"/>
        </div>
      `;

      const walker = GenTreeWalker.fromSubTree({root});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 7);
      assert.strictEqual(nodes[0], n0);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], n3);
      assert.strictEqual(nodes[4], n4);
      assert.strictEqual(nodes[5], n5);
      assert.strictEqual(nodes[6], n6);
    });

    test("single node - no filter - reverse", assert => {
      // language=XML
      const {root, elements: {e0}} = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromSubTree({root, reverse: true});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test("trivial dom - no filter - reverse", assert => {
      // language=XML
      const {root, elements: {n0}, textNodes: {n1}} = vdom`
        <div __id="n0">
          <text __id="n1">test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromSubTree({root, reverse: true});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], n0);
      assert.strictEqual(nodes[1], n1);
    });
    test("complex dom - no filter - reverse", assert => {
      // language=XML
      const {root, elements: {n0, n1, n2, n3}, textNodes: {n4, n5, n6}} = vdom`
        <div __id="n0">
          <text __id="n6">test</text>
          <text __id="n5">test</text>
          <span __id="n3">
            <text __id="n4">test</text>
          </span>
          <div __id="n2"/>
          <div __id="n1"/>
        </div>
      `;

      const walker = GenTreeWalker.fromSubTree({root, reverse: true});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 7);
      assert.strictEqual(nodes[0], n0);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], n3);
      assert.strictEqual(nodes[4], n4);
      assert.strictEqual(nodes[5], n5);
      assert.strictEqual(nodes[6], n6);
    });
  });
  module("Unit | model | utils | gen-tree-walker-test | start-end", () => {
    test("single node - no filter", assert => {
      // language=XML
      const {root, elements: {e0}} = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromStartEnd({root, start: e0});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test("single node - no filter - reverse", assert => {
      // language=XML
      const {root, elements: {e0}} = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromStartEnd({root, start: e0, reverse: true});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test("trivial dom - no filter", assert => {
      // language=XML
      const {root, elements: {n0}, textNodes: {n1, n2}} = vdom`
        <div __id="n0">
          <text __id="n1">test</text>
          <text __id="n2">test</text>
          <text __id="n3">test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromStartEnd({root, start: n1, end: n2});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], n1);
      assert.strictEqual(nodes[1], n2);

      const walker2 = GenTreeWalker.fromStartEnd({root, start: n0, end: n2});
      const nodes2 = [...walker2.nodes()];
      assert.strictEqual(nodes2.length, 3);
      assert.strictEqual(nodes2[0], n0);
      assert.strictEqual(nodes2[1], n1);
      assert.strictEqual(nodes2[2], n2);
    });

    test("trivial dom - no filter - reverse", assert => {
      // language=XML
      const {root, elements: {n0}, textNodes: {start, end}} = vdom`
        <div __id="n0">
          <text __id="end">test</text>
          <text __id="start">test</text>
          <text>test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromStartEnd({root, start, end, reverse: true});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], end);

      const walker2 = GenTreeWalker.fromStartEnd({root, start, end: n0, reverse: true});
      const nodes2 = [...walker2.nodes()];
      assert.strictEqual(nodes2.length, 2);
      assert.strictEqual(nodes2[0], start);
      assert.strictEqual(nodes2[1], end);
    });
    test("complex dom - no filter - reverse", assert => {
      // language=XML
      const {root, elements: {n2, end}, textNodes: {n1, start}} = vdom`
        <div>
          <div __id="n2">
            <span __id="end">
              <text>test0</text>
            </span>
          </div>
          <text __id="n1">test1</text>
          <span>
            <text __id="start">test2</text>
          </span>
          <div/>
          <div/>
        </div>
      `;

      const walker = GenTreeWalker.fromStartEnd({root, start, end, reverse: true});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 4);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], end);
    });
  });
  module("Unit | model | utils | gen-tree-walker-test | start-end", () => {
    test("complex dom - no filter", assert => {
      // language=XML
      const {elements: {start, n3}, textNodes: {n1, n2, end}} = vdom`
        <div>
          <div>
            <span __id="start">
              <text __id="n1">test0</text>
            </span>
          </div>
          <text __id="n2">test1</text>
          <span __id="n3">
            <text __id="end">test2</text>
          </span>
          <div/>
          <div/>
        </div>
      `;

      const startPos = ModelPosition.fromBeforeNode(start);
      const endPos = ModelPosition.fromInTextNode(end, 1);
      const range = new ModelRange(startPos, endPos);
      const walker = GenTreeWalker.fromRange({range});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 5);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], n3);
      assert.strictEqual(nodes[4], end);
    });

    test("complex dom - no filter - range after element", assert => {
      // language=XML
      const {elements: {start, end}, textNodes: {n1, n2, n3}} = vdom`
        <div>
          <div>
            <span __id="start">
              <text __id="n1">test0</text>
            </span>
          </div>
          <text __id="n2">test1</text>
          <span __id="end">
            <text __id="n3">test2</text>
          </span>
          <div/>
          <div/>
        </div>
      `;

      const startPos = ModelPosition.fromBeforeNode(start);
      const endPos = ModelPosition.fromAfterNode(end);
      const range = new ModelRange(startPos, endPos);
      const walker = GenTreeWalker.fromRange({range});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 5);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], end);
      assert.strictEqual(nodes[4], n3);
    });
    test("complex dom - collapsed range in textNode", assert => {
      // language=XML
      const {textNodes: {textNode}} = vdom`
        <div>
          <div>
            <span>
              <text __id="textNode">test0</text>
            </span>
          </div>
          <text>test1</text>
          <span>
            <text>test2</text>
          </span>
          <div/>
          <div/>
        </div>
      `;
      const range = ModelRange.fromInTextNode(textNode, 1, 1);

      const walker = GenTreeWalker.fromRange({range});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], textNode);
    });
    test("complex dom - collapsed range outside textNode", assert => {
      // language=XML
      const {textNodes: {textNode}} = vdom`
        <div>
          <div>
            <span>
              <text __id="textNode">test0</text>
            </span>
          </div>
          <text>test1</text>
          <span>
            <text>test2</text>
          </span>
          <div/>
          <div/>
        </div>
      `;
      const start = ModelPosition.fromBeforeNode(textNode);
      const range = new ModelRange(start, start);

      const walker = GenTreeWalker.fromRange({range});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 0);
    });
    test("complex dom - range containing no nodes", assert => {
      // language=XML
      const {elements: {start, end}} = vdom`
        <div>
          <div>
            <span>
              <text>test0</text>
            </span>
          </div>
          <text>test1</text>
          <span __id="start">
            <text>test2</text>
            <!--range start -->
          </span>
          <!-- range end -->
          <div __id="end"/>
          <div/>
        </div>
      `;
      const startPos = ModelPosition.fromAfterNode(start);
      const endPos = ModelPosition.fromBeforeNode(end);
      const range = new ModelRange(startPos, endPos);

      const walker = GenTreeWalker.fromRange({range});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 0);
    });
    test("complex dom - no filter - reverse", assert => {
      // language=XML
      const {elements: {rangeStart, n2}, textNodes: {n1, n3, rangeEnd}} = vdom`
        <div>
          <div __id="n2">
            <span __id="rangeStart"><!--[-->
              <text __id="n3">test0</text>
            </span>
          </div>
          <text __id="n1">test1</text>
          <span>
            <text __id="rangeEnd">t]est2</text>
          </span>
          <div/>
          <div/>
        </div>
      `;

      const startPos = ModelPosition.fromBeforeNode(rangeStart);
      const endPos = ModelPosition.fromInTextNode(rangeEnd, 1);
      const range = new ModelRange(startPos, endPos);
      const walker = GenTreeWalker.fromRange({range, reverse: true});
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 5);
      assert.strictEqual(nodes[0], rangeEnd);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], rangeStart);
      assert.strictEqual(nodes[4], n3);
    });
  });
});
