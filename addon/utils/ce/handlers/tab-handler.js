import EmberObject from '@ember/object';
import HandlerResponse from './handler-response';
import nextTextNode from '../next-text-node';
export default EmberObject.extend({
  isHandlerFor(event) {

    return (event.type === "keydown" && event.key === "Tab" && this.rawEditor.currentNode);
  },

  handleEvent() {
    const currentNode = this.rawEditor.currentNode;
    const nextNode = nextTextNode(currentNode);
    this.rawEditor.updateRichNode();
    this.rawEditor.setCarret(nextNode, 0);
    return HandlerResponse.create({ allowPropagation: false });
  }
});
