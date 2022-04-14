import { helper } from '@ember/component/helper';
import { insertWidgets } from "../utils/widget-map";

export function notInsertWidget ([widget]) {
  if(insertWidgets.indexOf(widget.componentName) > -1){
    return false;
  }
  else{
    return true;
  }
}

export default helper(notInsertWidget);
