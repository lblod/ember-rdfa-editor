import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import Operation from "@lblod/ember-rdfa-editor/core/operations/operation";
import {UnconfinedRangeError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelTreeWalker, {FilterResult} from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import {AfterAttributeOperationEvent} from "@lblod/ember-rdfa-editor/core/editor-events";

export default class AttributeOperation extends Operation {

  private _key: TextAttribute;
  private _value: boolean;

  constructor(eventBus: EventBus, range: ModelRange, key: TextAttribute, value: boolean) {
    super(eventBus, range);
    this._key = key;
    this._value = value;
  }

  get value(): boolean {
    return this._value;
  }

  set value(value: boolean) {
    this._value = value;
  }

  get key(): TextAttribute {
    return this._key;
  }

  set key(value: TextAttribute) {
    this._key = value;
  }

  canExecute() {
    return true;
  }

  execute(): ModelRange {
    const result = this.doExecute();
    this.eventBus.emit(new AfterAttributeOperationEvent(this));
    return result;
  }

  private doExecute(): ModelRange {
    if (!this.canExecute()) {
      throw new UnconfinedRangeError();
    }

    if (this.range.collapsed) {

      this.range.start.split();

      const referenceNode = this.range.start.nodeBefore() || this.range.start.nodeAfter()!;
      const node = new ModelText(INVISIBLE_SPACE);
      if (ModelNode.isModelText(referenceNode)) {
        for (const [prop, val] of referenceNode.getTextAttributes()) {
          node.setTextAttribute(prop, val);
        }
      }
      //insert new textNode with property set
      node.setTextAttribute(this._key, this._value);
      const insertionIndex = this.range.start.parent.offsetToIndex(this.range.start.parentOffset);
      this.range.start.parent.addChild(node, insertionIndex);

      //put the cursor inside that node
      const cursorPath = node.getOffsetPath();
      const newRange = ModelRange.fromPaths(this.range.root, cursorPath, cursorPath);
      return newRange;

    } else {

      this.range.start.split();
      this.range.end.split();

      const walker = new ModelTreeWalker({
        range: this.range,
        filter: (node: ModelNode) => {
          return ModelNode.isModelText(node) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP;
        }
      });
      const textNodes = Array.from(walker);

      for (const node of textNodes) {
        node.setTextAttribute(this._key, this._value);
      }
    }
    return this.range;

  }
}
