/**
 * SELECTION UTILS API
 */

/**
 * Checks if the result of selected contexts is empty
 *
 * @param {Object} Selected contexts retuned by the selectContext method
 *
 * @return { Boolean } True if the selections are empty, false otherwise
 */
function isEmpty(selectedContexts) {
  return selectedContexts.selections.length == 0;
}

export {
  isEmpty
}
