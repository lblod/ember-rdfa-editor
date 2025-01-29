import { module, test } from 'qunit';
import { DataFactory } from 'rdf-data-factory';
import {
  conciseToRdfjs,
  xsd,
} from '@lblod/ember-rdfa-editor/utils/_private/concise-term-string';
import sinon from 'sinon';
import { RDF_TYPE } from '@lblod/ember-rdfa-editor/utils/_private/constants';
import { ParseError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

module('Unit | model | utils | concise-term-string-test', function () {
  test('absoluteIri', function (assert) {
    const factory = new DataFactory();
    const expected = factory.namedNode('http://example.com');
    const actual = conciseToRdfjs('>http://example.com');
    assert.true(expected.equals(actual));
  });
  test('prefixedIRI', function (assert) {
    const factory = new DataFactory();
    const expected = factory.namedNode('http://example.com/thing');
    const prefixMapping = sinon.fake.returns('http://example.com/');
    const actual = conciseToRdfjs('example:thing', prefixMapping);
    assert.true(prefixMapping.calledOnce);
    assert.true(expected.equals(actual));
  });
  test('typealias', function (assert) {
    const factory = new DataFactory();
    const expected = factory.namedNode(RDF_TYPE);
    const actual = conciseToRdfjs('a');
    assert.true(expected.equals(actual));
  });

  test('blankNode', function (assert) {
    const factory = new DataFactory();
    const expected = factory.blankNode('test');
    const actual = conciseToRdfjs('_:test');
    assert.true(expected.equals(actual));
  });
  test('plainLiteral', function (assert) {
    const factory = new DataFactory();
    const expected = factory.literal('literal');
    const actual = conciseToRdfjs('literal');
    assert.true(expected.equals(actual));
  });
  test('dataTypedLiteral - absolute', function (assert) {
    const factory = new DataFactory();
    const dataType = factory.namedNode('http://test.com/customType');
    const expected = factory.literal('literal', dataType);
    const actual = conciseToRdfjs('^>http://test.com/customType"literal');
    assert.true(expected.equals(actual));
  });
  test('dataTypedLiteral - prefixed', function (assert) {
    const factory = new DataFactory();
    const prefixMapping = sinon.fake.returns('http://example.com/');
    const dataType = factory.namedNode('http://example.com/customType');
    const expected = factory.literal('literal', dataType);
    const actual = conciseToRdfjs('^test:customType"literal', prefixMapping);
    assert.true(prefixMapping.calledOnce);
    assert.true(expected.equals(actual));
  });
  test('languagedLiteral', function (assert) {
    const factory = new DataFactory();
    const expected = factory.literal('literal', 'nl');
    const actual = conciseToRdfjs('@nl"literal');
    assert.true(expected.equals(actual));
  });
  test('primitive typed literal - number', function (assert) {
    const factory = new DataFactory();
    const dataType = factory.namedNode(xsd('double'));
    const expected = factory.literal('5', dataType);
    const actual = conciseToRdfjs(5);
    assert.true(expected.equals(actual));
  });
  test('primitive typed literal - boolean', function (assert) {
    const factory = new DataFactory();
    const dataType = factory.namedNode(xsd('boolean'));
    const expected = factory.literal('false', dataType);
    const actual = conciseToRdfjs(false);
    assert.true(expected.equals(actual));
  });
  test("only cuts the first ':' in prefixes", function (assert) {
    const factory = new DataFactory();
    const prefixMapping = sinon.fake.returns('http://example.com/');
    const expected = factory.namedNode('http://example.com/test:weird:prefix');
    const actual = conciseToRdfjs('example:test:weird:prefix', prefixMapping);
    assert.true(expected.equals(actual));
  });
  test('empty string', function (assert) {
    const factory = new DataFactory();
    const expected = factory.literal('');
    const actual = conciseToRdfjs('');
    assert.true(expected.equals(actual));
  });
  test('unrecognized prefix', function (assert) {
    const prefixMapping = sinon.fake.returns(null);
    assert.throws(() => {
      conciseToRdfjs('example:test', prefixMapping);
    }, ParseError);
  });
  test('explicit literal string', function (assert) {
    const factory = new DataFactory();
    const expected = factory.literal('this_string:is_literal');
    const actual = conciseToRdfjs('"this_string:is_literal');
    assert.true(expected.equals(actual));
  });
});
