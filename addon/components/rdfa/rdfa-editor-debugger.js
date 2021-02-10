import { A } from '@ember/array';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
* Debugger component for the RDFa Editor
*
* @module rdfa-editor
* @class RdfaEditorDebugger
* @extends Component
*/

export default class RdfaEditorDebugger extends Component {
  /**
  * Objects used for debugging containing the hints registry, context scanner and editor
  *
  * @property debug
  * @type Object
  *
  * @public
  */
  get debug() {
    return this.args.debug;
  }

  /**
  * Whether the debug panel is enabled
  *
  * @property debugEnabled
  * @type boolean
  *
  * @public
  */
  @tracked debugEnabled = false;

  /**
  * Currently active debug mode
  *
  * @property debugMode
  * @type string
  * @default 'context-scanner'
  *
  * @public
  */
  @tracked debugMode = 'context-scanner';

  /**
  * Available debug modes
  *
  * @property debugModes
  * @type Ember.Array
  *
  * @private
  */
  debugModes = A(['hints-registry', 'context-scanner']);

  @action
  toggleDebug() {
    this.debugEnabled = ! this.debugEnabled;
  }

  @action
  updateDebugMode(event) {
    this.debugMode = event.target.value;
  }
}
