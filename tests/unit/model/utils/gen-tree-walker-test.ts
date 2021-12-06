import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import sinon from 'sinon';

module('Unit | model | utils | gen-tree-walker-test', (hooks) => {
  hooks.afterEach(() => {
    sinon.restore();
  });

  module('Unit | model | utils | gen-tree-walker-test | subtree', () => {
    test('single node - no filter', (assert) => {
      // language=XML
      const {
        root,
        elements: { e0 },
      } = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromSubTree({ root });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test('trivial dom - no filter', (assert) => {
      // language=XML
      const {
        root,
        elements: { n0 },
        textNodes: { n1 },
      } = vdom`
        <div __id="n0">
          <text __id="n1">test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromSubTree({ root });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], n0);
      assert.strictEqual(nodes[1], n1);
    });
    test('complex dom - no filter', (assert) => {
      // language=XML
      const {
        root,
        elements: { n0, n3, n5, n6 },
        textNodes: { n1, n2, n4 },
      } = vdom`
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

      const walker = GenTreeWalker.fromSubTree({ root });
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

    test('single node - no filter - reverse', (assert) => {
      // language=XML
      const {
        root,
        elements: { e0 },
      } = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromSubTree({ root, reverse: true });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test('trivial dom - no filter - reverse', (assert) => {
      // language=XML
      const {
        root,
        elements: { n0 },
        textNodes: { n1 },
      } = vdom`
        <div __id="n0">
          <text __id="n1">test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromSubTree({ root, reverse: true });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], n0);
      assert.strictEqual(nodes[1], n1);
    });
    test('complex dom - no filter - reverse', (assert) => {
      // language=XML
      const {
        root,
        elements: { n0, n1, n2, n3 },
        textNodes: { n4, n5, n6 },
      } = vdom`
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

      const walker = GenTreeWalker.fromSubTree({ root, reverse: true });
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
    test('real case', (assert) => {
      // language=XML
      const { root } = vdom`
        <div id="ember102" class="container-flex--contain ember-view" vocab="http://data.vlaanderen.be/ns/besluit#"
             prefix="eli: http://data.europa.eu/eli/ontology# prov: http://www.w3.org/ns/prov# mandaat: http://data.vlaanderen.be/ns/mandaat# besluit: http://data.vlaanderen.be/ns/besluit# ext: http://mu.semte.ch/vocabularies/ext/ person: http://www.w3.org/ns/person# persoon: http://data.vlaanderen.be/ns/persoon# dateplugin: http://say.data.gift/manipulators/insertion/ besluittype: https://data.vlaanderen.be/id/concept/BesluitType/ dct: http://purl.org/dc/terms/ mobiliteit: https://data.vlaanderen.be/ns/mobiliteit# lblodmow: http://data.lblod.info/vocabularies/mobiliteit/ "
             typeof="foaf:Document" resource="#">
          <div resource="http://data.lblod.info/id/zittingen/66dc1a95-1896-401b-a8a6-cf8d7750f851"
               typeof="besluit:Zitting">
            <text>
            </text>
            <div property="besluit:heeftNotulen"
                 resource="http://data.lblod.info/id/lblod/notulen/c1815b872ad82781129e1630c601936952c3d59f8dbcd1c3ddd3228870a37f29">
              <text>
              </text>
              <div property="prov:value">
                <text>
                </text>
                <div typeof="besluit:Zitting"
                     resource="http://data.lblod.info/id/zittingen/66dc1a95-1896-401b-a8a6-cf8d7750f851">
                  <text>
                  </text>
                  <h1 property="dc:title">
                    <text>
                      Notulen van de/het
                    </text>
                    <span id="e0431768-cb7c-452a-a85d-7163a1ee3ee0">
                      <span property="http://data.vlaanderen.be/ns/besluit#isGehoudenDoor"
                            typeof="http://data.vlaanderen.be/ns/besluit#Bestuursorgaan"
                            resource="http://data.lblod.info/id/bestuursorganen/f5c51e5e2f09f7f2c53f36127f4087da687e120264b4927286c9bbcf46dc12d6">
                        <text>
                          Gemeenteraad Laarne
                        </text>
                      </span>
                    </span>
                  </h1>
                </div>
              </div>
              <text>
              </text>
            </div>
            <text>
            </text>
          </div>
        </div>
      `;
      const walker = GenTreeWalker.fromSubTree({ root });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 16);
    });
  });
  module('Unit | model | utils | gen-tree-walker-test | start-end', () => {
    test('single node - no filter', (assert) => {
      // language=XML
      const {
        root,
        elements: { e0 },
      } = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromStartEnd({ root, start: e0 });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test('single node - no filter - reverse', (assert) => {
      // language=XML
      const {
        root,
        elements: { e0 },
      } = vdom`
        <div __id="e0"/>
      `;

      const walker = GenTreeWalker.fromStartEnd({
        root,
        start: e0,
        reverse: true,
      });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], e0);
    });

    test('trivial dom - no filter', (assert) => {
      // language=XML
      const {
        root,
        elements: { n0 },
        textNodes: { n1, n2 },
      } = vdom`
        <div __id="n0">
          <text __id="n1">test</text>
          <text __id="n2">test</text>
          <text __id="n3">test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromStartEnd({ root, start: n1, end: n2 });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], n1);
      assert.strictEqual(nodes[1], n2);

      const walker2 = GenTreeWalker.fromStartEnd({ root, start: n0, end: n2 });
      const nodes2 = [...walker2.nodes()];
      assert.strictEqual(nodes2.length, 3);
      assert.strictEqual(nodes2[0], n0);
      assert.strictEqual(nodes2[1], n1);
      assert.strictEqual(nodes2[2], n2);
    });

    test('trivial dom - no filter - reverse', (assert) => {
      // language=XML
      const {
        root,
        elements: { n0 },
        textNodes: { start, end },
      } = vdom`
        <div __id="n0">
          <text __id="end">test</text>
          <text __id="start">test</text>
          <text>test</text>
        </div>
      `;

      const walker = GenTreeWalker.fromStartEnd({
        root,
        start,
        end,
        reverse: true,
      });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 2);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], end);

      const walker2 = GenTreeWalker.fromStartEnd({
        root,
        start,
        end: n0,
        reverse: true,
      });
      const nodes2 = [...walker2.nodes()];
      assert.strictEqual(nodes2.length, 2);
      assert.strictEqual(nodes2[0], start);
      assert.strictEqual(nodes2[1], end);
    });
    test('complex dom - no filter - reverse', (assert) => {
      // language=XML
      const {
        root,
        elements: { n2, end },
        textNodes: { n1, start },
      } = vdom`
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

      const walker = GenTreeWalker.fromStartEnd({
        root,
        start,
        end,
        reverse: true,
      });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 4);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], end);
    });
  });
  module('Unit | model | utils | gen-tree-walker-test | start-end', () => {
    test('complex dom - no filter', (assert) => {
      // language=XML
      const {
        elements: { start, n3 },
        textNodes: { n1, n2, end },
      } = vdom`
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
      const walker = GenTreeWalker.fromRange({ range });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 5);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], n3);
      assert.strictEqual(nodes[4], end);
    });

    test('complex dom - no filter - range after element', (assert) => {
      // language=XML
      const {
        elements: { start, end },
        textNodes: { n1, n2, n3 },
      } = vdom`
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
      const walker = GenTreeWalker.fromRange({ range });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 5);
      assert.strictEqual(nodes[0], start);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], end);
      assert.strictEqual(nodes[4], n3);
    });
    test('complex dom - collapsed range in textNode', (assert) => {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
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

      const walker = GenTreeWalker.fromRange({ range });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 1);
      assert.strictEqual(nodes[0], textNode);
    });
    test('complex dom - collapsed range outside textNode', (assert) => {
      // language=XML
      const {
        textNodes: { textNode },
      } = vdom`
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

      const walker = GenTreeWalker.fromRange({ range });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 0);
    });
    test('complex dom - range containing no nodes', (assert) => {
      // language=XML
      const {
        elements: { start, end },
      } = vdom`
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

      const walker = GenTreeWalker.fromRange({ range });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 0);
    });
    test('complex dom - no filter - reverse', (assert) => {
      // language=XML
      const {
        elements: { rangeStart, n2 },
        textNodes: { n1, n3, rangeEnd },
      } = vdom`
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
      const walker = GenTreeWalker.fromRange({ range, reverse: true });
      const nodes = [...walker.nodes()];
      assert.strictEqual(nodes.length, 5);
      assert.strictEqual(nodes[0], rangeEnd);
      assert.strictEqual(nodes[1], n1);
      assert.strictEqual(nodes[2], n2);
      assert.strictEqual(nodes[3], rangeStart);
      assert.strictEqual(nodes[4], n3);
    });
  });
  module('Unit | model | utils | gen-tree-walker-test | node-handlers', () => {
    test('the right node handlers are called in the right order', (assert) => {
      // language=XML
      const {
        elements: { n0, n1, n2, n5, n7, n8 },
        textNodes: { n3, n4, n6 },
      } = vdom`
        <div __id="n0">
          <div __id="n1">
            <span __id="n2">
              <text __id="n3">test0</text>
            </span>
          </div>
          <text __id="n4">test1</text>
          <span __id="n5">
            <text __id="n6">test2</text>
          </span>
          <div __id="n7"/>
          <div __id="n8"/>
        </div>
      `;

      const entryHandler = sinon.spy();
      const exitHandler = sinon.spy();
      const walker = GenTreeWalker.fromSubTree({
        root: n0,
        onEnterNode: entryHandler,
        onLeaveNode: exitHandler,
      });
      const nodes = [...walker.nodes()];
      const entryCalls = entryHandler.getCalls();
      const exitCalls = exitHandler.getCalls();
      assert.strictEqual(entryCalls.length, nodes.length);
      assert.strictEqual(exitCalls.length, nodes.length);

      assert.true(entryCalls[0].calledWithExactly(n0));
      assert.true(entryCalls[1].calledWithExactly(n1));
      assert.true(entryCalls[2].calledWithExactly(n2));
      // enter test0 textnode
      assert.true(entryCalls[3].calledWithExactly(n3));
      // and leave it
      assert.true(exitCalls[0].calledWithExactly(n3));
      // going up
      assert.true(exitCalls[1].calledWithExactly(n2));
      assert.true(exitCalls[2].calledWithExactly(n1));
      //sideways, enter test1
      assert.true(entryCalls[4].calledWithExactly(n4));
      // and leave it
      assert.true(exitCalls[3].calledWithExactly(n4));
      //entering the n5 span
      assert.true(entryCalls[5].calledWithExactly(n5));
      // entering and leaving test2 node
      assert.true(entryCalls[6].calledWithExactly(n6));
      assert.true(exitCalls[4].calledWithExactly(n6));

      // leaving the n5 span
      assert.true(exitCalls[5].calledWithExactly(n5));

      // entering and leaving the n7 div
      assert.true(entryCalls[7].calledWithExactly(n7));
      assert.true(exitCalls[6].calledWithExactly(n7));

      // entering and leaving the n8 div
      assert.true(entryCalls[8].calledWithExactly(n8));
      assert.true(exitCalls[7].calledWithExactly(n8));

      // leaving root
      assert.true(exitCalls[8].calledWithExactly(n0));
    });
  });
});
