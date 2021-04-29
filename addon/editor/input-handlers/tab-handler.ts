import { InputHandler } from './input-handler';
import { Manipulation, ManipulationExecutor, Editor, ManipulationGuidance } from './manipulation';
import { warn /*, debug, deprecate*/ } from '@ember/debug';
import { isVoidElement, isVisibleElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import LumpNodeTabInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/lump-node/tab-input-plugin';
import ListTabInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/lists/tab-input-plugin';
import TableTabInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/table/tab-input-plugin';
import { ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';
import LegacyRawEditor from "@lblod/ember-rdfa-editor/utils/ce/legacy-raw-editor";
import RawEditor from 'dummy/utils/ce/raw-editor';

/**
 * Interface for specific plugins.
 */
export interface TabInputPlugin {
  /**
   * One-liner explaining what the plugin solves.
   */
  label: string;

  /**
   * Callback executed to see if the plugin allows a certain
   * manipulation and/or if it intends to handle the manipulation
   * itself.
   */
  guidanceForManipulation: (manipulation: Manipulation, editor: RawEditor) => ManipulationGuidance | null;
}

/**
 * Tab Input Handler, a event handler to handle tab input
 *
 * @module contenteditable-editor
 * @class TabInputHandler
 * @constructor
 */
export default class TabInputHandler implements InputHandler {
  rawEditor: LegacyRawEditor;
  plugins: Array<TabInputPlugin>;

  constructor( {rawEditor} : { rawEditor: LegacyRawEditor} ) {
    this.rawEditor = rawEditor;
    this.plugins = [
      new LumpNodeTabInputPlugin(),
      new ListTabInputPlugin(),
      new TableTabInputPlugin()
    ];
  }

  isHandlerFor(event: Event) {
    const selection = window.getSelection();

    if(!selection || !selection.isCollapsed) return false;

    const keyboardEvent = event as KeyboardEvent;
    //TODO: include shift key here?
    return event.type === 'keydown' && keyboardEvent.key === 'Tab' && this.rawEditor.rootNode.contains(selection.anchorNode);

  }

  handleEvent(event : KeyboardEvent) {
    const manipulation = this.getNextManipulation(event);
    // check if we can execute it
    const { mayExecute, dispatchedExecutor } = this.checkManipulationByPlugins( manipulation );

    // error if we're not allowed to
    if ( ! mayExecute ) {
      warn( `Not allowed to execute manipulation for ${this.constructor.toString()}`, { id: 'tab-input-handler-manipulation-not-allowed' } );
      return { allowPropagation: false };
    }

    // run the manipulation
    if( dispatchedExecutor ) {
      // NOTE: we should pass some sort of editor interface here in the future.
      dispatchedExecutor( manipulation, this.rawEditor);
    }
    else {
      this.handleNativeManipulation( manipulation );
    }
    return { allowPropagation: false };
  }

  handleNativeManipulation(manipulation: Manipulation) {

    /************************ SHIFT TAB ************************/
    if (manipulation.type == 'moveCursorToEndOfElement') {
      const element = manipulation.node ;
      let textNode;
      if(element.lastChild && element.lastChild.nodeType == Node.TEXT_NODE){
        textNode = element.lastChild as Text;
      }
      else {
        textNode = document.createTextNode('');
        element.append(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode );
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, textNode.length);
    }

    else if(manipulation.type == 'moveCursorBeforeElement'){
      const element = manipulation.node ;
      let textNode;
      if(element.previousSibling && element.previousSibling.nodeType == Node.TEXT_NODE){
        textNode = element.previousSibling;
      }
      else {
        textNode = document.createTextNode('');
        element.before(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode as Text);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, textNode.length);
    }

    //TODO: this could be moved to a plugin eventually.
    else if(manipulation.type == 'moveCursorBeforeEditor'){
      console.warn('editor/tab-handler: handle moveCursorBeforeEditor currently disabled until we are sure what we want here');
    }

    /************************ TAB ************************/
    else if (manipulation.type == 'moveCursorToStartOfElement') {
      const element = manipulation.node ;
      let textNode;
      if(element.firstChild && element.firstChild.nodeType == Node.TEXT_NODE){
        textNode = element.firstChild;
      }
      else {
        textNode = document.createTextNode('');
        element.prepend(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode as Text);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, 0);
    }

    else if(manipulation.type == 'moveCursorAfterElement'){
      const element = manipulation.node ;
      let textNode;
      if(element.nextSibling && element.nextSibling.nodeType == Node.TEXT_NODE){
        textNode = element.nextSibling;
      }
      else {
        textNode = document.createTextNode('');
        element.after(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode as Text);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, 0);
    }

    //TODO: this could be moved to a plugin eventually.
    else if(manipulation.type == 'moveCursorAfterEditor'){
      console.warn('editor/tab-handler: handle moveCursorAfterEditor currently disabled until we are sure what we want here');
      // const element = manipulation.node as HTMLElement;
      // element.blur();
    }

    else {
      throw 'unsupport manipulation';
    }
  }

  //TODO: fix end or beginning of editor.
  getNextManipulation(event : KeyboardEvent) : Manipulation {
    const selection = window.getSelection();

    if(!(selection && selection.isCollapsed))
      throw 'selection is required for tab input';

    if(event.shiftKey){
      return this.helpGetShiftTabNextManipulation(selection);
    }
    else {
      return this.helpGetTabNextManipulation(selection);
    }
  }

  helpGetShiftTabNextManipulation(selection : Selection) : Manipulation {
    const { anchorNode } = selection;

    if(! (anchorNode && anchorNode.parentElement) )
      throw 'Tab input expected anchorNode and parentElement';

    const parentElement = anchorNode.parentElement;

    let nextManipulation;

    //TODO: assumes anchorNode is not an element.
    if(parentElement.firstChild && parentElement.firstChild.isSameNode(anchorNode)){
      nextManipulation = { type: 'moveCursorBeforeElement', node: parentElement, selection };
    }
    else {
      const childNodes = Array.from(parentElement.childNodes);
      const offsetAnchorNode = childNodes.indexOf(anchorNode as ChildNode);
      const remainingSiblings = [ ...childNodes.slice(0, offsetAnchorNode + 1) ].reverse();

      const previousElementForCursor = remainingSiblings.find(node => {
        return !isVoidElement(node) && node.nodeType == Node.ELEMENT_NODE && isVisibleElement(node as HTMLElement);
      });

      if(previousElementForCursor){
        nextManipulation = { type: 'moveCursorToEndOfElement', node: previousElementForCursor as HTMLElement, selection};
      }
      else {
        nextManipulation = { type: 'moveCursorBeforeElement', node: parentElement, selection };
      }
    }

    if(nextManipulation.type === 'moveCursorBeforeElement'  && nextManipulation.node.isSameNode(this.rawEditor.rootNode) ){
      nextManipulation = { type: 'moveCursorBeforeEditor', node: nextManipulation.node };
    }

    return nextManipulation as Manipulation;
  }

  helpGetTabNextManipulation(selection : Selection) : Manipulation {
    const { anchorNode } = selection;

    if(! (anchorNode && anchorNode.parentElement) )
      throw 'Tab input expected anchorNode and parentElement';

    const parentElement = anchorNode.parentElement;

    let nextManipulation;

    //TODO: assumes anchorNode is not an element.
    if(parentElement.lastChild && parentElement.lastChild.isSameNode(anchorNode)){
      nextManipulation = { type: 'moveCursorAfterElement', node: parentElement, selection };
    }
    else {

      const childNodes = Array.from(parentElement.childNodes);
      const offsetAnchorNode = childNodes.indexOf(anchorNode as ChildNode);
      const remainingSiblings = childNodes.slice(offsetAnchorNode + 1);

      const nextElementForCursor = remainingSiblings.find(node => {
        return !isVoidElement(node) && node.nodeType == Node.ELEMENT_NODE && isVisibleElement(node as HTMLElement);
      });

      if(nextElementForCursor){
        nextManipulation = { type: 'moveCursorToStartOfElement', node: nextElementForCursor as HTMLElement, selection};
      }
      else {
        nextManipulation = { type: 'moveCursorAfterElement', node: parentElement, selection };
      }
    }

    if(nextManipulation.type === 'moveCursorAfterElement'  && nextManipulation.node.isSameNode(this.rawEditor.rootNode) ){
      nextManipulation = { type: 'moveCursorAfterEditor', node: nextManipulation.node };
    }

    return nextManipulation as Manipulation;

  }

  /**
   * Checks whether all plugins agree the manipulation is allowed.
   *
   * This method asks each plugin individually if the manipulation is
   * allowed.  If it is not allowed by *any* plugin, it yields a
   * negative response, otherwise it yields a positive response.
   *
   * We expect this method to be extended in the future with more rich
   * responses from plugins.  Something like 'skip' or 'merge' to
   * indicate this manipulation should be lumped together with a
   * previous manipulation.  Plugins may also want to execute the
   * changes themselves to ensure correct behaviour.
   *
   * @method checkManipulationByPlugins
   * @private
   *
   * @param {Manipulation} manipulation DOM manipulation which will be
   * checked by plugins.
   **/
  checkManipulationByPlugins(manipulation: Manipulation) : { mayExecute: boolean, dispatchedExecutor: ManipulationExecutor | null } {
    // calculate reports submitted by each plugin
    const reports : Array<{ plugin: TabInputPlugin, allow: boolean, executor: ManipulationExecutor | undefined }> = [];
    for ( const plugin of this.plugins ) {
      const guidance = plugin.guidanceForManipulation( manipulation, this.rawEditor );
      if( guidance ) {
        const allow = guidance.allow === undefined ? true : guidance.allow;
        const executor = guidance.executor;
        reports.push( { plugin, allow, executor } );
      }
    }

    // filter reports based on our interests
    const reportsNoExecute = reports.filter( ({ allow }) => !allow );
    const reportsWithExecutor = reports.filter( ({ executor }) => executor );

    // debug reporting
    if (reports.length > 1) {
      console.warn(`Multiple plugins want to alter this manipulation`, reports);
    }
    if (reportsNoExecute.length > 1 && reportsWithExecutor.length > 1) {
      console.error(`Some plugins don't want execution, others want custom execution`, { reportsNoExecute, reportsWithExecutor });
    }
    if (reportsWithExecutor.length > 1) {
      console.warn(`Multiple plugins want to execute this plugin. First entry in the list wins: ${reportsWithExecutor[0].plugin.label}`);
    }

    for( const { plugin } of reportsNoExecute ) {
      console.debug(`Was not allowed to execute tab manipulation by plugin ${plugin.label}`, { manipulation, plugin });
    }

    // yield result
    return {
      mayExecute: reportsNoExecute.length === 0,
      dispatchedExecutor: reportsWithExecutor.length ? reportsWithExecutor[0].executor as ManipulationExecutor : null
    };
  }

}
