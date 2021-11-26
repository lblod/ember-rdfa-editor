import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import {EditorStore} from "@lblod/ember-rdfa-editor/model/util/datastore";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | model | utils | datastore-test", () => {
  test("simple match gives correct nodes", assert => {
    //language=XML
    const {root, elements: {techNode, other}} = vdom`
      <div>
        <span vocab="http://schema.org/" typeof="TechArticle" __id="techNode">
          <a property="url" href="http://www.w3.org/TR/rdfa-primer/">
            <span property="name">
              <text>RDFa 1.1 Primer</text>
            </span>
          </a>
        </span>
        <span vocab="http://schema.org/" typeof="Other" __id="other">
          <a property="url" href="http://www.w3.org/TR/rdfa-primer/">
            <span property="name">
              <text>RDFa 1.1 Primer</text>
            </span>
          </a>
        </span>
      </div>
    `;

    const datastore = EditorStore.fromParse({modelRoot: root, baseIRI: "http://example.com/"});
    const matched = datastore.match(null, "a", "schema:TechArticle");
    assert.strictEqual(matched.size, 1);
    const nodes = [...matched.asSubjectNodes()];
    assert.strictEqual(nodes.length, 1);

    assert.strictEqual(nodes[0].subject.termType, "BlankNode");
    assert.strictEqual(nodes[0].nodes.size, 1);
    assert.true(nodes[0].nodes.has(techNode));

    const matchedUrl = datastore.match(null, "schema:url");
    const nodesWithUrl = [...matchedUrl.asSubjectNodes()];
    assert.strictEqual(nodesWithUrl.length, 2);

    assert.strictEqual(nodesWithUrl[0].subject.termType, "BlankNode");
    assert.strictEqual(nodesWithUrl[0].nodes.size, 1);
    assert.true(nodesWithUrl[0].nodes.has(techNode));
    assert.true(nodesWithUrl[1].nodes.has(other));
  });
  test("limitRange limits range", assert => {
    //language=XML
    const {root, elements: {techNode}} = vdom`
      <div>
        <span vocab="http://schema.org/" typeof="TechArticle" __id="techNode">
          <a property="url" href="http://www.w3.org/TR/rdfa-primer/">
            <span property="name">
              <text>RDFa 1.1 Primer</text>
            </span>
          </a>
        </span>
        <span vocab="http://schema.org/" typeof="Other" __id="other">
          <a property="url" href="http://www.w3.org/TR/rdfa-primer/">
            <span property="name">
              <text>RDFa 1.1 Primer</text>
            </span>
          </a>
        </span>
      </div>
    `;

    const datastore = EditorStore.fromParse({modelRoot: root, baseIRI: "http://example.com/"});

    const range = ModelRange.fromAroundNode(techNode);
    const matchedUrl = datastore.limitToRange(range, "rangeContains").match(null, "schema:url");
    const nodesWithUrl = [...matchedUrl.asSubjectNodes()];
    assert.strictEqual(nodesWithUrl.length, 1);

    assert.strictEqual(nodesWithUrl[0].subject.termType, "BlankNode");
    assert.strictEqual(nodesWithUrl[0].nodes.size, 1);
    assert.true(nodesWithUrl[0].nodes.has(techNode));
  });
});
