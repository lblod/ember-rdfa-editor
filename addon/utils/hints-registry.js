import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import { next } from '@ember/runloop';
import { task, timeout } from 'ember-concurrency';

/**
* Bookkeeping of the editor hints
*
* @module editor-core
* @class HintsRegistry
* @constructor
* @extends EmberObject
*/
export default EmberObject.extend({
  /**
  * @property index
  * @type Array
  */
  index: null,

  /**
  * @property registry
  * @type Array
  */
  registry: null,

  /**
  * @property activeRegion
  * @type Array
  */
  activeRegion: null,

  /**
  * @property activeHints
  * @type Array
  */
  activeHints: computed('activeRegion', 'registry', 'registry.[]', function() {
    const region = this.get('activeRegion');
    return this.get('registry').filter((hint) => {
      return region[0] >= hint.location[0] && region[1] <= hint.location[1];
    });
  }),

  /**
   * @property registryObservers
   * @type Array
   * @private
   */
  registryObservers: null,

  init() {
    this.set('index', A());
    this.set('registry', A());
    this.set('activeRegion', A());
    this.set('registryObservers', A());
    this.set('newCardObservers', A());
    this.set('removedCardObservers', A());
    this.set('higlightsForFutureRemoval', A());
    this.set('higlightsForFutureInsert', A());
  },

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
    this.get('registryObservers').push(observer);
  },

  addNewCardObserver(observer) {
    this.get('newCardObservers').push(observer);
  },

  addRemovedCardObserver(observer) {
    this.get('removedCardObservers').push(observer);
  },

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
  },

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
  },

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

    return this.get('registry').filter(condition);
  },

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

    return this.get('registry').filter(condition);
  },

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

    let updatedRegistry = A();
    A(this.get('registry').forEach(entry => {
      if(condition(entry)){
        updatedRegistry.push(entry);
      }
      else{
        this.sendRemovedCardToObservers(entry.location);
      }
    }));


    if(updatedRegistry.get('length') !== this.get('registry').get('length')){
      this.replaceRegistryAndNotify(updatedRegistry);
    }

  },

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
   let updatedRegion = (hrIdx ? this.updateLocationToCurrentIndex(hrIdx, region) : region);

    const notInRegion = (location, region) => {
      return region[0] > location[0] || region[1] < location[1];
    };

    let condition = null;
    if (who) {
      condition = (entry) => { return (notInRegion(entry.location, updatedRegion) && entry.who == who) || entry.who !== who; };
    } else {
      condition = (entry) => { return notInRegion(entry.location, updatedRegion); };
    }

    let updatedRegistry = A();
    this.get('registry').forEach(entry => {
      if(condition(entry)){
        updatedRegistry.push(entry);
      }
      else{
        this.higlightsForFutureRemoval.push({location: entry.location, hrIdx});
      }
    });

    this.set('registry', updatedRegistry);

    next(() => { this.batchProcessHighlightsUpdates.perform(); });

  },

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
  batchProcessHighlightsUpdates: task(function* (){
    yield timeout(50);

    // The hints registry might not be updated by the editor yet,
    // so wait for the editor to inform hintsregistry of the updates on the underlying DOM, so the hint registry
    // has a correct index to work on.
    // If busy, move this operation to the next runloop
    if(this.rawEditor.generateDiffEvents.isRunning){
      next(() => { this.batchProcessHighlightsUpdates.perform(); });
      return;
    }

    let updatedHlToRemove = this.higlightsForFutureRemoval.map( entry => {
      return this.updateLocationToCurrentIndex(entry.hrIdx, entry.location);
    });

    this.set('higlightsForFutureRemoval', A());

    let updatedHlToInsert = this.higlightsForFutureInsert.map( entry => {
      return this.updateLocationToCurrentIndex(entry.hrIdx, entry.location);
    });

    this.set('higlightsForFutureInsert', A());

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

  }).restartable(),

  /**
   * Adds collection of hints.
   *
   * @method addHints
   *
   * @param {Object} hrIdx Index of the registry
   * @param {string} who Name of the plugin
   * @param {Array} Array Hints to add
   *
   * @public
   */
  addHints(hrIdx, who, cards) {
    cards.map(card => {
      card.who = who;
      this.updateCardToCurrentIndex(hrIdx, card);
      if( !card.options || !card.options.noHighlight)
        this.higlightsForFutureInsert.push({location: card.location, hrIdx});
    }, this);

    next(() => { this.batchProcessHighlightsUpdates.perform(); });
  },

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
  },

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
    if(this.get('index').length == 0) {
      return 0;
    }
    return this.currentIndex().idx + 1;
  },

  /**
   * Gets current index.
   *
   * @method currentIndex
   *
   * @return {Object} The current index
   *
   * @private
   */
  currentIndex() {
    return this.get('index').slice(-1)[0];
  },

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
  },

  /**
   * Appends index entry to index.
   *
   * @method appendToIndex
   *
   * @private
   */
  appendToIndex(indexEntry) {
    this.get('index').pushObject(indexEntry);
  },

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
  },

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

      card.set('location', this.updateLocationWithIndex(card.location, index));
      hasChanged = true;

      if(!this.isLocationValid(card.location)) {
        isValid = false;
        break;
      }
    }
    return {hasChanged, isValid, card};
  },


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
    let updatedRegistry = this.applyIndexesToCards([indexEntry], this.get('registry'));
    if(updatedRegistry.hasChanged) {
      this.replaceRegistryAndNotify(A(updatedRegistry.cards));
    }
  },

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
  },

  /**
   * Given an index entry, check whether it affects location.
   *
   * @method doesLocationChange
   *
   * @param {[number, number]} location
   * @param {Object} index
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
  },

  /**
   * Given an index entry, check wether the location moves as block to left or right.
   *
   * @method doesLocationShiftsAsBlock
   *
   * @param {[number, number]} location
   * @param {Object} index
   *
   * @return {boolean} Whether the location shifts as block
   *
   * @private
   */
  doesLocationShiftsAsBlock(index, location) {
    if((location[0] - location[1] - 1) === 0) {
      return false;
    }

    if(index.operation === 'insert' && (index.startIdx <= location[0])) {
      return true;
    }

    if(index.operation === 'remove' && (index.endIdx - 1< location[0])) {
      return true;
    }

    return false;
  },

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
    //nothing happens: text inserted or removed after location
    if(!this.doesLocationChange(index, location)) {
      return location;
    }

    //shift location to right or left
    if(this.doesLocationShiftsAsBlock(index, location)) {
      return [location[0] + index.delta,  location[1] + index.delta];
    }

    //shrink or expand location (may lead to negative interval)
    if(location.startIdx === location[1] - 1 && index.operation === 'insert') {
      return [location[0], location[1] + index.delta - 1];
    }
    return [location[0], location[1] + index.delta];
  },


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

    this.get('registry').pushObject(card);
  },

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
    return this.get('index').slice(indexEntry.idx + 1);
  },


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
    this.set('registry', registry);
    this.sendRegistryToObservers(registry);
  },

  /**
   * send registry to registry observers
   *
   * @param {Array} registry
   *
   * @private
   */
  sendRegistryToObservers(registry) {
    this.get('registryObservers').forEach(obs => {
      obs(registry);
    });
  },

  sendNewCardToObservers(card){
    this.get('newCardObservers').forEach(obs => {
      obs(card);
    });
  },

  sendRemovedCardToObservers(card){
    this.get('removedCardObservers').forEach(obs => {
      obs(card);
    });
  }
});
