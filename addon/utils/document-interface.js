/**
 * Documentation interface for plugins.
 *
 * Plugins can manipulate the document.  Manipulation happens through
 * the methods offered in this interface.
 *
 * In order to manipulate the document, first a range is selected
 * (either based on its semantics, or based on its range)
 *
 * @module rdfa-editor
 * @class DocumentInterface
 * @constructor
 */
export default class DocumentInterface {
  constructor(editor) {
    this._editor = editor;
  }

  /**
   * The currently selected range in the editor.
   *
   * If the start and end selection are equal, no range is selected
   * and the index is the offset.
   *
   * TODO: describe how to use this selection.
   *
   * @property currentSelection
   * @return {Array} The region that is currently selected
   * @public
   */
  get currentSelection() { return this._editor.currentSelection; }

  /**
   * Selects the current selection for applying operations.
   * CurrentSelection could be a cursor position or a range.
   *
   * @method selectCurrentSelection
   * @return {Selection} Instance on which operations can be executed (see:
   * @public
   */
  selectCurrentSelection() { return this._editor.selectCurrentSelection(); }

  /**
   * Selects the highlighted range, or part of it, for applying
   * operations to.
   *
   * Without options, this method selects the full highlighted range
   * in order to apply operations to it.  The options hash can be used
   * to supply constraints.
   *
   * @method selectHighlight
   * @param {Array} region Region to select in terms of absolute
   * positions with respect to the current state (hrId) of the
   * HintsRegistry.
   * @param {Object} [options] Optional settings to manipulate the
   * settings of the selection.
   * @param {Array} [options.offset] Array containing the left offset
   * and right offset.  Both need to be positive numbers.  The former
   * is the amount of characters to strip off the left, the latter the
   * amount of characters to strip off the right.
   * @param {Object} [options.regex] TODO: FUTURE Regular expression to
   * run on the matching string in order to select the right contents.
   * The full matching string is used for manipulations which happen
   * on this selection.
   * @public
   */
  selectHighlight(range, options) { return this._editor.selectHighlight(range, options); }

  /**
   * Selects nodes based on an RDFa context that should be applied.
   * This selection is later used to manipulate.
   *
   * The selection process is in one part the specification of a
   * semantic context (being properties which RDFa supports), and in
   * another part how to find such context (are we looking explicitly
   * for a parent, for a child, or could it be either).
   *
   * @method selectContext
   * @param {Array} region Region to select in terms of absolute
   * positions with respect to the current state (hrId) of the
   * HintsRegistry.
   * @param {Object} options Specification of the semantic context to
   * select.
   * @param {String} [options.scope] Do you intend to explicitly search for a
   * context which is fully embedded in the supplied region
   * (`"inner"`), fully outside the supplied region (`"outer"`) or
   * should pernet make a somewhat informed decision (`"auto"`).  If not
   * supplied `"auto"` is assumed.
   *
   * Options are thus:
   *
   *   - `"outer"`: Search from inner range and search for an item
   *     spanning the full supplied range or more.
   *   - `"inner"`: Search from outer range and search for an item
   *     which is fully contained in the supplied range.
   *   - `"auto"`: Perform a best effort to find the nodes in which
   *     you're interested.
   * @param {String|Array} [options.property] string of URI or array
   * of URIs containing the property (or properties) which must apply.
   * @param {String|Array} [options.typeof] string of URI or array of
   * URIs containing the types which must apply.
   * @param {String|Array} [options.datatype] string of URI containing
   * the datatype which must apply.
   * @param {String|Array} [options.resource] string of URI containing
   * the resource which must apply.
   * @param {String|Array} [options.content] string or regular
   * expression of RDFa content.
   * @param {String|Array} [options.attribute] TODO: FUTURE string or
   * regular expression of attribute available on the node.
   * @public
   */
  selectContext(region, options) { return this._editor.selectContext(region, options); }

