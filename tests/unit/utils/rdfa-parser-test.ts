import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { RdfaParser } from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { conciseToRdfjs } from '@lblod/ember-rdfa-editor/model/util/concise-term-string';

module('Unit | utils | rdfa-parser-test', () => {
  test('parses simple dom correctly', (assert) => {
    // language=XML
    const { root } = vdom`
      <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person"> <!-- about:alice -->
        <p>
          <span property="name">
            <text>Alice Birpemswick</text>
          </span>
          <text>Email:</text>
          <a property="mbox" href="mailto:alice@example.com">
            <text>alice@example.com</text>
          </a>
          <text>Phone:</text>
          <a property="phone" href="tel:+1-617-555-7332">
            <text>+1 617.555.7332</text>
          </a>
        </p>
      </div>`;

    const { dataset, nodeToSubjectMapping, subjectToNodesMapping } =
      RdfaParser.parse({
        modelRoot: root,
        baseIRI: 'http://example.com',
      });
    assert.strictEqual(dataset.size, 5);
    assert.strictEqual(subjectToNodesMapping.size, 1);
    assert.strictEqual(nodeToSubjectMapping.size, 1);
  });
  test('correct predicate node mapping', (assert) => {
    // language=XML
    const {
      root,
      elements: { mboxPred, mboxPred2, namePred, personNode },
    } = vdom`
      <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person" __id="personNode"> <!-- about:alice -->
        <p>
          <span property="name" __id="namePred">
            <text>Alice Birpemswick</text>
          </span>
          <text>Email:</text>
          <a property="mbox" href="mailto:alice@example.com" __id="mboxPred">
            <text>alice@example.com</text>
          </a>
          <a property="mbox" href="mailto2:alice@example.com" __id="mboxPred2">
            <text>alice@example.com</text>
          </a>
          <text>Phone:</text>
          <a property="phone" href="tel:+1-617-555-7332" __id="phonePred">
            <text>+1 617.555.7332</text>
          </a>
        </p>
      </div>`;

    const { dataset, predicateToNodesMapping, nodeToPredicatesMapping } =
      RdfaParser.parse({
        modelRoot: root,
        baseIRI: 'http://example.com',
      });

    assert.strictEqual(dataset.size, 6);
    // the vocab property also generates a predicate
    assert.strictEqual(predicateToNodesMapping.size, 5);

    // check name
    const nameMapping = predicateToNodesMapping.get(
      'http://xmlns.com/foaf/0.1/name'
    );
    if (!nameMapping) {
      throw new AssertionError();
    }
    assert.strictEqual(nameMapping.size, 1);
    assert.true(nameMapping.has(namePred));
    const expected = conciseToRdfjs('>http://xmlns.com/foaf/0.1/name');
    const namePredicates = nodeToPredicatesMapping.get(namePred);
    assert.ok(namePredicates);
    assert.strictEqual(namePredicates!.size, 1);
    assert.true(expected.equals([...namePredicates!][0]));

    // check mbox
    const mboxMapping = predicateToNodesMapping.get(
      'http://xmlns.com/foaf/0.1/mbox'
    );
    if (!mboxMapping) {
      throw new AssertionError();
    }
    assert.strictEqual(mboxMapping.size, 2);
    assert.true(mboxMapping.has(mboxPred));
    assert.true(mboxMapping.has(mboxPred2));
    const mboxExpected = conciseToRdfjs('>http://xmlns.com/foaf/0.1/mbox');
    const mboxPredicates = nodeToPredicatesMapping.get(mboxPred);
    assert.ok(mboxPredicates);
    assert.strictEqual(mboxPredicates!.size, 1);
    assert.true(mboxExpected.equals([...mboxPredicates!][0]));

    // check person node
    const personPredicates = nodeToPredicatesMapping.get(personNode);
    assert.ok(personPredicates);
    assert.strictEqual(personPredicates!.size, 2);
  });
});
