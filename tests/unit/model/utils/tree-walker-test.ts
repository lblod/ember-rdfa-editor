import {module, test} from "qunit";
import {ModelTreeWalker} from "@lblod/ember-rdfa-editor/model/util/tree-walker";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

module("Unit | model | utils | tree-walker-test", hooks => {
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

    const from = ModelPosition.from(root, [0, 0]);
    const to = ModelPosition.from(root, [1, 1]);
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




    root.appendChildren(s0, s1,s2, s3);
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

});
