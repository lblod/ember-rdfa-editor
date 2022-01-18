import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class UnpollutedHtmlTextWriter extends HtmlTextWriter {}
