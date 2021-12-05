import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * @module rdfa-editor
 * @class RdfaEditorSuggestedHintsComponent
 */
export default class EditorSuggestedHints extends Component {
  @tracked
  suggestedHints;

  /**
   * @method closeHints
   */
  @action
  closeHints() {
    this.suggestedHints = [];
  }
}
