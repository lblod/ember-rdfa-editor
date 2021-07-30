import { set } from '@ember/object';
import { A } from '@ember/array';
import { next } from '@ember/runloop';
import { task, timeout } from 'ember-concurrency';
import { reorderBlocks, getExtendedRegions } from './rdfa-block-helpers';
import { tracked } from '@glimmer/tracking';

/**
* Bookkeeping of the editor hints
*
* @module rdfa-editor
* @class HintsRegistry
* @constructor
* @extends EmberObject
*/
export default class HinstRegistry {
  /**
  * @property index
  * @type Array
  */
  index;

  /**
  * @property registry
  * @type Array
  */
  @tracked registry;

  /**
  * @property activeRegion
  * @type Array
  */
  @tracked activeRegion;

  /**
  * @property activeHints
  * @type Array
  */
  get activeHints() {
    const region = this.activeRegion;
    return this.registry.filter((hint) => {
      return region[0] >= hint.location[0] && region[1] <= hint.location[1];
    });
  }

  /**
   * @property registryObservers
   * @type Array
   * @private
   */
  registryObservers;
  removedCardObservers;
  newCardObservers;
  registryObservers;
  highlightsForFutureRemoval;
  highlightsForFutureInsert;

  constructor(rawEditor){
    this.index = [];
    this.registry = [];
    this.activeRegion = [];
    this.registryObservers = [];
    this.newCardObservers = [];
    this.removedCardObservers = [];
    this.highlightsForFutureRemoval = [];
    this.highlightsForFutureInsert = [];
    this.rawEditor = rawEditor;
  }

  /**
   *
   * adds a registry observer callback
   *
   * @method addRegistryObserver
   *
   * @param {Function} callback to be executed when the registry is updated. Will receive the complete registry as a parameter.
   *
   * @public
   */
  addRegistryObserver(observer) {
    this.registryObservers.push(observer);
  }

  addNewCardObserver(observer) {
    this.newCardObservers.push(observer);
  }

  addRemovedCardObserver(observer) {
    this.removedCardObservers.push(observer);
  }

  /**
   * Handles an insert text event from the editor.
   * Returns the associated registry index.
   *
   * @method insertText
   *
   * @param {number} start Start index in de string array
   * @param {string} content Content of the insertion
   *
   * @return {Object} Index object of the registry.
   *                 Consists of:
   *                 - idx: id of the index object
   *                 - operation:  'remove' || 'insert'
   *                 - delta: delta length of insertion || removal
   *                 - startIdx: start index string array
   *                 - endIdx: end index string array
   * @public
   */
  insertText(startIdx, content) {
    let index = this.initIndexEntry('insert', startIdx, startIdx + content.length, content.length);
    this.updateRegistry(index);
    this.appendToIndex(index);
    return index;
  }

  /**
   * Handles removal text event from the editor.
   * Returns the associated registry index.
   *
   * @method removeText
   *
   * @param {number} start Start index of the removed string array
   * @param {number} end End index of the removed string array
   *
   * @return {Object} Index object of the registry.
   *                 Consists of:
   *                 - idx: id of the index object
   *                 - operation:  'remove' || 'insert'
   *                 - delta: delta length of insertion || removal
   *                 - startIdx: start index string array
   *                 - endIdx: end index string array
   *
   * @public
   */
  removeText(startIdx, endIdx) {
    let delta = -1 * Math.abs(endIdx - startIdx);
    let index = this.initIndexEntry('remove', startIdx, endIdx, delta);
    this.updateRegistry(index);
    this.appendToIndex(index);
    return index;
  }

  /**
   * Returns hints exactly at a provided location.
   *
   * @method getHintsAtLocation
   *
   * @param {[number, number]} location [start, end] of the location
   * @param {Object} [hrIdx] Index of the registry else registry at current index is provided
   * @param {string} [who] Name of the plugin to filter on
   *
   * @return {Array} Array of hints
   *
   * @public
   */
  getHintsAtLocation(location, hrIdx, who) {
    let updatedLocation = (hrIdx ? this.updateLocationToCurrentIndex(hrIdx, location) : location);

    const atLocation = (location, other) => {
      return location.toString() === other.toString();
    };

    let condition = null;
    if (who) {
      condition = (entry) => { return atLocation(entry.location, updatedLocation) && entry.who == who; };
    } else {
      condition = (entry) => { return atLocation(entry.location, updatedLocation); };
    }

    return this.registry.filter(condition);
  }

