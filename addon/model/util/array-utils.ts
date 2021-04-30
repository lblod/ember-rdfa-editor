export default class ArrayUtils {
  static findCommonSlice<T>(array1: T[], array2: T[]): T[] {
    let i = 0;
    const shortest = Math.min(array1.length, array2.length);
    while(i < shortest && array1[i] === array2[i]) {
      i++;
    }
    return array1.slice(0, i);
  }

  static pushOrCreate<T>(array: T[][], position: number, item: T) {
    if(array[position]) {
      array[position].push(item);
    } else {
      array.push([item]);
    }

  }

  /**
   * indexOf for iterable things that don't have it for some reason
   * (looking at you element.childNodes...)
   * @param item
   * @param iter
   */
  static indexOf<I, T extends Iterable<I>>(item: I, iter: T): number | null {
    let counter = 0;
    for(const it of iter) {
      if(item === it) {
        return counter;
      }
      counter++;
    }
    return null;

  }

}

export function pushOrExpand<T>(parent: T[], child: T | T[]): void {
    if (child instanceof Array) {
        parent.push(...child);
    } else {
        parent.push(child);
    }
}
