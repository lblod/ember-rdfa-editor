import { module, test, todo } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { EditorStore } from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';

module('Unit | model | utils | datastore-test', function () {
  test('simple match gives correct nodes', function (assert) {
    //language=XML
    const {
      root,
      elements: { techNode },
    } = vdom`
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

    const datastore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://example.com/',
    });
    const matched = datastore.match(null, 'a', 'schema:TechArticle');
    assert.strictEqual(matched.size, 1);
    const matches = [...matched.asSubjectNodeMapping()];
    assert.strictEqual(matches.length, 1);
    const match = matched.asSubjectNodeMapping().single();
    if (!match) {
      throw new AssertionError();
    }

    assert.strictEqual(match.term.termType, 'BlankNode');
    assert.strictEqual(match.nodes.length, 1);
    assert.true(match.nodes.includes(techNode));

    const matchedUrl = datastore.match(null, 'schema:url');
    const matchesWithUrl = [...matchedUrl.asSubjectNodeMapping()];
    assert.strictEqual(matchesWithUrl.length, 2);
  });
  test('limitRange limits range', function (assert) {
    //language=XML
    const {
      root,
      elements: { techNode },
    } = vdom`
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

    const datastore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://example.com/',
    });

    const range = ModelRange.fromAroundNode(techNode);
    const matchedUrl = datastore
      .limitToRange(range, 'rangeContains')
      .match(null, 'schema:url');
    const nodesWithUrl = [...matchedUrl.asSubjectNodeMapping()];
    assert.strictEqual(nodesWithUrl.length, 1);

    assert.strictEqual(nodesWithUrl[0].term.termType, 'BlankNode');
    assert.strictEqual(nodesWithUrl[0].nodes.length, 1);
    assert.true(nodesWithUrl[0].nodes.includes(techNode));
  });
  test('filtering out subjects also filters out the relevant predicate nodes', function (assert) {
    //language=XML
    const { root } = vdom`
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
    const dataStore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://test.org',
      pathFromDomRoot: [],
    });
    const decisionUri =
      'http://data.lblod.info/artikels/bbeb89ae-998b-4339-8de4-c8ab3a0679b5';
    const decisionValueStore = dataStore.match(`>${decisionUri}`, 'prov:value');
    assert.strictEqual(decisionValueStore.size, 1);
  });

  test('nodes with same value for objects get filtered correctly', function (assert) {
    // language=XML
    const { root } = vdom`
      <div vocab="http://data.vlaanderen.be/ns/besluit#"
           prefix="eli: http://data.europa.eu/eli/ontology# prov: http://www.w3.org/ns/prov# mandaat: http://data.vlaanderen.be/ns/mandaat# besluit: http://data.vlaanderen.be/ns/besluit# xsd: http://www.w3.org/2001/XMLSchema#">
        <div typeof="Artikel"
             resource="http://data.lblod.info/artikels/1">
          <div property="prov:value">
            <text>test</text>
          </div>
        </div>
        <div typeof="Artikel"
             resource="http://data.lblod.info/artikels/2">
          <div property="prov:value">
            <text>test</text>
          </div>
        </div>
      </div>
    `;
    const dataStore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://test.org',
      pathFromDomRoot: [],
    });
    const articleUri = 'http://data.lblod.info/artikels/1';
    const objectResult = dataStore
      .match(`>${articleUri}`, 'prov:value')
      .asObjectNodeMapping()
      .single()?.nodes;
    assert.strictEqual(objectResult?.length, 1);
  });
  test('nodes with same value for objects but different predicates get filtered correctly', function (assert) {
    // language=XML
    const { root } = vdom`
      <div vocab="http://data.vlaanderen.be/ns/besluit#"
           prefix="eli: http://data.europa.eu/eli/ontology# prov: http://www.w3.org/ns/prov# mandaat: http://data.vlaanderen.be/ns/mandaat# besluit: http://data.vlaanderen.be/ns/besluit# xsd: http://www.w3.org/2001/XMLSchema#">
        <div typeof="Artikel"
             resource="http://data.lblod.info/artikels/1">
          <div property="prov:value">
            <text>test</text>
          </div>
          <div property="prov:otherValue">
            <text>test</text>
          </div>
        </div>
      </div>
    `;
    const dataStore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://test.org',
      pathFromDomRoot: [],
    });
    const articleUri = 'http://data.lblod.info/artikels/1';
    const objectResult = dataStore
      .match(`>${articleUri}`, 'prov:value')
      .asObjectNodeMapping()
      .single()?.nodes;
    assert.strictEqual(objectResult?.length, 1);
  });
  test('nodes are returned in document order', function (assert) {
    //language=XML
    const {
      root,
      elements: { node1, node2, node3, node4 },
    } = vdom`
      <div vocab="http://mu.semte.ch/vocabularies/ext/">
        <div resource="r1" typeof="test" __id="node1">
          <span property="testProp">
            <text>testValue1</text>
          </span>
          <span property="testProp2">
            <text>testValue2</text>
          </span>
        </div>
        <div resource="r1" typeof="test" __id="node2">
          <span property="testProp3">
            <text>testValue3</text>
            <div resource="r2" typeof="test" __id="node3">
              <span property="testProp">
                <text>testValue</text>
              </span>
            </div>
          </span>
        </div>
        <div resource="r2" typeof="test" __id="node4">
          <span property="testProp2">
            <text>testValue2</text>
          </span>
        </div>
      </div>
    `;
    const datastore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://test.org',
    });
    const result = datastore
      .match(null, 'a', 'ext:test')
      .asSubjectNodeMapping();
    const subjectNodes1 = result.get('>http://test.org/r1');
    if (!subjectNodes1) {
      throw new AssertionError();
    }

    assert.strictEqual(subjectNodes1.length, 2);
    assert.strictEqual(subjectNodes1[0], node1);
    assert.strictEqual(subjectNodes1[1], node2);
    const subjectNodes2 = result.get('>http://test.org/r2');
    if (!subjectNodes2) {
      throw new AssertionError();
    }

    assert.strictEqual(subjectNodes2.length, 2);
    assert.strictEqual(subjectNodes2[0], node3);
    assert.strictEqual(subjectNodes2[1], node4);
  });
  // TODO limitToRange currently only works on subjectnodes, tbd how to handle this
  todo('limitToRange works as expected', function (assert) {
    //language=XML
    const {
      root,
      elements: { selected },
    } = vdom`
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
    const datastore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://test.org',
    });
    const range = ModelRange.fromAroundNode(selected);
    const limitedStore = datastore.limitToRange(range, 'rangeContains');
    assert.strictEqual(limitedStore.size, 1);
  });
});
module('Unit | model | utils | legacy-datastore-test', function () {
  test('simple match gives correct nodes', function (assert) {
    //language=XML
    const {
      root,
      elements: { techNode, other },
    } = vdom`
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

    const datastore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://example.com/',
    });
    const matched = datastore.match(null, 'a', 'schema:TechArticle');
    assert.strictEqual(matched.size, 1);
    const nodes = [...matched.asSubjectNodes()];
    assert.strictEqual(nodes.length, 1);

    assert.strictEqual(nodes[0].subject.termType, 'BlankNode');
    assert.strictEqual(nodes[0].nodes.size, 1);
    assert.true(nodes[0].nodes.has(techNode));

    const matchedUrl = datastore.match(null, 'schema:url');
    const nodesWithUrl = [...matchedUrl.asSubjectNodes()];
    assert.strictEqual(nodesWithUrl.length, 2);

    assert.strictEqual(nodesWithUrl[0].subject.termType, 'BlankNode');
    assert.strictEqual(nodesWithUrl[0].nodes.size, 1);
    assert.true(nodesWithUrl[0].nodes.has(techNode));
    assert.true(nodesWithUrl[1].nodes.has(other));
  });
  test('limitRange limits range', function (assert) {
    //language=XML
    const {
      root,
      elements: { techNode },
    } = vdom`
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

    const datastore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://example.com/',
    });

    const range = ModelRange.fromAroundNode(techNode);
    const matchedUrl = datastore
      .limitToRange(range, 'rangeContains')
      .match(null, 'schema:url');
    const nodesWithUrl = [...matchedUrl.asSubjectNodes()];
    assert.strictEqual(nodesWithUrl.length, 1);

    assert.strictEqual(nodesWithUrl[0].subject.termType, 'BlankNode');
    assert.strictEqual(nodesWithUrl[0].nodes.size, 1);
    assert.true(nodesWithUrl[0].nodes.has(techNode));
  });
  test('filtering out subjects also filters out the relevant predicate nodes', function (assert) {
    //language=XML
    const { root } = vdom`
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
    const dataStore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://test.org',
      pathFromDomRoot: [],
    });
    const decisionUri =
      'http://data.lblod.info/artikels/bbeb89ae-998b-4339-8de4-c8ab3a0679b5';
    const decisionValueStore = dataStore.match(`>${decisionUri}`, 'prov:value');
    assert.strictEqual(decisionValueStore.size, 1);
  });

  test('limitToRange works as expected', function (assert) {
    //language=XML
    const {
      root,
      elements: { selected },
      textNodes: { insideProv },
    } = vdom`
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
                  <text __id="insideProv">Voer inhoud in</text>
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
    const datastore = EditorStore.fromParse({
      modelRoot: root,
      baseIRI: 'http://test.org',
    });
    const range = ModelRange.fromAroundNode(selected);
    const limitedStore = datastore.limitToRange(range, 'rangeContains');
    assert.strictEqual(limitedStore.size, 0);

    const rangeInside = ModelRange.fromInNode(insideProv, 2, 2);
    const insideStore = datastore
      .limitToRange(rangeInside, 'rangeIsInside')
      .match(null, 'prov:value');
    assert.strictEqual(insideStore.size, 2);
  });
});