  /**
   * Updates a selection as described above.
   *
   * Indication of content to change comes in three levels.  The
   * interface is easy to use, but explaining is somewhat strange.
   * Check the example below if you are getting started.
   *
   * When writing plugins it is often not very clear in which
   * circumstances the plugin could be triggered.  It is easy to
   * imagine your immediate use case but a myriad of others may work
   * as well.  This API lets you provide as much information about the
   * intended consequence as possible and it will do its best to
   * create a document that abides your request based on the input.
   * It is always smart to doublecheck the output for your intended
   * use-cases.
   *
   * The specification interface consists of three levels which can
   * roughly be combined at will.  First level most broadly indicates
   * if you want to add or remove information.  Second level lets you
   * indicate the information which needs to change, third level
   * indicates the changed content.  Not all combinations are sensible
   * and rarely needed ones may not be implemented yet.
   *
   * **First level** indicates whether we are setting, removing or
   * adding context:
   *
   * - `add`: adds semantic content to the document leaving current
   *     semantics is place.
   * - `remove`: removes semantic content from the document, leaving
   *     other semantic content in place.
   * - `set`: sets semantic content on the document, overriding
   *     existing semantic content.  This is less preferred as it may
   *     overwrite semantic content of other plugins.
   * - `before`: inserts the content explicitly before the selected
   *     entities.
   * - `after`: inserts the contents explicitly after the selected
   *     entities.
   * - `append`: appends the supplied content to the existing content
   *     inside of the selection.
   * - `prepend`: prepends the supplied content to the existing content
   *     inside of the selection.
   *
   * **Second level** describes what you want to manipulate.  This set
   * contains both semantic content as well as html content.
   * Currently in scope are:
   *
   * - `property`: Describing the relationship (as per html/RDFa
   *     `property` attribute).
   * - `typeof`: Describes the type of the contained element (as per
   *     html/RDFa `typeof` attribute).
   * - `dataType`: Describes the datatype of the supplied value (as
   *     per html/RDFa `dataType` attribute).
   * - `resource`: The resource to be considered (as per html/RDFa
   *     `resource` attribute).
   * - `about`: Like resource, creates a scope for the resource to be
   *     considered (as per html/RDFa `about` attribute).
   * - `content`: The content attribute to be considered (as per
   *     html/RDFa `content` attribute).
   * - `attribute`: TODO/FUTURE we intend to extend this for other
   *     attributes.
   * - `innerContent`: TODO/FUTURE set the inner content of the
   *     selected HTML tag.  Although a bare implementation exists, this
   *     should be extended in the future.
   * - `innerHTML`: Sets the innerHTML of the element.  Be wary of
   *     this option, it may override semantics inside of the node you
   *     are treating.  Always supply an `operation.desc` when using
   *     this as it may be hard to debug after the fact.
   * - `tag`: Indicates the HTML tag which should be used for
   *    `append`, `prepend`, `before` or `after` edits.  Value must be
   *     a string.
   *
   * **Third level** supplies content to be removed or content to be
   * set.  As such either a selection or a change can be made.
   * Selections are executed when removing content, new content works
   * for setting (`set`) or adding (`add`) content.  The third level
   * is the value of the property in the most deeply nested object.
   *
   * - `true`: A /selection/ which indicates all content.  Explicitly
   *    setting true will remove all content.
   * - `string`: A value of type string indicates a single value to be
   *    set/added/removed.  This is the most common case. If no value
   *    matches, nothing is removed.  For semantic content,
   *    translation is done based on the current context, eg: if there
   *    is a `foaf:name` in the document, then suppling the string
   *    `"http://xmlns.com/foaf/0.1/name"` will usually mean
   *    `foaf:name` is matched based on RDFa semantics and
   *    conventions.  This is the only option for the `tag` property.
   * - `[string]`: An array of stings indicates multiple specific
   *    values to be set/added/removed. Matching works the same way as
   *    string.
   * - `regex`: FUTURE A /selection/ which indicates anything matching this
   *    regular experession should be removed.
   * - `[regex]`: FUTURE A /selection/ which indicates anything matching any
   *    of these regular expressions should be removed.
   *
   * NOTE: the behaviour of `add` or `remove` could be different based
   * on which sort of thing you want to update.  Not all combinations
   * may be supported in case we cannot make sense of them (eg:
   * Removing `innerHTML` may be error-prone) and some may not be
   * supported yet.
   *
   * NOTE: The system is free to set or add properties based on a
   * short form (derived from the prefixes available in the context)
   * if it is possible and if it desires to do so.
   *
   * NOTE: newContext is set to undefined by default and behaves
   * similar to false.  This is because we assume that when you don't
   * care about the context there's a fair chance that we can merge
   * the contexts.  In specific cases you may desire to have things
   * merge (or not) explicitly.  You should set either true or false
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
   * @param {Selection} selection Region to operate on, as returned by
   *  the selectContext or selectHighlight methods.
   * @param {Object} operations The intended changes on the document.
   *  You can either add annotations, remove annotations or specificly
   *  set the annotations.  Most plugins use add/remove as that has
   *  less chance to conflict with unexpected situations.
   * @param {Object} [options.remove] Removes RDFa content that was
   *  already there.  Allows removing any of property, typeof,
   *  datatype, resource, content, (TODO: attribute), innerContent,
   *  innerHTML.
   * @param {Object} [options.add] Adds specific content to the
   *  selection, pushing nvalues on top of already existing values.
   *  Allows adding any of property, typeof, datatype, resource.  Set
   *  the forceNewContext property to true to force a new context if a
   *  full tag is selected.
   * @param {Object} [options.set] Allows setting any of property,
   *  typeof, datatype, resource content attribute innerContent
   *  innerHTML.  Set the newContext property to true to force a new
   *  context if a full tag is selected.
   * @param {String} [options.desc] You are encouraged to write a
   *  brief description of the desired manipulation here for debugging
   *  needs.
   * @example We can add a new type to a selection by running
   *
   *
   *      update( selection, { add: { typeof: "http://xmlns.com/foaf/0.1/Person" } } );
   *
   * This will add the type `foaf:Person` to the current set of types
   * regardless of whether or not there are other types on your
   * selection.
   */
  update(selection, operation) { return this._editor.update(selection, operation); }

