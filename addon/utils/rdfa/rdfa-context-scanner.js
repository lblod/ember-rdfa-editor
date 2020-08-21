import ContextScanner from '@lblod/marawa/rdfa-context-scanner';

/**
 * Wrapper for the marawa context scanner
 * @module rdfa-editor
 * @class RdfaContextScanner
 * @constructor
 * @public
 */
export default {
  create() {
    return new ContextScanner();
  }
};
