import Component from '@ember/component';
import layout from '../templates/components/document-structure-item';
import forgivingAction from '../../utils/ce/forgiving-action';
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
