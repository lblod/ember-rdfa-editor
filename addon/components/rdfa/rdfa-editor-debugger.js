import { A } from '@ember/array';
import Component from '@ember/component';
import layout from '../templates/components/rdfa-editor-debugger';


/**
* Debugger component for the RDFa Editor
*
* @module rdfa-editor
* @class RdfaEditorDebugger
* @extends Component
*/
export default Component.extend({
  layout,

  /**
  * Objects used for debugging containing the hints registry, context scanner and editor
  *
  * @property debug
  * @type Object
  *
  * @public
  */
  debug: null,

  /**
  * Whether the debug panel is enabled
  *
  * @property debugEnabled
  * @type boolean
  *
  * @public
  */
  debugEnabled: false,

  /**
  * Currently active debug mode
  *
  * @property debugMode
  * @type string
  * @default 'context-scanner'
  *
  * @public
  */
  debugMode: 'context-scanner',

  /**
  * Available debug modes
  *
  * @property debugModes
  * @type Ember.Array
  *
  * @private
  */
  debugModes: null,

  init() {
    this._super(...arguments);
    this.set('debugModes', A(['hints-registry', 'context-scanner']));
  }
});