  /**
   * Returns hints in a provided region.
   *
   * @method getHintsInRegion
   *
   * @param {Array} region [start, end]
   * @param {Object} [hrIdx] Index of the registry else registry at current index is provided
   * @param {string} [who] Name of the plugin to filter on
   *
   * @return {Array} Array of hints
   *
   * @public
   */
  getHintsInRegion(region, hrIdx, who) {
    let updatedRegion = (hrIdx ? this.updateLocationToCurrentIndex(hrIdx, region) : region);

    const inRegion = (location, region) => {
      return region[0] <= location[0] && region[1] >= location[1];
    };

    let condition = null;
    if (who) {
      condition = (entry) => { return inRegion(entry.location, updatedRegion) && entry.who == who; };
    } else {
      condition = (entry) => { return inRegion(entry.location, updatedRegion); };
    }

    return this.registry.filter(condition);
  }

  /**
   * Returns hints from plugin
   *
   * @method getHintsFromPlugin
   *
   * @return {Array} Array of hints
   *
   * @public
   */
  getHintsFromPlugin(who) {
    return this.registry.filter( entry => entry.who == who );
  }

  /**
   * Removes hints at an exact location.
   *
   * @method removeHintsAtLocation
   *
   * @param {Array} location [start, end]
   * @param {Object} [hrIdx] Index of the registry else registry at current index is provided
   * @param {string} [who] Name of the plugin to filter on
   *
   * @public
   */
  removeHintsAtLocation(location, hrIdx, who) {
    let updatedLocation = (hrIdx ? this.updateLocationToCurrentIndex(hrIdx, location) : location);

    const notAtLocation = (location, other) => {
      return location.toString() != other.toString();
    };

    let condition = null;
    if (who) {
      condition = (entry) => { return (notAtLocation(entry.location, updatedLocation) && entry.who == who) || entry.who !== who; };
    } else {
      condition = (entry) => { return notAtLocation(entry.location, updatedLocation); };
    }

    let updatedRegistry = [];
    for (let entry of this.registry) {
      if (condition(entry)) {
        updatedRegistry.push(entry);
      }
      else {
        // TODO: why only location?
        this.sendRemovedCardToObservers(entry.location);
      }
    }
    if (updatedRegistry.length !== this.registry.length) {
      this.replaceRegistryAndNotify(updatedRegistry);
    }
  }

  /**
   * Removes hints in a region.
   *
   * @method removeHintsInRegion
   *
   * @param {Array} region [start, end]
   * @param {Object} [hrIdx] Index of the registry else registry at current index is provided
   * @param {string} [who] Name of the plugin to filter on
   *
   * @public
   */
  removeHintsInRegion(region, hrIdx, who) {
    // Clone region in case it gets manipulated elsewhere
    region = [...region];

    let updatedRegion = hrIdx ? this.updateLocationToCurrentIndex(hrIdx, region) : region;

    const inRegion = (location, region) => {
      // return true iff location is fully in region
      return location[0] >= region[0] && location[1] <= region[1];
    };

    let updatedRegistry = [];

    for( const hint of this.registry ) {
      const ourScope = hint.who == who;
      const matchingRegion = inRegion( hint.location, updatedRegion );


      if( ourScope && matchingRegion )
        this.highlightsForFutureRemoval.push({location: hint.location, hrIdx});
      else
        updatedRegistry.push(hint);
    }

    this.registry = updatedRegistry;

    next(() => { this.batchProcessHighlightsUpdates.perform(); });
  }

