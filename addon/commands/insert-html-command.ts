import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {ModelTreeWalker} from "@lblod/ember-rdfa-editor/model/util/tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader"
import ModelText from "../model/model-text";


/**
 * command will convert all nodes in the selection to a list if they are not already in a list
 */
export default class InsertHtmlCommand extends Command {
  name = "insert-html";

  constructor(model: Model) {
    super(model);
  }
  execute(htmlString: string, selection: ModelSelection = this.model.selection) {
    const range = selection.lastRange;
    if(!range){
      return;
    }
    const parser = new DOMParser();
    const html = parser.parseFromString(htmlString, "text/html");
    const bodyContent=html.body.children[0];
    const reader = new HtmlReader(this.model);
    const modelNode = reader.read(bodyContent);
    this.model.change(mutator => {
      mutator.insertNode(range, modelNode);
    });
  }
}
