/**
 * Wrapping function to call closure actions and be tolerant if there is no action
 * assigned to it.
 *
 * @method forgivingAction
 *
 * @param {Object} context context where the potential action should be defined
 * @param {String} name The name of the action
 *
 * @return {Function} the function assiociated with the action, or function returning nothing
 *
 * @public
 */
export default function forgivingAction(name, context) {
  let closureAction = context.get(name);

  if(closureAction) return closureAction;

  return () => { return; };
}
