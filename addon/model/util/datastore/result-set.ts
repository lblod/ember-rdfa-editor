import { from, IterableX, single } from 'ix/iterable';
import { map } from 'ix/iterable/operators';

export class ResultSet<I> implements Iterable<I> {
  private engine: IterableX<I>;

  constructor(iterable: Iterable<I>) {
    this.engine = from(iterable);
  }

  single(): I | undefined {
    return single(this.engine);
  }

  map<T>(mappingFunc: (item: I) => T): ResultSet<T> {
    return new ResultSet<T>(this.engine.pipe(map(mappingFunc)));
  }

  [Symbol.iterator](): Iterator<I> {
    return this.engine[Symbol.iterator]();
  }
}
