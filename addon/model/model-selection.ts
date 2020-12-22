import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class ModelSelection {

  anchorElement!: RichElement;
  focusElement!: RichElement;
  anchorOffset!: number;
  focusOffset!: number;
  isCollapsed!: boolean;
  model: Model;

  constructor(model: Model, selection: Selection) {
    this.model = model;
    this.setFromDomSelection(selection);
  }


  setFromDomSelection(selection: Selection) {
    debugger;
    if(!selection.anchorNode || !selection.focusNode) {
      this.anchorElement = this.model.rootRichElement;
      this.focusElement = this.model.rootRichElement;
      this.anchorOffset = 0;
      this.focusOffset = 0;
      this.isCollapsed = true;
      return;
    }

    const anchor = this.model.ensureHTMLElement(selection.anchorNode);
    const focus = this.model.ensureHTMLElement(selection.focusNode);
    this.anchorElement = this.model.getRichElementFor(anchor);
    this.focusElement = this.model.getRichElementFor(focus);

    // TODO: this is not correct
    this.anchorOffset = selection.anchorOffset;
    this.focusOffset = selection.focusOffset;
    this.isCollapsed = selection.isCollapsed;
  }

}
