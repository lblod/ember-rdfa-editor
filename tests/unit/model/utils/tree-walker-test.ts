import {module, test} from "qunit";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/util/model-tree-walker"
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils"

module("Unit | model | utils | tree-walker-test", () => {
  test("finds root when its the only node and position starts there", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});

    const range = ModelRange.fromPaths(root, [], []);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], root);
  });
  test("finds the single node when from and to are the same position", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});
    const childNode = new ModelElement("div", {debugInfo: "child"});
    root.addChild(childNode);

    const range = ModelRange.fromPaths(root, [0], [0]);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], childNode);
  });

  test("finds all nodes when starting from root", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});
    const childNode = new ModelElement("div", {debugInfo: "child"});
    root.addChild(childNode);

    const range = ModelRange.fromPaths(root, [], []);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], root);
    assert.strictEqual(result[1], childNode);
  });
  test("finds all nodes when starting from root complex", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});
    const c0 = new ModelElement("span", {debugInfo: "c0"});
    const c1 = new ModelElement("span", {debugInfo: "c1"});

    const c01 = new ModelElement("span", {debugInfo: "c01"});
    const c11 = new ModelElement("span", {debugInfo: "c11"});
    root.appendChildren(c0, c1);
    c0.addChild(c01);
    c1.addChild(c11);

    const range = ModelRange.fromPaths(root, [], []);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 5);
    assert.strictEqual(result[0], root);
    assert.strictEqual(result[1], c0);
    assert.strictEqual(result[2], c01);
    assert.strictEqual(result[3], c1);
    assert.strictEqual(result[4], c11);
  });
  test("stops at end node", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});
    const c0 = new ModelElement("span", {debugInfo: "c0"});
    const c1 = new ModelElement("span", {debugInfo: "c1"});

    const c01 = new ModelElement("span", {debugInfo: "c01"});
    const c11 = new ModelElement("span", {debugInfo: "c11"});
    root.appendChildren(c0, c1);
    c0.addChild(c01);
    c1.addChild(c11);


    const range = ModelRange.fromPaths(root, [0], [1]);
    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], c0);
    assert.strictEqual(result[1], c01);
  });
  test("stops at end node 2", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});
    const c0 = new ModelElement("span", {debugInfo: "c0"});
    const c1 = new ModelElement("span", {debugInfo: "c1"});

    const c01 = new ModelElement("span", {debugInfo: "c01"});
    const c11 = new ModelElement("span", {debugInfo: "c11"});
    root.appendChildren(c0, c1);
    c0.addChild(c01);
    c1.addChild(c11);

    const range = ModelRange.fromPaths(root, [0, 0], [1]);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], c01);
  });

  test("stops at end node 3", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});
    const c0 = new ModelElement("span", {debugInfo: "c0"});
    const c1 = new ModelElement("span", {debugInfo: "c1"});

    const c01 = new ModelElement("span", {debugInfo: "c01"});
    const c11 = new ModelElement("span", {debugInfo: "c11"});
    root.appendChildren(c0, c1);
    c0.addChild(c01);
    c1.addChild(c11);

    const range = ModelRange.fromPaths(root, [0, 0], [1, 0]);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], c01);
    assert.strictEqual(result[1], c1);
  });

  test("stops at end node 4", assert => {
    const root = new ModelElement("div", {debugInfo: "root"});
    const c0 = new ModelElement("span", {debugInfo: "c0"});
    const c1 = new ModelElement("span", {debugInfo: "c1"});

    const c01 = new ModelElement("span", {debugInfo: "c01"});
    const c11 = new ModelElement("span", {debugInfo: "c11"});
    root.appendChildren(c0, c1);
    c0.addChild(c01);
    c1.addChild(c11);

    const from = ModelPosition.fromPath(root, [0, 0]);
    const to = ModelPosition.fromPath(root, [1, 1]);
    const range = new ModelRange(from, to);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0], c01);
    assert.strictEqual(result[1], c1);
    assert.strictEqual(result[2], c11);
  });

  test("stops at end node 5", assert => {
    const root = new ModelElement("p", {debugInfo: "root"});

    const t1 = new ModelText(`a paragraph with Lorem ipsum Itaque consequatur
    maxime repudiandae eos est. Et et officia est dolore eum ipsam laborum recusandae.
    Ab excepturi cum mollitia ut.…`);
    const br1 = new ModelElement("br");
    const t2 = new ModelText(` and a break (or two ?)`);
    const br2 = new ModelElement("br");


    root.appendChildren(t1, br1, t2, br2);

    const range = ModelRange.fromPaths(root, [0, 5], [0, 10]);

    const walker = new ModelTreeWalker({range});
    const result = [...walker];

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], t1);
  });

  //p
  //  span
  //     span
  //       span
  //          #t[]ext
  //br
  //p
  //   #text
  //   br
  //   span
  //      span
  //        span
  //           #te[]xt
  //span
  test("stops at end node with br elements", assert => {


    // language=XML
    const {textNodes: {startRange, endRange}, elements: {insideConfinedRange1}} = vdom`
      <div>
        <p>
          <span>
            <span>
              <span>
                <!--                 r0 -->
                <text __id="startRange">test</text>
                <!--                end r0 -->
              </span>
            </span>
          </span>

        </p>
        <!--                 r1 -->
        <br __id="insideConfinedRange1"/>
        <!--                end r1 -->
        <p>
          <!--        r2-->
          <text>test</text>
          <br/>
          <!--        end r2-->
          <span>
            <span>
              <span>
                <!--        r3-->
                <text __id="endRange">test</text>
                <!--        end r3-->
              </span>
            </span>
          </span>

        </p>
        <span/>
      </div>
    `;


    const range = new ModelRange(ModelPosition.fromInTextNode(startRange, 1), ModelPosition.fromInTextNode(endRange, 3));
    const ranges = range.getMinimumConfinedRanges();

    const walker0 = new ModelTreeWalker({range: ranges[0], descend: false});
    const result0 = [...walker0];

    assert.strictEqual(result0.length, 1);
    assert.strictEqual(result0[0], startRange);


    const walker1 = new ModelTreeWalker({range: ranges[1], descend: false});
    const result1 = [...walker1];

    assert.strictEqual(result1.length, 1);
    assert.strictEqual(result1[0], insideConfinedRange1);

    const walker2 = new ModelTreeWalker({range: ranges[3], descend: false});
    const result2 = [...walker2];

    assert.strictEqual(result2.length, 1);
    assert.strictEqual(result2[result2.length - 1], endRange);
  });
  test("Does not visit children when descend false", assert => {


    const root = new ModelElement("div", {debugInfo: "root"});

    const s0 = new ModelElement("span");
    const s00 = new ModelElement("span");
    const s01 = new ModelElement("span");
    const s02 = new ModelElement("span");

    const s1 = new ModelElement("span");

    const s2 = new ModelElement("span");
    const s20 = new ModelElement("span");
    const s21 = new ModelElement("span");

    const s3 = new ModelElement("span");


    root.appendChildren(s0, s1, s2, s3);
    s0.appendChildren(s00, s01, s02);
    s2.appendChildren(s20, s21);

    const range = ModelRange.fromPaths(root, [0], [4]);

    const walker = new ModelTreeWalker({range, descend: false});
    const result = [...walker];

    assert.strictEqual(result.length, 4);
    assert.strictEqual(result[0], s0);
    assert.strictEqual(result[1], s1);
    assert.strictEqual(result[2], s2);
    assert.strictEqual(result[3], s3);
  });

  test("only finds one textNode", assert => {
    // language=XML
    const {root, textNodes: {node0}} = vdom`
      <modelRoot>
        <text __id="node0">ab</text>
        <text>c</text>
      </modelRoot>
    `;
    const range = ModelRange.fromPaths(root as ModelElement, [0], [2]);
    const walker = new ModelTreeWalker({range});
    const result = [...walker];

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], node0);

  });
  test("walks tree in document order", assert => {
    // language=XML
    const {textNodes: {n0, n1, n5, n6}, elements: {e2, e3, e4}} = vdom`
      <div>
        <div>
          <span>
            <text __id="n0">start</text>
          </span>
          <text __id="n1">test</text>
          <span __id="e2">
            <ul __id="e3">
              <li __id="e4">
                <text __id="n5">test</text>
              </li>
            </ul>
          </span>
        </div>
        <text __id="n6">end</text>
        <text>won't visit here</text>
      </div>
    `;

    const start = ModelPosition.fromInTextNode(n0, 2);
    const end = ModelPosition.fromInTextNode(n6, 1);
    const range = new ModelRange(start, end);
    const walker = new ModelTreeWalker({range});
    const result = [...walker];

    assert.strictEqual(result.length, 7);
    assert.strictEqual(result[0], n0);
    assert.strictEqual(result[1], n1);
    assert.strictEqual(result[2], e2);
    assert.strictEqual(result[3], e3);
    assert.strictEqual(result[4], e4);
    assert.strictEqual(result[5], n5);
    assert.strictEqual(result[6], n6);

  });
  test("stops at end", assert => {
    // language=XML
    const {root: initial, elements: {n0, n1, n2, n3}, textNodes: {n4}} = vdom`
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
    const range = ModelRange.fromPaths(initial as ModelElement, [1], [2]);
    const walker = new ModelTreeWalker({range});
    const result = [...walker];
    assert.strictEqual(result.length, 5);
    assert.strictEqual(result[0], n0);
    assert.strictEqual(result[1], n1);
    assert.strictEqual(result[2], n2);
    assert.strictEqual(result[3], n3);
    assert.strictEqual(result[4], n4);


  });


});
