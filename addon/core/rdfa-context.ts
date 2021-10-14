import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";

export interface RdfaContext {
  vocab?: string;

  content?: string;

  properties?: string[];

  rel?: string[];

  types?: string[];

  rev?: string[];

  about?: string;

  datatype?: string;

  src?: string;

  href?: string;

  resource?: string;

}

export class RdfaContextFactory {
  static fromElement(element: ModelElement): RdfaContext {
    const {
      about,
      vocab,
      content,
      properties,
      rel,
      typeof: types,
      rev,
      datatype,
      src,
      href,
      resource
    } = element.getRdfaAttributes();
    return {vocab, content, properties, rel, types, rev, about, datatype, src, href, resource};

  }

  /**
   * Provide a consistent serialization for an {@link RdfaContext}. This means two contexts with the same
   * values for their properties should both serialize to an identical string.
   * @param context
   */
  static serialize(context: RdfaContext): string {
    const entries = (Object.entries(context) as [string, unknown][]).filter(([_, value]) => !!value);
    entries.sort((a, b) => a[0] >= b[0] ? 1 : -1);
    let result = '{';

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      result += `"${key}":${JSON.stringify(value)}`;
      if (i !== entries.length - 1) {
        result += ',';
      }
    }
    result = result += '}';
    return result;
  }

  static deserialize(content: string): RdfaContext {
    return JSON.parse(content) as RdfaContext;
  }


}
