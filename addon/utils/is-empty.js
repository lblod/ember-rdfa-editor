/**
 * Checks if the result of selected contexts is empty
 * NOTE: [EXPERIMENTAL] this function may move to another location.
 *
 * @param {Object} Selected contexts retuned by the selectContext method
 * @return { Boolean } True if the selections are empty, false otherwise
 */
export default function isEmpty(selectedContexts) {
  return selectedContexts.selections.length == 0;
}
