declare module '@lblod/marawa/rdfa-attributes' {
  export default class RdfaAttributes {
    constructor(domNode: Node, knownPrefixes?: Object, options? :Object);
    get vocab(): string;
    get content(): string;
    get property(): string;
    get isEmpty(): boolean;
  }
  export function parsePrefixString(prefixString: string): { [key: string]: string };
}
