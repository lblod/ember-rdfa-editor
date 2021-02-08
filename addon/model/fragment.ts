import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import {ModelNodeType} from "@lblod/ember-rdfa-editor/model/model-node";

/**
 * Internal utility element that doesnt get rendered. It's used as a temporary container for textnodes
 * to group complex styling structures without introducing unnecessary dom elements
 */
export default class Fragment extends ModelElement {
  modelNodeType: ModelNodeType = "FRAGMENT";

  private textAttributeMap: Map<TextAttribute, boolean>;

  constructor() {
    super();
    this.textAttributeMap = new Map<TextAttribute, boolean>();
  }

  get isBlock(): boolean {
    return false;
  }

  setTextAttribute(key: TextAttribute, value: boolean) {
    this.textAttributeMap.set(key, value);
  }

  addChild(child: ModelText | Fragment, position?: number) {
    super.addChild(child, position);
    for (const entry of this.textAttributeMap.entries()) {
      child.setTextAttribute(entry[0], entry[1]);
    }
  }


}
