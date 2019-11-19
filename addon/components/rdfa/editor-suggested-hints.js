import classic from "ember-classic-decorator";
import { action } from "@ember/object";
import { layout as templateLayout } from "@ember-decorators/component";
import Component from '@ember/component';
import layout from '../../templates/components/rdfa/editor-suggested-hints';
import { A } from '@ember/array';
/**
 * @module rdfa-editor
 * @class RdfaEditorSuggestedHintsComponent
 */
@classic
@templateLayout(layout)
export default class EditorSuggestedHints extends Component {
  /**
   * @method closeHints
   */
  @action
  closeHints() {
    this.set('suggestedHints', A());
  }
}
