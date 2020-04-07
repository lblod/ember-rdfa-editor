/**
 * HintsRegistry api for plugins.
 *
 * The hintsregistry does bookkeeping of editor hints.
 * Plugins can create new hints or remove existing ones.
 *
 * @module editor-interface
 * @class PluginHintsRegistryApi
 * @constructor
 */
export default class PluginHintsRegistryApi {
  constructor(hintsRegistry, hrId) {
    this._hintsRegistry = hintsRegistry;
    this._hrId = hrId;
  }

  /**
   * Generic interface for removing hints
   *
   * @method removeHints
   *
   * @param {Object} options Indicates which hints should be removed
   * @param {String} options.scope Scope for which the hints should be
   * removed.  This is most often the name of the plugin.
   * @param {Array} [options.region] If region is supplied, the hints
   * in the supplied region will be removed.  A region is an array
   * containing a start and an end.
   * @param {Array} [options.rdfaBlocks] If an array of rdfaBlocks is
   * supplied, hinst will be removed for each of the rdfaBlocks.
   *
   * @public
   */
  removeHints( options ) {
    options.hrId = this._hrId;
    this._hintsRegistry.removeHints(options);
  }

  /**
   * Adds an individual hint to the HintsRegistry.
   *
   * @method addHint
   *
   * @param {string} who Unique id of the plugin for which to
   * interact.  This ID is a scope for adding and removing hints so a
   * plugin doesn't accidentally override another plugin's cards.  A
   * common unique ID to use is the name of the plugin card (see
   * `card.card`) or the name of the service.
   *
   * Eg: `editor-plugins/dbpedia-info-plugin`
   *
   * @param {Object} card Hint card to add
   * @param {String} card.card Name of the component to render.  This
   * is commonly the path to your ember component in the
   * source-tree.
   *
   * Eg: `editor-plugins/dbpedia-info-card`.
   *
   * @param {Array} card.location Array indicating the start and end
   * index of the highlight in the document.
   *
   * Eg: `[4,52]`
   *
   * @param {Object} [card.options] Extra settings for the card to insert.
   *
   * @param {Boolean} [card.options.noHighlight] When truethy, the
   * card will be available when the user's cursor visits the
   * location, but the card will not be highlighted.
   *
   * Eg: A date update card does not require immediate user action and
   * so should not be highlighted, but when the cursor is inside the
   * date we do want to show a date update card.
   *
   * @param {Object} card.info Information object supplied to the
   * component in the `@info` argument when rendering the hint card.
   * Anything your component needs should be supplied through this
   * info object.
   *
   * Eg: For plugins which manipulate the document you'll want to pass
   * the hrIdx, editor interface and hintsRegistry plus maybe some
   * other information detected earlier such as a matched term.
   */
  addHint(who, card) {
    this._hintsRegistry.addHint(this._hrId, who, card);
  }
  /**
   * Adds collection of hints.
   *
   * @method addHints
   *
   * @param {string} who Name of the plugin
   * @param {Array} Array Hints to add.  See {{#crossLink "HintsRegistry/addHint:method"}}{{/crossLink}}
   *
   * @public
   */
  addHints(who, cards) {
    this._hintsRegistry.addHints(this._hrId, who, cards);
  }

}
