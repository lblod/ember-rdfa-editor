import { helper } from '@ember/component/helper';
import { insertWidgets } from "../utils/widget-map";

export function isInsertWidget ([widget]) {
  if(insertWidgets.indexOf(widget.componentName) > -1){
    return true;
  }
  else{
    return false;
  }
}

export default helper(isInsertWidget);