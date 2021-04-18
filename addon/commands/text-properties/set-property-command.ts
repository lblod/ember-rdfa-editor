import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelTreeWalker, {FilterResult} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import PropertyCleaner from "@lblod/ember-rdfa-editor/model/cleaners/property-cleaner";

export default abstract class SetPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }

  protected setProperty(property: TextAttribute, value: boolean, selection: ModelSelection = this.model.selection) {


    if (!ModelSelection.isWellBehaved(selection)) {
      console.info("Not executing SetPropertyCommand because selection is missing");
      return;
    }

    const range = selection.lastRange;

    if (range.collapsed) {

      range.start.split();

      const referenceNode = range.start.nodeBefore() || range.start.nodeAfter()!;
      const node = new ModelText(INVISIBLE_SPACE);
      if(ModelNode.isModelText(referenceNode)) {
        for(const [prop, val] of referenceNode.getTextAttributes()) {
          node.setTextAttribute(prop, val);
        }
      }
      //insert new textNode with property set
      node.setTextAttribute(property, value);
      const insertionIndex = range.start.parent.offsetToIndex(range.start.parentOffset);
      range.start.parent.addChild(node, insertionIndex );

      //put the cursor inside that node
      const cursorPath = node.getOffsetPath();
      const newRange = ModelRange.fromPaths(range.root, cursorPath, cursorPath);
      selection.selectRange(newRange);

    } else {

      range.start.split();
      range.end.split();

      const walker = new ModelTreeWalker({
        range,
        filter: (node: ModelNode) => {
          return ModelNode.isModelText(node) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP;
        }
      });
      const textNodes = Array.from(walker);

      for (const node of textNodes) {
        node.setTextAttribute(property, value);
      }
    }
    const cleaner = new PropertyCleaner();
    cleaner.clean(range);
    this.model.write();
  }
}
