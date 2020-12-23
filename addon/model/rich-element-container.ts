import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";

/**
 * An element container which can store other containers, but not {@link RichText} nodes
 */
export default class RichElementContainer extends RichElement<RichElementContainer | RichTextContainer> {
  /**
   * Add a child at index. Does a whole lot of bookkeeping to allow for linear traversal of
   * {@link RichText} nodes.
   * TODO: needs some work, mostly cleaning, possibly a rethink
   * @param child
   * @param index
   */
  addChild(child: RichElementContainer | RichTextContainer, index: number = this.children.length) {
    super.addChild(child, index);
    child.parent = this;
    if (child instanceof RichTextContainer) {
      //This might be costly, but probably isn't that bad
      //The idea is that in most cases we deal with
      //this will find a container quite quickly
      //we prefer walking backwards first since appending should happen more often than inserting at the start
      const previousTextContainer = this.findRichTextContainerBackwards(index - 1);
      if (previousTextContainer) {
        child.previous = previousTextContainer;
        child.next = previousTextContainer.next;
        previousTextContainer.next = child;
        if (child.next) {
          child.next.previous = child;
        }
      } else {
        const nextTextContainer = this.findRichTextContainerForwards(index + 1);
        if (nextTextContainer) {
          child.next = nextTextContainer;
          child.previous = nextTextContainer.previous;
          nextTextContainer.previous = child;
          if (child.previous) {
            child.previous.next = child;
          }
        }
      }
    } else {
      const firstRT = child.findRichTextContainerForwards(0);
      const lastRT = child.findRichTextContainerBackwards(child.children.length - 1);
      const prev = this.findRichTextContainerBackwards(index - 1);
      const next = this.findRichTextContainerForwards(index + 1);
      if(prev) {
        prev.next = firstRT;
      }
      if(firstRT) {
        firstRT.previous = prev;
      }
      if(next) {
        next.previous = lastRT;
      }
      if(lastRT) {
        lastRT.next = next;
      }
    }
  }


  /**
   * Walk backwards looking for a RichTextContainer so we can maintain the links
   * first visits all children, then if none are found goes up to parent and continues there
   * @param from
   */
  findRichTextContainerBackwards(from: number):
    RichTextContainer | null {
    let i = from;
    let current: RichElementContainer | RichTextContainer | null = this.children[i];
    while (i >= 0 && current && !(current instanceof RichTextContainer) ) {
      current = current.findRichTextContainerBackwards(current.children.length - 1);
      if (!(current instanceof RichTextContainer)) {
        i--;
        current = this.children[i];
      }
    }
    if (!(current instanceof RichTextContainer)) {
      current = this.parent?.findRichTextContainerBackwards(this.parent?.children.indexOf(this) - 1) || null;
    }
    return current;
  }

  /**
   * Walk forwards looking for a RichTextContainer so we can maintain the links
   * first visits all children, then if none are found goes up to parent and continues there
   * @param from
   */
  findRichTextContainerForwards(from: number):
    RichTextContainer | null {
    let i = from;
    let current: RichElementContainer | RichTextContainer | null = this.children[i];
    while (current && !(current instanceof RichTextContainer) && i < this.children.length) {
      current = current.findRichTextContainerBackwards(current.children.length - 1);
      if (!(current instanceof RichTextContainer)) {
        i++;
        current = this.children[i];
      }
    }
    if (!(current instanceof RichTextContainer)) {
      current = this.parent?.findRichTextContainerBackwards(this.parent?.children.indexOf(this) + 1) || null;
    }
    return current;

  }

}
