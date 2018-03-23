import Component from '@ember/component';
import layout from '../templates/components/document-structure-item';
import forgivingAction from '@lblod/ember-contenteditable-editor/utils/forgiving-action';
export default Component.extend({
  layout,
  classNames: ["side-navigation__group"],
  tagName: "ul",
  actions: {
    itemClicked(node) {
      forgivingAction('itemClicked', this)(node);
      return false;
    }
  }
});
