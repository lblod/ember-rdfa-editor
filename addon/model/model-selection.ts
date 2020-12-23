import Model, {RichContainer} from "@lblod/ember-rdfa-editor/model/model";
import RichText from "@lblod/ember-rdfa-editor/model/rich-text";
import {getWindowSelection, isElement, isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import RichElementContainer from "@lblod/ember-rdfa-editor/model/rich-element-container";

/**
 * Just like the {@link Model} is a representation of the document, the ModelSelection is a representation
 * of the document selection.
 */
export default class ModelSelection {

  anchorElement: RichText | null = null;
  focusElement: RichText | null = null;
  commonAncestorContainer!: RichContainer;
  anchorOffset!: number;
  focusOffset!: number;
  model: Model;

  constructor(model: Model, selection: Selection) {
    this.model = model;
    this.setFromDomSelection(selection);
  }

  /**
   * @return whether the selection is collapsed
   */
  get isCollapsed() {
    return this.anchorElement === this.focusElement && this.anchorOffset === this.focusOffset;
  }

  /**
   * Collapse the selection into a caret
   * @param toLeft whether the caret should end up at the beginning of the selection, defaults to false
   */
  collapse(toLeft: boolean = false) {
    if (toLeft) {
      this.anchorElement = this.focusElement;
      this.anchorOffset = this.focusOffset;
    } else {
      this.focusElement = this.anchorElement;
      this.focusOffset = this.anchorOffset;
    }
  }

  /**
   * Select a full RichText node
   * @param node
   */
  selectNode(node: RichText) {
    this.anchorElement = node;
    this.anchorOffset = 0;
    this.focusElement = node;
    this.focusOffset = node.content.length;
  }

  /**
   * Build the modelSelection from the domSelection
   * TODO: needs cleanup. Crucial method, has to be perfect and preferably well-tested
   * @param selection
   */
  setFromDomSelection(selection: Selection) {
    if (!selection.anchorNode || !selection.focusNode) {
      this.focusElement = null;
      this.anchorElement = null;
      this.focusOffset = 0;
      this.anchorOffset = 0;
      return;
    }

    const {
      richNode: anchorElement,
      offset: anchorOffset
    } = this.translateNodeAndOffset(selection.anchorNode, selection.anchorOffset);
    const {
      richNode: focusElement,
      offset: focusOffset
    } = this.translateNodeAndOffset(selection.focusNode, selection.focusOffset);

    this.anchorOffset = anchorOffset;
    this.focusOffset = focusOffset;
    this.anchorElement = anchorElement;
    this.focusElement = focusElement;
    const commonAncestor = selection.getRangeAt(0)?.commonAncestorContainer;
    if (!selection.isCollapsed && commonAncestor) {
      if (isElement(commonAncestor)) {
        this.commonAncestorContainer = this.model.getRichElementFor(commonAncestor);

      } else {

        this.commonAncestorContainer = this.model.getRichElementFor(commonAncestor.parentElement!);
      }
    } else {
      this.commonAncestorContainer = this.focusElement.parent!;
    }
    if (this.isSelectionBackwards(selection)) {
      const tempEl = this.anchorElement;
      const tempOff = this.anchorOffset;

      this.anchorElement = this.focusElement;
      this.focusElement = tempEl;
      this.anchorOffset = this.focusOffset;
      this.focusOffset = tempOff;
    }
  }

  /**
   * Set the domSelection to match the modelSelection
   * TODO: needs cleanup. Crucial method, has to be perfect and preferably well-tested
   */
  writeToDom() {
    if (!this.anchorElement || !this.focusElement) {
      let cur: RichElementContainer | RichTextContainer | null | RichText = this.model.rootRichElement;
      while (cur && !(cur instanceof RichText)) {
        cur = cur.firstChild;
      }
      this.anchorElement = cur;
      this.focusElement = cur;
    }
    try {
      const selection = getWindowSelection();
      const newRange = document.createRange();
      console.log(this.anchorElement);
      newRange.setStart(this.anchorElement.getCorrespondingDomNode()!, this.anchorOffset);
      newRange.setEnd(this.focusElement.getCorrespondingDomNode()!, this.focusOffset);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Takes a selection node and offset and finds the right RichText node
   * TODO: needs cleanup. Crucial method, has to be perfect and preferably well-tested
   * @param node
   * @param offset
   * @private
   */
  private translateNodeAndOffset(node: Node, offset: number): { richNode: RichText, offset: number } {
    if (isTextNode(node)) {
      const parent = node.parentElement!;
      const index = Array.prototype.indexOf.call(parent.childNodes, node);
      const richNode = this.model.getRichElementFor(node.parentElement!).children[index] as RichText;
      return {richNode, offset};
    } else {
      let richNode = this.model.getRichElementFor(node as HTMLElement).children[offset];
      while (richNode && !(richNode instanceof RichText)) {
        richNode = (richNode as RichContainer).firstChild!;
      }

      return {richNode: richNode, offset: 0};
    }
  }

  /**
   * Helper trick to find out if the domSelection was selected right-to-left or not
   * Taken from the internet
   * @param selection
   * @private
   */
  private isSelectionBackwards(selection: Selection) {
    const range = document.createRange();
    range.setStart(selection.anchorNode!, selection.anchorOffset);
    range.setEnd(selection.focusNode!, selection.focusOffset);

    return range.collapsed;
  }


}
