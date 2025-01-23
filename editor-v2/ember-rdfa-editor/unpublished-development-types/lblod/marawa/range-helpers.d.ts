declare module '@lblod/marawa/range-helpers' {
  type Range = [number, number];
  export function positionInRange(position: number, range: Range): boolean;
  export function rangeAStartsOrEndsinB(rangeA: Range, rangeB: Range): boolean;
  export function isLeftAdjacentRange(rangeA: Range, rangeB: Range): boolean;
  export function isRightAdjacentRange(rangeA: Range, rangeB: Range): boolean;
  export function isAdjacentRange(rangeA: Range, rangeB: Range): boolean;
  export function isEmptyRange(range: Range): boolean;
  export function isEqualRange(rangeA: Range, rangeB: Range): boolean;
}
