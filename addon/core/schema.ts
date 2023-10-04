import { v4 as uuidv4 } from 'uuid';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';

export const rdfaAttrs = {
  properties: { default: {} },
  backlinks: { default: {} },
  'data-incoming-props': { default: [] },
  'data-outgoing-props': { default: [] },
  vocab: { default: undefined },
  typeof: { default: undefined, editable: true },
  prefix: { default: undefined },
  property: { default: undefined },
  rel: { default: undefined },
  rev: { default: undefined },
  href: { default: undefined },
  about: { default: undefined },
  resource: { default: undefined },
  content: { default: undefined },
  datatype: { default: undefined },
  lang: { default: undefined },
  xmlns: { default: undefined },
  src: { default: undefined },
  id: { default: undefined },
  role: { default: undefined },
  inlist: { default: undefined },
  datetime: { default: undefined },
  __rdfaId: { default: undefined },
};
type OutgoingMap = Record<string, OutgoingProp>;
type IncomingMap = Record<string, IncomingProp>;

export function getRdfaAttrs(
  node: Element,
): Record<string, string | OutgoingMap | IncomingMap> | false {
  const attrs: Record<string, string | OutgoingMap | IncomingMap> = {};

  let hasAnyRdfaAttributes = false;
  for (const key of Object.keys(rdfaAttrs)) {
    const value = node.attributes.getNamedItem(key)?.value;
    if (value) {
      attrs[key] = value;
      hasAnyRdfaAttributes = true;

      if (key === 'data-outgoing-props') {
        const properties: OutgoingMap = {};
        const props = JSON.parse(value) as OutgoingProp[];
        for (const prop of props) {
          properties[prop.predicate] = prop;
        }
        attrs['properties'] = properties;
      }
      if (key === 'data-incoming-props') {
        const backlinks: IncomingMap = {};
        const props = JSON.parse(value) as IncomingProp[];
        for (const prop of props) {
          backlinks[prop.predicate] = prop;
        }
        attrs['backlinks'] = backlinks;
      }
    }
  }
  if (hasAnyRdfaAttributes) {
    if (!attrs['__rdfaId']) {
      attrs['__rdfaId'] = uuidv4();
    }
    return attrs;
  }
  return false;
}