  /**
   * Generic interface for removing hints
   *
   * @method removeHints
   *
   * @param {Object} options Indicates which hints should be removed
   * @param {Object} options.hrId Index of the HintsRegistry relative
   * to which the hints should be removed.
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
    const { hrId, scope } = options;

    if( ! options.rdfaBlocks && ! options.region ){
      console.warn( "HinstRegistry#removeHints was called without rdfaBlocks or location, no hints will be removed." );  // eslint-disable-line no-console
    }

    if( options.rdfaBlocks ) {
      this.removeHintsInRdfaBlocks( options.rdfaBlocks, hrId, scope );
    }

    if( options.region ) {
      this.removeHintsInRegion( options.region, hrId, scope );
    }
  }

  /**
   * Removes hints which occur in a set of rdfaBlocks.
   *
   * This is a helper method which makes functional plugins a lot
   * easier to write.  These plugins remove all hints as a starting
   * point, calculate where the hints should be, and supply all of the
   * new hints to the HinstRegistry.  In case there are no performance
   * issues to recalculate the hints, this approach is easy to
   * understand.  This particular call cleans up such plugins.
   *
   * @method removeHintsInRdfaBlocks
   *
   * @param {Array} rdfaBlocks Objects for which the region is in the
   * `region` property.
   * @param {Object} [hrIdx] Index of the registry else registry at
   * current index is provided
   * @param {string} [identifier] Name of the plugin to filter on
   *
   * @public
   */
  removeHintsInRdfaBlocks(rdfaBlocks, hrId, identifier) {
    if (rdfaBlocks.length > 0) {
      const orderedBlocks = reorderBlocks(rdfaBlocks);
      const regions = getExtendedRegions(orderedBlocks.map(region => [region.start, region.end]));

      regions.forEach(region => {
        this.removeHintsInRegion(region , hrId, identifier);
      });
    }
    rdfaBlocks.forEach( (block) => {
      this.removeHintsInRegion( block.region, hrId, identifier );
    });
  }

  /**
   * This function executes multiple hints updates as a batch.
   * WHY
   * ---
   * a. decrease the amount of dead DOMNodes when updating highlights
   * b. potential performance gain.
   *
   * WARNING
   * -------
   * Experimental, so probably will change
   */
  @task({ restartable: true })
  *batchProcessHighlightsUpdates() {
    yield timeout(50);

    // The hints registry might not be updated by the editor yet,
    // so wait for the editor to inform hintsregistry of the updates on the underlying DOM, so the hint registry
    // has a correct index to work on.
    // If busy, move this operation to the next runloop
    if(this.rawEditor.generateDiffEvents.isRunning){
      next(() => { this.batchProcessHighlightsUpdates.perform(); });
      return;
    }

    let updatedHlToRemove = this.highlightsForFutureRemoval.map( entry => {
      return this.updateLocationToCurrentIndex(entry.hrIdx, entry.location);
    });

    this.highlightsForFutureRemoval = [];

    let updatedHlToInsert = this.highlightsForFutureInsert.map( entry => {
      return this.updateLocationToCurrentIndex(entry.hrIdx, entry.location);
    });

    this.highlightsForFutureInsert = [];

    let hasSameLocation = (loc1, loc2) =>  loc1[0] == loc2[0] && loc1[1] == loc2[1];

    let realRemoves = updatedHlToRemove.filter(rH => !this.registry.find(c => hasSameLocation(c.location, rH)));

    //remove duplicates
    let realInserts = updatedHlToInsert.reduce((acc, card) => {
      if(!acc.find(accCardSoFar => hasSameLocation(accCardSoFar, card)))
        acc.push(card);
      return acc;
    }, []);

    //remove obsolete highlights
    realInserts = realInserts.filter(rI=> this.registry.find(c => hasSameLocation(c.location, rI)));

    if(realInserts.length == 0 && realRemoves.length == 0){
      return;
    }

    realRemoves.forEach(this.sendRemovedCardToObservers.bind(this));
    realInserts.forEach(this.sendNewCardToObservers.bind(this));

    this.replaceRegistryAndNotify(this.registry);
  }


  /**
   * Adds an individual hint to the HintsRegistry.
   *
   * @method addHint
   *
   * @param {Object} hrIdx Index representing the state of the
   * registry on which you want to act.  This allows the hintsRegistry
   * to update your request with respect to user-interaction which
   * occurred in the meantime.
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
  addHint(hrIdx, who, card) {
    this._addHint( hrIdx, who, card );
    next(() => { this.batchProcessHighlightsUpdates.perform(); });
  }

  /**
   * Adds a card without triggering a highlights update
   *
   * @method _addHint
   * @private
   */
  _addHint(hrIdx, who, card) {
    card.who = who;
    // clone location to ensure no external edits happen
    card.location = [...card.location];
    this.updateCardToCurrentIndex(hrIdx, card);
    if( !card.options || !card.options.noHighlight)
      this.highlightsForFutureInsert.push({location: card.location, hrIdx});
  }

