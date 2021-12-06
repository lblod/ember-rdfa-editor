import CutCopyHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/cut-copy-handler';

/**
 * @module contenteditable-editor
 * @class CopyHandler
 * @constructor
 */
export default class CopyHandler extends CutCopyHandler {
  deleteSelection = false;
}
