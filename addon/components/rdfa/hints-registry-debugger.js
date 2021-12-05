import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * Debugger component for the {{#crossLink "HintsRegistry"}}Hints Registry{{/crossLink}}
 *
 * @module rdfa-editor
 * @class HintsRegistryDebugger
 * @extends Component
 */
export default class HintsRegistryDebugger extends Component {
  /**
   * Hints registry to use for debugging
   *
   * @property hintsRegistry
   * @type HintsRegistry
   *
   * @public
   */
  @tracked
  hintsRegistry = null;

  /**
   * Hints currently stored in the hints registry
   *
   * @property hints
   * @type Array
   *
   * @private
   */
  get hints() {
    return this.hintsRegistry.registry;
  }
}
