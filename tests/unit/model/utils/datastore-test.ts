import {module, test, todo} from "qunit";
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
  test("filtering out subjects also filters out the relevant predicate nodes", assert => {
    //language=XML
    const {root} = vdom`
      <div vocab="http://data.vlaanderen.be/ns/besluit#"
           prefix="eli: http://data.europa.eu/eli/ontology# prov: http://www.w3.org/ns/prov# mandaat: http://data.vlaanderen.be/ns/mandaat# besluit: http://data.vlaanderen.be/ns/besluit# xsd: http://www.w3.org/2001/XMLSchema#"
           class="app-view">
        <div typeof="Besluit">
          <div property="prov:value"
               datatype="xsd:string">
            <div property="eli:has_part"
                 resource="http://data.lblod.info/artikels/bbeb89ae-998b-4339-8de4-c8ab3a0679b5"
                 typeof="besluit:Artikel">
              <div property="eli:number" datatype="xsd:string">
                <text>Artikel 1</text>
              </div>
              <span style="display:none;" property="eli:language"
                    resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept"/>
              <div property="prov:value" datatype="xsd:string">
                <span class="mark-highlight-manual">
                  <text>Voer inhoud in</text>
                </span>
              </div>
            </div>
            <br/>
            <div class="mark-highlight-manual">
              <span data-editor-highlight="true">
                <text>Voeg nieuw artikel in</text>
              </span>
            </div>
            <br/>
          </div>
        </div>
      </div>
    `;
    const dataStore = EditorStore.fromParse({modelRoot: root, baseIRI: "http://test.org", pathFromDomRoot: []});
    const decisionUri = "http://data.lblod.info/artikels/bbeb89ae-998b-4339-8de4-c8ab3a0679b5";
    const decisionValueStore = dataStore.match(`>${decisionUri}`, 'prov:value');
    assert.strictEqual(decisionValueStore.size, 1);
  });
  // TODO limitToRange currently only works on subjectnodes, tbd how to handle this
  todo("limitToRange works as expected", assert => {
    //language=XML
    const {root, elements: {selected}} = vdom`
      <div vocab="http://data.vlaanderen.be/ns/besluit#"
           prefix="eli: http://data.europa.eu/eli/ontology# prov: http://www.w3.org/ns/prov# mandaat: http://data.vlaanderen.be/ns/mandaat# besluit: http://data.vlaanderen.be/ns/besluit# xsd: http://www.w3.org/2001/XMLSchema#"
           class="app-view">
        <div typeof="Besluit">
          <div property="prov:value"
               datatype="xsd:string">
            <div property="eli:has_part"
                 resource="http://data.lblod.info/artikels/bbeb89ae-998b-4339-8de4-c8ab3a0679b5"
                 typeof="besluit:Artikel">
              <div property="eli:number" datatype="xsd:string">
                <text>Artikel 1</text>
              </div>
              <span style="display:none;" property="eli:language"
                    resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept"/>
              <div property="prov:value" datatype="xsd:string" __id="selected">
                <span class="mark-highlight-manual">
                  <text>Voer inhoud in</text>
                </span>
              </div>
            </div>
            <br/>
            <div class="mark-highlight-manual">
              <span data-editor-highlight="true">
                <text>Voeg nieuw artikel in</text>
              </span>
            </div>
            <br/>
          </div>
        </div>
      </div>
    `;
    const datastore = EditorStore.fromParse({modelRoot: root, baseIRI: "http://test.org"});
    const range = ModelRange.fromAroundNode(selected);
    const limitedStore = datastore.limitToRange(range, "rangeContains");
    assert.strictEqual(limitedStore.size, 1);


  });
});
