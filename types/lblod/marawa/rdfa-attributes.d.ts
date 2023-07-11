declare module '@lblod/marawa/rdfa-attributes' {
  export default class RdfaAttributes {
    constructor(
      node: { getAttribute(key: string): string | undefined },
      knownPrefixes?: unknown,
      options?: Record<string, unknown>,
    );
    get vocab(): string;
    get content(): string;
    get properties(): string[];
    get rel(): string[];
    get typeof(): string[];
    get rev(): string[];
    get about(): string;
    get datatype(): string;
    get src(): string;
    get href(): string;
    get resource(): string;
    get isEmpty(): boolean;
    currentPrefixes: Record<string, unknown>;
  }
  export function parsePrefixString(prefixString: string): {
    [key: string]: string;
  };
}
