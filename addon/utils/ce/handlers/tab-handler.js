import EmberObject from '@ember/object';
import HandlerResponse from './handler-response';
import nextTextNode from './next-text-node';
import { isInLumpNode, getParentLumpNode, getNextNonLumpTextNode } from '../lump-node-utils';

export default EmberObject.extend({
  isHandlerFor(event) {
    return (event.type === "keydown" && event.key === "Tab" && this.rawEditor.currentNode);
  },

  handleEvent() {
    const currentNode = this.rawEditor.currentNode;
    const nextNode = this.nextNode(currentNode);
    this.rawEditor.updateRichNode();
    this.rawEditor.setCarret(nextNode, 0);
    return new HandlerResponse({ allowPropagation: false });
  },

  nextNode(current) {
    let newNode = nextTextNode(current, this.rawEditor.rootNode);
    if(isInLumpNode(newNode)){
      return getNextNonLumpTextNode(newNode, this.rawEditor.rootNode);
    }
    return newNode;
  }
});
