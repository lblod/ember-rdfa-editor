import CutCopyHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/cut-copy-handler';

/**
 * @module contenteditable-editor
 * @class CutHandler
 * @constructor
 */
export default class CutHandler extends CutCopyHandler {
  deleteSelection = true;
}
