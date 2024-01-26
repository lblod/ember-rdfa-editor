import { first, isEmpty, type Iterable, map } from 'iter-tools';
import { single } from '../iterator-utils';

export class ResultSet<I> implements Iterable<I> {
  private engine: Iterable<I>;

  constructor(iterable: Iterable<I>) {
    this.engine = iterable;
  }

  first(): I | undefined {
    return first(this.engine);
  }

  single(): I | undefined {
    return single(this.engine);
  }

  map<T>(mappingFunc: (item: I) => T): ResultSet<T> {
    return new ResultSet<T>(map(mappingFunc, this.engine));
  }

  isEmpty(): boolean {
    return isEmpty(this.engine);
  }

  [Symbol.iterator](): Iterator<I> {
    return this.engine[Symbol.iterator]();
  }
}
