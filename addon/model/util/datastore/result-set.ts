import { from, IterableX } from 'ix/iterable';
import { map, take } from 'ix/iterable/operators';

export class ResultSet<I> implements Iterable<I> {
  private engine: IterableX<I>;

  constructor(iterable: Iterable<I>) {
    this.engine = from(iterable);
  }

  first(): I | undefined {
    return [...this.engine.pipe(take(1))][0];
  }

  map<T>(mappingFunc: (item: I) => T): ResultSet<T> {
    return new ResultSet<T>(this.engine.pipe(map(mappingFunc)));
  }

  [Symbol.iterator](): Iterator<I> {
    return this.engine[Symbol.iterator]();
  }
}
