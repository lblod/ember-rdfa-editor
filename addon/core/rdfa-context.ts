import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";

export interface RdfaContext {
  vocab: string;

  content: string;

  properties: string[];

  rel: string[];

  types: string[];

  rev: string[];

  about: string;

  datatype: string;

  src: string;

  href: string;

  resource: string;

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
    const keys: Array<keyof RdfaContext> = Object.keys(context) as Array<keyof RdfaContext>;
    keys.sort();
    let result = '{';
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (context[key]) {
        result += `"${key}":${JSON.stringify(context[key])},`;
      }
    }
    // no trailing commas allowed in json
    const key = keys[keys.length - 1];
    if (context[key]) {
      result += `"${key}":${JSON.stringify(context[key])}`;
    }
    result = result += '}';
    console.log(result);
    return result;
  }

  static deserialize(content: string): RdfaContext {
    return JSON.parse(content) as RdfaContext;
  }


}
