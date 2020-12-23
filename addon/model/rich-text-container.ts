import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";
import RichText from "@lblod/ember-rdfa-editor/model/rich-text";

/**
 * A container which can only store {@link RichText} nodes
 */
export class RichTextContainer extends RichElement<RichText> {

  private _next: RichTextContainer | null = null;
  private _previous: RichTextContainer | null = null;

  get previous(): RichTextContainer | null {
    return this._previous;
  }

  set previous(value: RichTextContainer | null) {
    this._previous = value;
  }
  get next(): RichTextContainer | null {
    return this._next;
  }

  set next(value: RichTextContainer | null) {
    this._next = value;
  }


  /**
   * Add the child at index and do some bookkeeping
   * for the links between the children.
   * @param child
   * @param index
   */
  addChild(child: RichText, index: number = this.children.length) {
    const isFirst = index === 0;
    const isLast = index === this.children.length;
    super.addChild(child, index);
    child.parent = this;
    if (!(isFirst && isLast)) {
      if (isFirst) {
        child.nextSibling = this.children[1];
        this.children[1].previousSibling = child;

      } else if (isLast) {
        child.previousSibling = this.children[this.children.length - 2];
        this.children[this.children.length - 2].nextSibling = child;

      } else {
        child.nextSibling = this.children[index - 1];
        this.children[index - 1].previousSibling = child;
        child.previousSibling = this.children[index + 1];
        this.children[index + 1].nextSibling = child;
      }
    }

  }


}
