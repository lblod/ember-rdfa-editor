import RichSelectionTracker, {RichSelection} from "@lblod/ember-rdfa-editor/utils/ce/rich-selection-tracker";

/**
 * Abstraction layer for the DOM. This is the only class that is allowed to call DOM methods.
 * Code that needs to modify the DOM has to use a {@link Command}.
 * The model is still exposed for querying but that might become even more restricted later.
 */
export default class Model {

  private richSelectionTracker: RichSelectionTracker;
  /**
   * The root of the editor. This will get set by ember,
   * so we trick typescript into assuming it is never null
   * @private
   */
  private _rootNode!: HTMLElement;

  constructor() {
    this.richSelectionTracker = new RichSelectionTracker();
  }
  get rootNode() : HTMLElement {
    return this._rootNode;
  }

  set rootNode(rootNode: HTMLElement) {
    this._rootNode = rootNode;
  }

  get selection() : RichSelection {
    return this.richSelectionTracker.richSelection;
  }
}
