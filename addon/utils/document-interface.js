/*
 * @module rdfa-editor
 * @class DocumentInterface
 * @constructor
 */
export default class DocumentInterface {
  constructor(editor) {
    this._editor = editor;
  }

  /**
   * the current selection in the editor, returns the region that is currently selected
   *
   * @property currentSelection
   * @type Array
   * @public
   */
  get currentSelection() { return this._editor.currentSelection; }
  /**
   * Selects the current selection, for applying operations to.
   * Current selection may be a cursor or a range.
   *
   * @method selectCurrentSelection
   * @public
   */
  selectCurrentSelection() { return this._editor.selectCurrentSelection(); }

  /**
   * Selects the highlighted range, or part of it, for applying
   * operations to.
   *
   * Without options, this method selects the full highlighted range
   * in order to apply operations to it.  The options hash can be used
   * to supply constraints:
   *
   * - { offset } : Array containing the left offset and right offset.
   *   Both need to be positive numbers.  The former is the amount of
   *   characters to strip off the left, the latter the amount of
   *   characters to strip off the right.
   * - TODO { regex } : Regular expression to run against the matching
   *   string.  Full matching string is used for manipulation.
   *
   * @method selectHighlight
   * @param {Array} region
   * @param {} options
   * @public
   */
  selectHighlight(range, options) { return this._editor.selectHighlight(range, options); }

  /**
 * Selects nodes based on an RDFa context that should be applied.
 *
 * Options for scope search default to 'auto'.
 *
 * Options for filtering:
 * - range: The range object describing the highlighted region.
 * - scope:
 *   - 'outer': Search from inner range and search for an item
 spanning the full supplied range or more.
 *   - 'inner': Search from outer range and search for an item which
 is fully contained in the supplied range.
 *   - 'auto': Perform a best effort to find the nodes in which you're
 interested.
 * - property: string of URI or array of URIs containing the property (or properties) which must apply.
 * - typeof: string of URI or array of URIs containing the types which must apply.
 * - datatype: string of URI containing the datatype which must apply.
 * - resource: string of URI containing the resource which must apply.
 * - content: string or regular expression of RDFa content.
 * - TODO attribute: string or regular expression of attribute available on the node.
 *
 * @method selectContext
 * @param {Array} region
 * @param {} options
 * @public
 */
  selectContext(region, options) { return this._editor.selectContext(region, options); }

  /**
 * Alters a selection from the API described above.
 *
 * Any selected range can be manipulated.  This method allows such
 * changes to happen on following key terms: property, typeof,
 * dataType, resource, content, (TODO: attribute), innerContent,
 * innerHTML
 *
 * - selection: Object retrieved from #selectContext or
 *   #selectHighlight.
 * - options: Object specifying desired behaviour.
 * - options.remove: Removes RDFa content that was already there.
 *     Allows removing any of property, typeof, datatype, resource,
 *     content, (TODO: attribute), innerContent, innerHTML
 * - options.add: Adds specific content to the selection, pushing
 *     nvalues on top of already existing values.  Allows adding any
 *     of property, typeof, datatype, resource.  Set the
 *     forceNewContext property to true to force a new context if a
 *     full tag is selected.
 * - options.set: Allows setting any of property, typeof, datatype,
 *     resource content attribute innerContent innerHTML.  Set the
 *     newContext property to true to force a new context if a full
 *     tag is selected.
 * - options.desc: You are oncouraged to write a brief description
 *     of the desired manipulation here for debugging needs.
 *
 * The syntax for specifying items to remove works as follows:
 * - true: Removes any value to be removed.
 * - string: Removes the specific value as supplied.  If no value
 *   matches, nothing is removed.  For semantic content, translation
 *   is done based on the current context, eg: if there is a
 *   foaf:name in the document, then suppling the string
 *   "http://xmlns.com/foaf/0.1/name" will usually mean foaf:name is
 *   matched.
 * - [string]: An array of strings means all the matches will be
 *   removed.  Matching works the same way as string.
 * - regex: Considers the present value and executes a regular
 *   expression on said value.  If the regular expression matches,
 *   the value is removed.
 * - [regex]: An array of regular experssions.  If any matches, the
 *   value itself is matched.
 *
 * The syntax for specifying items to add works for all properties
 * which can be set using "add".  Specification works as follows:
 * - string: Specifies a single value to set or add.
 * - [string]: Specifies a series of values to set or add.
 *
 * NOTE: The system is free to set or add
 * properties based on a short form (derived from the prefixes
 * available in the context) if it is possible and if it desires to
 * do so.
 *
 * NOTE: newContext is set to undefined by default and behaves
 * similar to false.  This is because we assume that when you don't
 * care about the context there's a fair chance that we can merge
 * the contexts.  In specific cases you may desire to have things
 * merge (or not) explicitly.  You should set eithre true or false
 * in that case.
 *
 * NOTE/TODO: In order to make plugins simpler, we should look into
 * specifying namespaces in the plugin.  By sharing these namespaces
 * with these setter methods, it becomes shorter te specify the URLs
 * to match on.
 *
 * NOTE/TODO: It is our intention to allow for multiple operations
 * to occur in series.  Altering the range in multiple steps.  This
 * can currently be done by executing the alterSelection multiple
 * times.  Connecting the changes this way does require you to make
 * a new selection each time you want to execute a new change.  If
 * this case occurs often *and* we can find sensible defaults on
 * updating the selection, we could make this case simpler.  The
 * options hash would also allow an array in that case.
 *
 * @method update
 * @param {Selection} selection retuned by the selectContext method
 * @param {Options} options
 */
  update(selection, operation) { return this._editor.update(selection, operation); }

  /**
   * set the carret position in the editor
   *
   * @method setCurrentPosition
   * @param {number} position of the range
   * @param {boolean} notify observers, default true
   * @public
   */
  setCurrentPosition(position) { this._editor.setCurrentPosition(position); }

    /**
   * set the carret on the desired position. This function ensures a text node is present at the requested position
   *
   * @method setCarret
   * @param {DOMNode} node, a text node or dom element
   * @param {number} offset, for a text node the relative offset within the text node (i.e. number of characters before the carret).
   *                         for a dom element the number of children before the carret.
   * @return {DOMNode} currentNode of the editor after the operation
   * Examples:
   *     to set the carret after 'c' in a textnode with text content 'abcd' use setCarret(textNode,3)
   *     to set the carret after the end of a node with innerHTML `<b>foo</b><span>work</span>` use setCarret(element, 2) (e.g setCarret(element, element.children.length))
   *     to set the carret after the b in a node with innerHTML `<b>foo</b><span>work</span>` use setCarret(element, 1) (e.g setCarret(element, indexOfChild + 1))
   *     to set the carret after the start of a node with innerHTML `<b>foo</b><span>work</span>` use setCarret(element, 0)
   *
   * @public
   */
  setCarret(domNode, relativePostion) { this._editor.setCarret(domNode, relativePostion);}
}
