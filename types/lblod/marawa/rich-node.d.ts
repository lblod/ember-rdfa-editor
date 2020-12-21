declare module '@lblod/marawa/rich-node' {


  import RdfaBlock from "@lblod/marawa/rdfa-block";
  import RdfaAttributes from "@lblod/marawa/rdfa-attributes";
  type Region = [number, number];
  export interface RichNodeContent {
    start: number;
    end: number;
    isLogicalBlock: Boolean;
    domNode: Node;
    parent: RichNode;
    rdfaBlocks: Array<RdfaBlock>;
    rdfaContext: Array<RdfaAttributes>;
    rdfaPrefixes: Object;
    text: String;
    type: String;

  }
  export default class RichNode implements RichNodeContent {
    domNode: Node;
    end: number;
    isLogicalBlock: Boolean;
    parent: RichNode;
    rdfaBlocks: Array<RdfaBlock>;
    rdfaContext: Array<RdfaAttributes>;
    rdfaPrefixes: Object;
    start: number;
    text: String;
    type: String;

    constructor(content: RichNodeContent);
    get region(): Region;
    set region(region: Region);
    get length(): number;
    isInRegion(region: Region): boolean;
    isPartiallyInRegion(region: Region): boolean;
    isPartiallyOrFullyInRegion(region: Region): boolean;
    partiallyOrFullyContainsRegion(region: Region): boolean;
    containsRegion(region: Region): boolean;
    isAncestorOf(richNode: RichNode): boolean;
    isDescendentOf(richNode: RichNode): boolean;

  }

}
