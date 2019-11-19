import classic from "ember-classic-decorator";
import { layout as templateLayout } from "@ember-decorators/component";
import { computed } from "@ember/object";
import Component from '@ember/component';
import layout from '../../templates/components/rdfa/hints-registry-debugger';

/**
* Debugger component for the {{#crossLink "HintsRegistry"}}Hints Registry{{/crossLink}}
*
* @module rdfa-editor
* @class HintsRegistryDebugger
* @extends Component
*/
@classic
@templateLayout(layout)
export default class HintsRegistryDebugger extends Component {
  /**
  * Hints registry to use for debugging
  *
  * @property hintsRegistry
  * @type HintsRegistry
  *
  * @public
  */
  hintsRegistry = null;

  /**
  * Hints currently stored in the hints registry
  *
  * @property hints
  * @type Array
  *
  * @private
  */
  @computed('hintsRegistry.registry', 'hintsRegisty.registry.[]')
  get hints() {
    return this.get('hintsRegistry.registry');
  }
}
