import { selectCurrentSelection, selectHighlight, selectContext } from './editor/select';
import { update } from './editor/update';
import { triplesDefinedInResource } from './editor/triplestore';
import { replaceDomNode } from './editor/operation';
import { isEmpty } from './editor/selection-utils';

/**
 * SELECTION AND UPDATING API
 *
 * Selection and Update API go hand-in-hand.  First make a
 * selection, then determine the desired changes on the DOM tree.
 * Note that selection and update need to be synchronous.  Do not
 * assume that a selection that is made in one runloop can be used
 * to update the tree in another.
 *
 * Examples:
 *
 * Add context to highlighted range
 *
 *     const selection = editor.selectHighlight( range );
 *     editor.update( selection, {
 *       add: {
 *         property: "http://data.vlaanderen.be/ns/besluit/citeert",
 *         typeof: "http://data.vlaanderen.be/ns/besluit/Besluit",
 *         innerContent: selection.text // this is somewhat redundant, it's roughly the
 *                                      // default case.  in fact, it may drop
 *                                      // knowledge so you shouldn't do it unless you
 *                                      // need to.
 *
 *       } } );
 *
 * Add type to existing type definition:
 *
 *     const sel = editor.selectContext( range, { typeof: "http://data.vlaanderen.be/ns/besluit/Besluit" } );
 *     editor.update( sel, { add: {
 *       typeof: "http://mu.semte.ch/vocabularies/ext/AanstellingsBesluit",
 *       newContext: false } } );
 *
 * Add new context below existing type definition:
 *
 *     const sel = editor.selectContext( range, { typeof: "http://data.vlaanderen.be/ns/besluit/Besluit" } );
 *     editor.update( sel, { add: {
 *       typeof: "http://mu.semte.ch/vocabularies/ext/AanstellingsBesluit",
 *       newContext: true } } );
 *
 * Alter the type of some context:
 *
 *     const sel = editor.selectContext( range, { typeof: "http://tasks-at-hand.com/ns/metaPoint" } );
 *     editor.update( sel, {
 *       remove: { typeof: "http://tasks-at-hand.com/ns/MetaPoint" },
 *       add: { typeof: ["http://tasks-at-hand.com/ns/AgendaPoint", "http://tasks-at-hand.com/ns/Decesion"] }
 *     } );
 *
 */

// TODO This will become the new editor providing the Pernet API.
// It will be passed to the plugins instead of the full editor as done now.
// This editor will use internal methods imported from ./raw-editor.
// Once more plugins converted to the Pernet API, the internal methods of ./raw-editor will also be provided here,
// calling the appropirate method of ./raw-editor, but with a deprecation warning.

export {
  selectCurrentSelection,
  selectHighlight,
  selectContext,
  update,
  replaceDomNode,
  triplesDefinedInResource,
  isEmpty
}
