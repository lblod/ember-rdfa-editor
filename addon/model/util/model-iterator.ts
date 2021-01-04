import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export default class ModelIterator<T extends ModelNode = ModelNode> implements Iterable<T> {

  private current: ModelNode | null;
  private stack: ModelNode[];
  private done: boolean = false;
  private filter: (node: ModelNode) => boolean = () => true

  constructor(private from: ModelNode, private to: ModelNode, filter?: (node: ModelNode) => boolean) {
    this.current = null;
    this.stack = [from];
    if(filter) {
      this.filter = filter;
    }
    this.advance();
  }

  [Symbol.iterator](): Iterator<T> {
    return {
      next: (): IteratorResult<T, any> => {

        const result = this.current;

        if (this.done || !result) {
          return {done: true, value: null};
        }

        if (result === this.to) {
          this.done = true;
        }

        this.advance();

        return {
          value: result as T,
          done: false
        };
      }

    };
  }

  private advance() {
    if (this.current === this.to) {
      return;
    }
    if (this.stack.length) {
      this.current = this.stack.pop()!;
      if (this.current instanceof ModelElement) {
        this.stack.push(...this.current.children.reverse());
      }
    } else {
      const prev = this.current!;
      this.current = this.current!.parent;
      if (this.current && ModelNode.isModelElement(this.current)) {
        this.stack.push(...this.current.children.slice(this.current.children.indexOf(prev) + 1 ).reverse());
      }
    }

    if(this.current && !this.filter(this.current)) {
      this.advance();
    }
  }

}