  /**
   * Adds collection of hints.
   *
   * @method addHints
   *
   * @param {Object} hrIdx Index of the registry
   * @param {string} who Name of the plugin
   * @param {Array} Array Hints to add.  See {{#crossLink "HintsRegistry/addHint:method"}}{{/crossLink}}
   *
   * @public
   */
  addHints(hrIdx, who, cards) {
    cards.forEach( (card) => this._addHint( hrIdx, who, card ) );
    next(() => { this.batchProcessHighlightsUpdates.perform(); });
  }

  /**
   * Provided a location and hrId, give back the current location for the actual state of the registry.
   *
   * @method updateLocationToCurrentIndex
   *
   * @param {Object} hrIdx Index of the registry
   * @param {[number, number]} location [start, end]
   *
   * @return {[number, number]} mapped location [start, end]
   * @public
   */
  updateLocationToCurrentIndex(indexEntry, location) {
    let remainingIndexes = this.getRemainingIndexes(indexEntry);
    return remainingIndexes.length === 0 ? location : remainingIndexes.reduce(this.updateLocationWithIndex.bind(this), location);
  }

  /**
   * Gets next index id.
   *
   * @method nextIndexId
   *
   * @return {number} The next index id
   *
   * @private
   */
  nextIndexId() {
    if(this.index.length == 0) {
      return 0;
    }
    return this.currentIndex().idx + 1;
  }

  /**
   * Gets current index.
   *
   * @method currentIndex
   *
   * @return {Object} The current index
   */
  currentIndex() {
    return this.index.slice(-1)[0];
  }

  /**
   * Inits index entry object.
   *
   * @method initIndexEntry
   *
   * @return {Object} Index entry
   *
   * @private
   */
  initIndexEntry(operation, startIdx, endIdx, delta) {
    let idx = this.nextIndexId();
    return {idx: idx, operation, startIdx, endIdx, delta};
  }

  /**
   * Appends index entry to index.
   *
   * @method appendToIndex
   *
   * @private
   */
  appendToIndex(indexEntry) {
    this.index.push(indexEntry);
  }

  /**
   * Updates collection of cards with collection of index entries.
   * TODO: clean up
   *
   * @method applyIndexesToCards
   *
   * @private
   */
  applyIndexesToCards(indexes, cards) {
    let updatedCards = [];
    let hasChanged = false;

    for(let card of cards) {
      let cardData = this.applyIndexesToCard(indexes, card);
      hasChanged = cardData.hasChanged;
      if(cardData.isValid) {
        updatedCards.push(cardData.card);
      }
    }
    return {hasChanged, cards: updatedCards};
  }

  /**
   * Updates card with collection of indexes
   * TODO: clean up
   *
   * @method applyIndexesToCard
   *
   * @param {Array} indexes
   * @param {Object} card
   *
   * @return {Object}
   *
   * @private
   */
  applyIndexesToCard(indexes, card) {
    let hasChanged = false;
    let isValid = true;

    for(let index of indexes) {
      if(!this.doesLocationChange(index, card.location)) {
          continue;
      }

      set( card, 'location', this.updateLocationWithIndex(card.location, index));
      hasChanged = true;

      if(!this.isLocationValid(card.location)) {
        isValid = false;
        break;
      }
    }
    return {hasChanged, isValid, card};
  }


  /**
   * Updates card registry with provided index entry.
   *
   * @method updateRegistry
   *
   * @param {Object} indexEntry
   *
   * @private
   */
  updateRegistry(indexEntry) {
    let updatedRegistry = this.applyIndexesToCards([indexEntry], this.registry);
    if(updatedRegistry.hasChanged) {
      this.replaceRegistryAndNotify(A(updatedRegistry.cards));
    }
  }

  /**
   * Checks whether a location is valid.
   *
   * @method isLocationValid
   *
   * @param {[number, number]} location
   *
   * @return {boolean} Whether the location is valid
   *
   * @private
   */
  isLocationValid(location) {
    if(location[1] - 1 < location[0]) {  //TODO: do we allow 'pure' insert?
      return false;
    }
    return true;
  }

