/**
 * Editor api for plugins.
 *
 * Plugins can manipulate the document and editor state.  Manipulation
 * happens through the methods offered in this interface.
 *
 * In order to manipulate the document, first a range is selected
 * (either based on its semantics, or based on its range)
 *
 * @module editor-interface
 * @class PluginEditorApi
 * @constructor
 */
export default class PluginEditorApi {
  constructor(editor, hintsRegistry, hrId) {
    this._editor = editor;
    this._hintsRegistry = hintsRegistry;
    this._hrId = hrId;
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
  selectHighlight(range, options) {
    const updatedLocation = this._hintsRegistry.updateLocationToCurrentIndex(this._hrId, range);
    return this._editor.selectHighlight(updatedLocation, options); }

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
  selectContext(region, options) {
    const updatedLocation = this._hintsRegistry.updateLocationToCurrentIndex(this._hrId, region);
    return this._editor.selectContext(updatedLocation, options); }

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
   * - `forceNewContext`: Indicate that a new wrapping or nested
   *     context should be created. Only available on `add`.
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
   * NOTE: forceNewContext is set to undefined by default.
   * This is because we assume that when you don't
   * care about the context there's a fair chance that we can merge
   * the contexts. In specific cases you may desire to have things
   * explicitly control where a new context is created.
   * In those cases you should set either 'WRAP' or 'NEST'.
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
   * @param {Object} operation The intended changes on the document.
   *  You can either add annotations, remove annotations or specificly
   *  set the annotations.  Most plugins use add/remove as that has
   *  less chance to conflict with unexpected situations.
   *
   * @param {String} [operation.desc] You are encouraged to write a
   *  brief description of the desired manipulation here for debugging
   *  needs.  Especially when using set and even more when setting
   *  html content, describe what the goal is so it can be made more
   *  descriptive when new APIs arrive.
   *
   * @param {Object} [operation.add] Adds specific content to the
   *  selection, pushing nvalues on top of already existing values.
   *  Allows adding any of property, typeof, datatype, resource.  Set
   *  the forceNewContext property to 'WRAP' or 'NEST' to force a
   *  new context if a full tag is selected.
   *
   * @param {String} [operation.add.forceNewContext] Set this to
   * 'WRAP' or 'NEST' to encourage creation of a new context.
   * If your selection already contains some semantic context,
   * a new context will be created.  Use this
   * if you know you are defining a new entity.
   *
   * @param {string|Array} [operation.add.about] Adds one or more
   * resources to the RDFa `about` property of the selection.
   * @param {string} [operation.add.about] Adds a value to the RDFa
   * `about` property of the selection.  This may be merged with
   * already existing values for the `about` property if that is your
   * selection.  Use a full URI rather than a prefixed URI, future
   * versions of this function may auto-shorten for you based on the
   * available prefixes in the document.
   * @param {Array} [operation.add.about] An array of strings
   * indicates each of these strings should be added to the `about`
   * property of the selection.  See documentation for supplying a
   * single string for more details.
   *
   * @param {string|Array} [operation.add.resource] Adds one or more
   * resources to the RDFa `resource` property of the selection.
   * @param {string} [operation.add.resource] Adds a value to the
   * RDFa `resource` property of the selection.  This may be merged
   * with already existing values for the `resource` property if that
   * is your selection.  Use a full URI rather than a prefixed URI,
   * future versions of this function may auto-shorten for you based on the
   * available prefixes in the document.
   * @param {Array} [operation.add.resource] An array of strings
   * indicates each of these strings should be added to the `resource`
   * property of the selection.  See documentation for supplying a
   * single string for more details.
   *
   * @param {string|Array} [operation.add.dataType] Adds one or more
   * resources to the RDFa `dataType` property of the selection.
   * @param {string} [operation.add.dataType] Adds a value to the
   * RDFa `dataType` property of the selection.  This may be merged
   * with already existing values for the `dataType` property if that
   * is your selection.  Use a full URI rather than a prefixed URI,
   * future versions of this function may auto-shorten for you based on the
   * available prefixes in the document.
   * @param {Array} [operation.add.dataType] An array of strings
   * indicates each of these strings should be added to the `dataType`
   * property of the selection.  See documentation for supplying a
   * single string for more details.
   *
   * @param {string|Array} [operation.add.typeof] Adds one or more
   * resources to the RDFa `typeof` property of the selection.
   * @param {string} [operation.add.typeof] Adds a value to the RDFa
   * `typeof` property of the selection.  This may be merged with
   * already existing values for the `typeof` property if that is your
   * selection.  Use a full URI rather than a prefixed URI, future
   * versions of this function may auto-shorten for you based on the
   * available prefixes in the document.
   * @param {Array} [operation.add.typeof] An array of strings
   * indicates each of these strings should be added to the `typeof`
   * property of the selection.  See documentation for supplying a
   * single string for more details.
   *
   * @param {string|Array} [operation.add.property] Adds one or more
   * resources to the RDFa `property` property of the selection.
   * @param {string} [operation.add.property] Adds a value to the
   * RDFa `property` property of the selection.  This may be merged
   * with already existing values for the `property` property if that
   * is your selection.  Use a full URI rather than a prefixed URI,
   * future versions of this function may auto-shorten for you based on the
   * available prefixes in the document.
   * @param {Array} [operation.add.property] An array of strings
   * indicates each of these strings should be added to the `property`
   * property of the selection.  See documentation for supplying a
   * single string for more details.
   *
   * @param {string|Array} [operation.add.content]
   * @param {string} [operation.add.content] Sets the
   * `content` property of the selection to the current value plus the provided string
   * @param {Array} [operation.add.content] An array of strings
   * indicates each of these strings should be added to the `content`
   * property of the selection.  Works similar to a single string.
   * @param {string} [operation.add.innerHTML]  **NOT SUPPORTED**
   * @param {string} [operation.add.innerContent] FUTURE
   * @param {string|Array} [operation.add.attribute] FUTURE
   * @param {string} [operation.add.tag] **NOT SUPPORTED**
   *
   *
   * @param {Object} [operation.remove] Removes RDFa content that was
   *  already there.  Allows removing any of property, typeof,
   *  datatype, resource, content, (TODO: attribute), innerContent,
   *  innerHTML.
   *
   * @param {string|boolean|Array} [operation.remove.about] Removes
   * information from the selected entity's RDFa about.  Further
   * detail below.
   * @param {string} [operation.remove.about] Supplying a string
   *  requests removal of a single about value.  Use a full URL, not a
   *  prefixed string, as prefixes will be expanded in the RDFa
   *  document for matching purposes.
   * @param {Array} [operation.remove.about] Supplying an arrays of
   *  strings requests the removal of any matching URLs from the
   *  `about` property.  Use full URLs, not a prefixed string, as
   *  prefixes will be expanded in the RDFa document for matching
   *  purposes.
   * @param {boolean} [operation.remove.about] The `true` boolean
   *  removes any available value.  Note that this may remove more than
   *  intended in cases you did not foresee.
   *
   * @param {string|boolean|Array} [operation.remove.resource]
   * Removes information from the selected entity's RDFa resource.
   * Further detail below.
   * @param {string} [operation.remove.resource] Supplying a string
   *  requests removal of a single resource value.  Use a full URL, not a
   *  prefixed string, as prefixes will be expanded in the RDFa
   *  document for matching purposes.
   * @param {Array} [operation.remove.resource] Supplying an arrays of
   *  strings requests the removal of any matching URLs from the
   *  `resource` property.  Use full URLs, not a prefixed string, as
   *  prefixes will be expanded in the RDFa document for matching
   *  purposes.
   * @param {boolean} [operation.remove.resource] The `true` boolean
   *  removes any available value.  Note that this may remove more than
   *  intended in cases you did not foresee.
   *
   * @param {string|boolean|Array} [operation.remove.dataType] Removes
   * information from the selected entity's RDFa dataType.  Further
   * detail below.
   * @param {string} [operation.remove.dataType] Supplying a string
   *  requests removal of a single dataType value.  Use a full URL, not a
   *  prefixed string, as prefixes will be expanded in the RDFa
   *  document for matching purposes.
   * @param {Array} [operation.remove.dataType] Supplying an arrays of
   *  strings requests the removal of any matching URLs from the
   *  `dataType` property.  Use full URLs, not a prefixed string, as
   *  prefixes will be expanded in the RDFa document for matching
   *  purposes.
   * @param {boolean} [operation.remove.dataType] The `true` boolean
   *  removes any available value.  Note that this may remove more than
   *  intended in cases you did not foresee.
   *
   * @param {string|boolean|Array} [operation.remove.typeof] Removes
   * information from the selected entity's RDFa typeof.  Further
   * detail below.
   * @param {string} [operation.remove.typeof] Supplying a string
   *  requests removal of a single typeof value.  Use a full URL, not a
   *  prefixed string, as prefixes will be expanded in the RDFa
   *  document for matching purposes.
   * @param {Array} [operation.remove.typeof] Supplying an arrays of
   *  strings requests the removal of any matching URLs from the
   *  `typeof` property.  Use full URLs, not a prefixed string, as
   *  prefixes will be expanded in the RDFa document for matching
   *  purposes.
   * @param {boolean} [operation.remove.typeof] The `true` boolean
   *  removes any available value.  Note that this may remove more than
   *  intended in cases you did not foresee.
   *
   * @param {string|boolean|Array} [operation.remove.property] Removes
   * information from the selected entity's RDFa property.  Further
   * detail below.
   * @param {string} [operation.remove.property] Supplying a string
   *  requests removal of a single property value.  Use a full URL, not a
   *  prefixed string, as prefixes will be expanded in the RDFa
   *  document for matching purposes.
   * @param {Array} [operation.remove.property] Supplying an array of
   *  strings requests the removal of any matching URLs from the
   *  `property` property.  Use full URLs, not a prefixed string, as
   *  prefixes will be expanded in the RDFa document for matching
   *  purposes.
   * @param {boolean} [operation.remove.property] The `true` boolean
   *  removes any available value.  Note that this may remove more than
   *  intended in cases you did not foresee.
   * @param {string|boolean} [operation.remove.content] Removes
   * information from the selected entity's `content` property.
   * @param {string} [operation.remove.content] Supplying a string requests
   * removal of a single content value.
   * NOTE: This may behave oddly if content has spaces
   * @param {boolean} [operation.remove.content] Set to `true` removes
   * the content attribute from the selection.
   * NOTE: This may behave oddly if content has spaces
   * NOTE: This may behave oddly if content has spaces
   * @param {string|Regex|boolean} [operation.remove.tag] **NOT SUPPORTED**
   * @param {string|Regex|boolean} [operation.remove.innerHTML] **NOT SUPPORTED**
   * @param {string|Regex|boolean} [operation.remove.innerContent] **NOT SUPPORTED**
   * @param {string|Regex|boolean} [operation.remove.attribute] **FUTURE**
   *
   *
   * @param {Object} [operation.set] Allows setting any of property,
   *  typeof, datatype, resource content attribute innerContent
   *  innerHTML.
   *
   * @param {string|Array} [operation.set.resource] Overwrites the
   * RDFa `resource` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.resource] Overwrites the
   * `resource` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.resource] An array of strings
   * indicates each of these strings should be set as the `resource`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   *
   * @param {string|Array} [operation.set.property] Overwrites the
   * RDFa `property` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.property] Overwrites the
   * `property` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.property] An array of strings
   * indicates each of these strings should be set as the `property`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   *
   * @param {string|Array} [operation.set.typeof] Overwrites the
   * RDFa `typeof` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.typeof] Overwrites the
   * `typeof` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.typeof] An array of strings
   * indicates each of these strings should be set as the `typeof`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   *
   * @param {string|Array} [operation.set.about] Overwrites the
   * RDFa `about` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.about] Overwrites the
   * `about` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.about] An array of strings
   * indicates each of these strings should be set as the `about`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   *
   * @param {string|Array} [operation.set.content] Overwrites the
   * RDFa `content` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.content] Overwrites the
   * `content` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.content] An array of strings
   * indicates each of these strings should be set as the `content`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   *
   * @param {string|Array} [operation.set.dataType] Overwrites the
   * RDFa `dataType` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.dataType] Overwrites the
   * `dataType` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.dataType] An array of strings
   * indicates each of these strings should be set as the `dataType`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   *
   * @param {string|Array} [operation.set.innerHTML] Overwrites the
   * RDFa `innerHTML` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.innerHTML] Overwrites the
   * `innerHTML` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.innerHTML] An array of strings
   * indicates each of these strings should be set as the `innerHTML`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   *
   * @param {string|Array} [operation.set.innerContent] Overwrites the
   * RDFa `innerContent` property values of the selection with the
   * supplied content.
   * @param {string} [operation.set.innerContent] Overwrites the
   * `innerContent` property with this single value.  Use a full URI
   * rather than a prefixed URI, future versions of this function may
   * auto-shorten for you based on the available prefixes in the
   * document.
   * @param {Array} [operation.set.innerContent] An array of strings
   * indicates each of these strings should be set as the `innerContent`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   * @param {string|Array} [operation.set.attribute] **FUTURE**
   *
   * @param {Object} [operation.append] Appends new content, scoped
   * inside of the selection.  If you have selected a context, you can
   * append contents inside of the selection.
   *
   * @param {string} [operation.append.tag] The tag to be used for the
   * new element.  This should be a string of the name of the tag.
   * @param {string} [operation.append.innerHTML] Html content to
   * insert into the new tag.  This can be a string.
   * @param {string|Array} [operation.append.about] The about property
   * to set on the new context.
   * @param {string} [operation.append.about] URI of the `about`
   * property for the new context.  You should use a full URI as
   * prefixes may not be constant acros documents.  Future versions of
   * this API may use the existing prefixes to shorten the supplied
   * URI.
   * @param {Array} [operation.append.about] Array of strings for the `about` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.append.resource]
   * @param {string} [operation.append.resource] URI of the `resource` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.append.resource] Array of strings for the `resource` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.append.dataType]
   * @param {string} [operation.append.dataType] URI of the `dataType` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.append.dataType] Array of strings for the `dataType` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.append.typeof]
   * @param {string} [operation.append.typeof] URI of the `typeof` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.append.typeof] Array of strings for the `typeof` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.append.property]
   * @param {string} [operation.append.property] URI of the `property` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.append.property] Array of strings for the `property` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.append.content]
   * @param {string} [operation.append.content] Set the
   * `content` property of the appended element with this single value.
   * @param {Array} [operation.append.content] An array of strings
   * indicates each of these strings should be set as the `content`
   * property of the appended element.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   * @param {string|Array} [operation.append.innerContent] *NOT SUPPORTED*
   * @param {string|Array} [operation.append.attribute] *NOT SUPPORTED*
   *
   * @param {Object} [operation.prepend] Prepends new content, scoped
   * inside of the selection.  If you have selected a context, you can
   * prepend contents inside of the selection.
   *
   * @param {string|Array} [operation.prepend.tag] The tag to be used
   * for the new element.  This should be a string of the name of the
   * tag.
   * @param {string} [operation.prepend.innerHTML] Html content to
   * insert into the new tag.  This can be a string.
   * @param {Array} [operation.append.about] Array of strings for the `about` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.prepend.resource]
   * @param {string} [operation.prepend.resource] URI of the `resource` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.prepend.resource] Array of strings for the `resource` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.prepend.dataType]
   * @param {string} [operation.prepend.dataType] URI of the `dataType` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.prepend.dataType] Array of strings for the `dataType` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.prepend.typeof]
   * @param {string} [operation.prepend.typeof] URI of the `typeof` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.prepend.typeof] Array of strings for the `typeof` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.prepend.property]
   * @param {string} [operation.prepend.property] URI of the `property` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.prepend.property] Array of strings for the `property` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.prepend.content]
   * @param {string} [operation.prepend.content] Sets the
   * `content` property of the prepended element with this single value.
   * @param {Array} [operation.prepend.content] An array of strings
   * indicates each of these strings should be set as the `content`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   * @param {string|Array} [operation.prepend.innerContent] *NOT SUPPORTED*
   * @param {string|Array} [operation.prepend.attribute] *NOT SUPPORTED*
   *
   * @param {Object} [operation.after] Insert content after the
   * selected content in the DOM tree.  If you have selected a
   * context, a new context will be created after the selected
   * context.
   * @param {string|Array} [operation.after.tag] The tag to be used
   * for the new element.  This should be a string of the name of the
   * tag.
   * @param {string} [operation.after.innerHTML] Html content to
   * insert into the new tag.  This can be a string.
   * @param {string|Array} [operation.after.about] The about property
   * to set on the new context.
   * @param {Array} [operation.after.about] Array of strings for the `about` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.after.resource]
   * @param {string} [operation.after.resource] URI of the `resource` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.after.resource] Array of strings for the `resource` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.after.dataType]
   * @param {string} [operation.after.dataType] URI of the `dataType` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.after.dataType] Array of strings for the `dataType` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.after.typeof]
   * @param {string} [operation.after.typeof] URI of the `typeof` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.after.typeof] Array of strings for the `typeof` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.after.property]
   * @param {string} [operation.after.property] URI of the `property` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.after.property] Array of strings for the `property` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.after.content]
   * @param {string} [operation.after.content] Sets the
   * `content` property of the new element created after the selection with this single value.
   * @param {Array} [operation.after.content] An array of strings
   * indicates each of these strings should be set as the `content`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   * @param {string|Array} [operation.after.innerContent] *NOT SUPPORTED*
   * @param {string|Array} [operation.after.attribute] *NOT SUPPORTED*
   *
   *
   * @param {Object} [operation.before] Insert content before the
   * selected content in the DOM tree.  If you have selected a
   * context, a new context will be created before the selected
   * context.
   * @param {string|Array} [operation.before.tag] The tag to be used
   * for the new element.  This should be a string of the name of the
   * tag.
   * @param {string} [operation.before.innerHTML] Html content to
   * insert into the new tag.  This can be a string.
   * @param {Array} [operation.before.about] Array of strings for the `about` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.before.resource]
   * @param {string} [operation.before.resource] URI of the `resource` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.before.resource] Array of strings for the `resource` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.before.dataType]
   * @param {string} [operation.before.dataType] URI of the `dataType` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.before.dataType] Array of strings for the `dataType` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.before.typeof]
   * @param {string} [operation.before.typeof] URI of the `typeof` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.before.typeof] Array of strings for the `typeof` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.before.property]
   * @param {string} [operation.before.property] URI of the `property` property for the new context.  You should use a full URI as prefixes may not be constant acros documents.  Future versions of this API may use the existing prefixes to shorten the supplied URI.
   * @param {Array} [operation.before.property] Array of strings for the `property` property.  All of these will be set.  Refer to the `string` case for further information.
   * @param {string|Array} [operation.before.contentt]
   * @param {string} [operation.before.content] Sets the
   * `content` property of the element created before the selection with this single value.
   * @param {Array} [operation.before.content] An array of strings
   * indicates each of these strings should be set as the `content`
   * property of the selection.  Works similar to a single string, but
   * overwrites the value with the set of values supplied here.
   * @param {string|Array} [operation.before.innerContent] *NOT SUPPORTED*
   * @param {string|Array} [operation.before.attribute] *NOT SUPPORTED*
   *
   *
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
