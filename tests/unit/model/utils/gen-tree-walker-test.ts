import {module, test} from 'qunit';
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import GenTreeWalker from "@lblod/ember-rdfa-editor/model/util/gen-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

module("Unit | model | utils | gen-tree-walker-test", () => {

  module("Unit | model | utils | gen-tree-walker-test | subtree", () => {
    test("single node - no filter", assert => {
      // language=XML
      const {root, elements: {e0}} = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromSubTree<ModelNode>({root});
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

      const walker = GenTreeWalker.fromSubTree<ModelNode>({root});
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

      const walker = GenTreeWalker.fromSubTree<ModelNode>({root});
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

      const walker = GenTreeWalker.fromSubTree<ModelNode>({root, reverse: true});
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

      const walker = GenTreeWalker.fromSubTree<ModelNode>({root, reverse: true});
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

      const walker = GenTreeWalker.fromSubTree<ModelNode>({root, reverse: true});
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
});
