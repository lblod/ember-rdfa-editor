import RichSelectionTracker, {RichSelection} from "@lblod/ember-rdfa-editor/utils/ce/rich-selection-tracker";

export default class Model {

  private richSelectionTracker: RichSelectionTracker;
  /**
   * The root of the editor. This will get set by ember,
   * so we trick typescript into assuming it is never null
   * @private
   */
  private _rootNode!: Node;

  constructor() {
    this.richSelectionTracker = new RichSelectionTracker();
  }
  get rootNode() : Node {
    return this._rootNode;
  }

  set rootNode(rootNode: Node) {
    this._rootNode = rootNode;
  }

  get selection() : RichSelection {
    return this.richSelectionTracker.richSelection;
  }
}
