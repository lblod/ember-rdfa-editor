import Component from '@ember/component';
import layout from '../../templates/components/hints-registry-debugger';
import { computed } from '@ember/object';

/**
* Debugger component for the {{#crossLink "HintsRegistry"}}Hints Registry{{/crossLink}}
*
* @module rdfa-editor
* @class HintsRegistryDebugger
* @extends Component
*/
export default Component.extend({
  layout,

  /**
  * Hints registry to use for debugging
  *
  * @property hintsRegistry
  * @type HintsRegistry
  *
  * @public
  */
  hintsRegistry: null,

  /**
  * Hints currently stored in the hints registry
  *
  * @property hints
  * @type Array
  *
  * @private
  */
  hints: computed('hintsRegistry.registry', 'hintsRegisty.registry.[]', function(){
    return this.get('hintsRegistry.registry');
  })
});
