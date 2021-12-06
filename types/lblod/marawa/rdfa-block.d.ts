declare module '@lblod/marawa/rdfa-block' {
  import RichNode from '@lblod/marawa/rich-node';
  type Region = [number, number];
  export default class RdfaBlock {
    constructor(content: unknown);

    get region(): Region;
    set region(region: Region);

    get length(): number;
    get richNode(): RichNode;

    isInRegion(region: Region): boolean;
    isPartiallyInRegion(region: Region): boolean;
    isPartiallyOrFullyInRegion(region: Region): boolean;
    containsRegion(region: Region): boolean;
    normalizeRegion(region: Region): Region;
  }
}