  /**
   * Given an index entry, check whether it affects location of the supplied index.
   *
   * Any change that happens fully behind our index has no impact on us.
   *
   * @method doesLocationChange
   *
   * @param {Object} index
   * @param {[number, number]} location
   *
   * @return {boolean} Whether the location is affected by the given index entry
   *
   * @private
   */
  doesLocationChange(index, location) {
    if(index.startIdx <= location[1] - 1) {
      return true;
    }
    return false;
  }

  /**
   * Given an index entry, check wether the location moves as block to left or right.
   *
   * This means the change happened fully before the supplied
   * location, and thus the location cannot grow or shrink but must
   * move.
   *
   * @method doesLocationShiftsAsBlock
   *
   * @param {Object} index
   * @param {[number, number]} location
   *
   * @return {boolean} Whether the location shifts as block
   *
   * @private
   */
  doesLocationShiftsAsBlock(index, location) {
    if((location[0] - location[1] - 1) === 0) {
      // Nothing moved in this index entry
      return false;
    }
    else if(index.operation === 'insert' && (index.startIdx < location[0])) {
      // Insert happened strictly before our location (we want regions to grow)
      return true;
    }
    else if(index.operation === 'remove' && (index.endIdx - 1 < location[0])) {
      // A remove happened before our location (-1 because index of end of selection)
      return true;
    }
    else {
      // All cases checked, must not shift as a block
      return false;
    }
  }

  /**
   * Given an index entry, update the location.
   * Note: might give an invalid location back
   *
   * @method updateLocationWithIndex
   *
   * @param {[number, number]} location Location to update
   * @param {Object} index Index entry to update the location with
   *
   * @return {[number, number]} Updated location based on the index entry
   *
   * @private
   */
  updateLocationWithIndex(location, index) {
    if(!this.doesLocationChange(index, location)) {
      // nothing happens: text inserted or removed after location
      return location;
    }
    else if(this.doesLocationShiftsAsBlock(index, location)) {
      // shift location to right or left
      return [location[0] + index.delta,  location[1] + index.delta];
    }
    else if(location.startIdx === location[1] - 1 && index.operation === 'insert') {
      // shrink or expand location (may lead to negative interval)
      return [location[0], location[1] + index.delta - 1];
    }
    else {
      // shrink based on text removal
      return [location[0], location[1] + index.delta];
    }
  }


  /**
   * Given an index entry and a card, pull the card through the remaining index entries
   * to update the registy correctly.
   *
   * @method updateCardToCurrentIndex
   *
   * @param {Object} idx
   * @param {Object} card
   *
   * @private
   */
  updateCardToCurrentIndex(idx, card) {
    let remainingIndexes = this.getRemainingIndexes(idx);

    if(remainingIndexes.length > 0) {
      let cardData = this.applyIndexesToCard(remainingIndexes, card);
      if(!cardData.isValid) {
        return;
      }
      card = cardData.card;
    }
    // TODO: doesn't this introduce duplicate cards, why would we want this?!
    this.registry.push(card);
  }

  /**
   * Given an index entry, give back the remaining index entries which lead to the head of the index.
   *
   * @method getRemainingIndexes
   *
   * @param {Object} indexEntry
   *
   * @private
   */
  getRemainingIndexes(indexEntry) {
    return this.index.slice(indexEntry.idx + 1);
  }


  /**
   * Update the registry and notify observers
   *
   * @method updateRegistryAndNotify
   *
   * @param {Ember.Array} registry
   *
   * @private
   */
  replaceRegistryAndNotify(registry) {
    this.registry = registry;
    this.sendRegistryToObservers(registry);
  }

  /**
   * send registry to registry observers
   *
   * @param {Array} registry
   *
   * @private
   */
  sendRegistryToObservers(registry) {
    for (let obs of this.registryObservers) {
      obs(registry);
    }
  }

  sendNewCardToObservers(card){
    for (let obs of this.newCardObservers) {
      obs(card);
    }
  }

  sendRemovedCardToObservers(card){
    for (let obs of this.removedCardObservers) {
      obs(card);
    }
  }
}
