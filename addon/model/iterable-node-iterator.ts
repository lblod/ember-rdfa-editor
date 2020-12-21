export default class IterableNodeIterator<T extends Node = Node> implements Iterable<T> {


  constructor(private nodeIterator: NodeIterator) {
  }

  nextNode(): T {
    return this.nodeIterator.nextNode() as T;
  }

  previousNode(): T {
    return this.nodeIterator.previousNode() as T;
  }

  [Symbol.iterator](): Iterator<T> {
    return {
      next: () => {
        const nextNode = this.nodeIterator.nextNode();
        return nextNode ? {value: nextNode as T, done: false} : {value: nextNode, done: true};
      }};
  }
}
