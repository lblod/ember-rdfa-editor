import classic from "ember-classic-decorator";
import { layout as templateLayout } from "@ember-decorators/component";
import { A } from '@ember/array';
import Component from '@ember/component';
import layout from '../../templates/components/rdfa/rdfa-editor-debugger';
import { action } from '@ember/object';

/**
* Debugger component for the RDFa Editor
*
* @module rdfa-editor
* @class RdfaEditorDebugger
* @extends Component
*/
@classic
@templateLayout(layout)
export default class RdfaEditorDebugger extends Component {
  /**
  * Objects used for debugging containing the hints registry, context scanner and editor
  *
  * @property debug
  * @type Object
  *
  * @public
  */
  debug = null;

  /**
  * Whether the debug panel is enabled
  *
  * @property debugEnabled
  * @type boolean
  *
  * @public
  */
  debugEnabled = false;

  /**
  * Currently active debug mode
  *
  * @property debugMode
  * @type string
  * @default 'context-scanner'
  *
  * @public
  */
  debugMode = 'context-scanner';

  /**
  * Available debug modes
  *
  * @property debugModes
  * @type Ember.Array
  *
  * @private
  */
  debugModes = null;

  @action
  toggleDebug() {
    this.toggleProperty('debugEnabled');
  }

  init() {
    super.init(...arguments);
    this.set('debugModes', A(['hints-registry', 'context-scanner']));
  }
}
