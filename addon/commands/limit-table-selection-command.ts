export default class LimitiTableSelectionCommand extends Command {

  name = "limit-table-selection";

  constructor(model: Model) {
    super(model);
  }

  canExecute(_selection: ModelSelection = this.model.selection): boolean {
    return true;
  }

  execute(): void {
    this.limitTableSelection();
  }
  limitTableSelection(){
    const selection=this.model.selection;
    //check that a selection is inside a table
    if(selection.isInside(["table"])=="enabled"){
      //check if selection spans more than one td/th
      if(selection.isInside(["td", "th"])=="disabled"){
        //find first selected td/th
        const range = selection.lastRange!;
        const treeWalker = new ModelTreeWalker({
          range: range,
        });
        const resultArr = Array.from(treeWalker);
        const firstCell=resultArr.find(node=>ModelNode.isModelElement(node) && (node.type=="td" || node.type=="th"));
        //limit selection to that td/th
        //this is kinda hacky
        range.end.path[range.end.path.length-2]++;
        range.end.path[range.end.path.length-1]=0;
        this.model.writeSelection();
      }
      //console.log('we are in a table');
    }
    //check if there is a table in the selection
    else if(selection.contains(['table'])){
      //check if the table is selected completely

        //select the whole table as well as outside elements
      //else
        //select only the elements outside the table
      //console.log('we are not in a table');
    }
}
