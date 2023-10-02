import { v4 as uuidv4 } from 'uuid';

export const rdfaAttrs = {
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
  properties: { default: {} },
};
type PropertyMap = Record<string, { type: 'node' | 'attr'; value: string }>;

interface OutgoingProps {
  predicate: string;
  object: string;
  type: 'node' | 'attr';
}

export function getRdfaAttrs(
  node: Element,
): Record<string, string | PropertyMap> | false {
  const attrs: Record<string, string | PropertyMap> = {};

  const properties: PropertyMap = {};
  let hasAnyRdfaAttributes = false;
  for (const key of Object.keys(rdfaAttrs)) {
    const value = node.attributes.getNamedItem(key)?.value;
    if (value) {
      attrs[key] = value;
      hasAnyRdfaAttributes = true;

      if (key === 'data-outgoing-props') {
        const props = JSON.parse(value) as OutgoingProps[];
        for (const prop of props) {
          properties[prop.predicate] = { type: prop.type, value: prop.object };
        }
      }
      attrs['properties'] = properties;
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
