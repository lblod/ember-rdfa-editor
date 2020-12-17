import Ember from "ember";
import EmberObject from '@ember/object';
import {runInDebug} from '@ember/debug';
import {A} from '@ember/array';
import CappedHistory from './capped-history';
import classic from 'ember-classic-decorator';
import MakeBoldCommand from '@lblod/ember-rdfa-editor/commands/text-properties/make-bold-command';
import RemoveBoldCommand from '@lblod/ember-rdfa-editor/commands/text-properties/remove-bold-command';
import MovementObserver from "@lblod/ember-rdfa-editor/utils/ce/movement-observers/movement-observer";
import {RichNode} from "@lblod/ember-rdfa-editor/editor/raw-editor";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";

/**
 * raw contenteditable editor, a utility class that shields editor internals from consuming applications.
 *
 * @module contenteditable-editor
 * @class RawEditor
 * @constructor
 * @extends EmberObject
 */
@classic
class RawEditor extends EmberObject {

  /**
   * a rich representation of the dom tree created with {{#crossLink "NodeWalker"}}NodeWalker{{/crossLink}}
   * @property richNode
   * @type RichNode
   * @protected
   */
  richNode!: RichNode;

  registeredCommands: Map<string, Command> = new Map()

  /**
   * current textContent from editor
   *
   * @property currentTextContent
   * @type String
   * @public
   */
  currentTextContent: string | null = null

  history!: CappedHistory;


  protected movementObservers: Ember.NativeArray<MovementObserver> ;
  protected model: Model;


  constructor(...args: any[]){
    super(...args);
    this.set('history', new CappedHistory({ maxItems: 100}));
    this.movementObservers = A();
    this.model = new Model();
    this.registerCommand(new MakeBoldCommand(this.model));
    this.registerCommand(new RemoveBoldCommand(this.model));
  }

  get rootNode() : HTMLElement {
    return this.model.rootNode;
  }
  set rootNode(rootNode: HTMLElement) {
    this.model.rootNode = rootNode;
  }

  /**
   * Commands
   */

  registerCommand(command: Command) {
    this.registeredCommands.set(command.name, command);
  }
  executeCommand(commandName: string, ...args: any[]) {
    const command = this.registeredCommands.get(commandName);
    if(!command) {
      throw new Error(`Unrecognized command ${commandName}`);
    }
    command.execute(...args);
  }
}

function deprecate(message: string) {
  runInDebug( () => console.trace(`DEPRECATION: ${message}`)); // eslint-disable-line no-console
}
export default RawEditor;
