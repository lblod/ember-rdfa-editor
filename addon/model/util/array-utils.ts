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

}
