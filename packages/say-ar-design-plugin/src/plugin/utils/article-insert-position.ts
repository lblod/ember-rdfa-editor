type InsertSpec = 'first' | 'last' | number;

type InsertMeasureIndex = number | undefined;

// import for jsdoc link, @import seems to not work here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type insertMeasure from '@lblod/say-roadsign-regulation-plugin/plugin/actions/insert-measure';

/**
 * Util class to encapsulate where to insert something in the editor, based
 * on its relation to the existing articles
 */
export class ArticleInsertPosition {
  private index;
  constructor(articleIndex: InsertSpec) {
    this.index = articleIndex;
  }

  /**
   * The insertion index as understood by the {@link insertMeasure} function
   * It expects the index of the article before which it will insert,
   * or undefined, which it interprets as after last
   */
  get insertMeasureIndex(): InsertMeasureIndex {
    if (this.index === 'last') {
      return undefined;
    } else if (this.index === 'first') {
      return 0;
    } else {
      return this.index + 1;
    }
  }
}

export const afterLastArticle = new ArticleInsertPosition('last');
export const beforeFirstArticle = new ArticleInsertPosition('first');
