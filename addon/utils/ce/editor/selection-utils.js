/**
 * 
 */

/**
 * Fake class to list helper functions
 * these functions can be used from the editor : editor.{function}
 *
 * SELECTION UTILS API
 *
 * @module contenteditable-editor
 * @class SelectionUtils
 * @constructor
 */

/**
 * Checks if the result of selected contexts is empty
 *
 * @method isEmpty
 * @param {Object} Selected contexts retuned by the selectContext method
 * @return { Boolean } True if the selections are empty, false otherwise
 */
function isEmpty(selectedContexts) {
  return selectedContexts.selections.length == 0;
}

export {
  isEmpty
}