  /**
   * Sets the carret position in the editor.
   *
   * @method setCurrentPosition
   * @param {number} position Absolute number indicating the position
   * to place the carret at.
   * @param {boolean} notify observers, default true
   * @public
   */
  setCurrentPosition(position) { this._editor.setCurrentPosition(position); }

  /**
   * Set the cursor position on the desired location.  This function
   * does its best to ensure the supplied position is a valid one to
   * navigate to, and positions the cursor at that spot.
   *
   * @method setCarret
   * @param {DOMNode} domNode A text node or dom element as the main
   * scope.
   * @param {number} offset Position relative to the supplied
   * `domNode`.  This behaves differently for text nodes versus other
   * DOM nodes.
   *
   *   - for a text node the relative offset within the text node
   *     (i.e. number of characters before the carret).
   *   - for a dom element the number of children before the carret.
   *
   * @return {DOMNode} currentNode of the editor after the operation.
   * TODO: is this return statement a public interface?  It feels like
   * plugins should not bother with this information.
   *
   * @example
   * - to set the carret after `"c"` in a textnode with text content
   *  `"abcd"` use `setCarret(textNode,3)`
   * - to set the carret after the end of a node with innerHTML
   *   `<b>foo</b><span>work</span>` use `setCarret(element, 2)` (e.g
   *   `setCarret(element, element.children.length)`)
   * - to set the carret after the `"b"` in a node with innerHTML
   *   `<b>foo</b><span>work</span>` use `setCarret(element, 1)` (e.g
   *   `setCarret(element, indexOfChild + 1)`)
   * - to set the carret after the start of a node with innerHTML
   *   `<b>foo</b><span>work</span>` use `setCarret(element, 0)`
   *
   * @public
   */
  setCarret(domNode, relativePostion) { this._editor.setCarret(domNode, relativePostion);}
}
