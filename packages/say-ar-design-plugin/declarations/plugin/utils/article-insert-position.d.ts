type InsertSpec = 'first' | 'last' | number;
type InsertMeasureIndex = number | undefined;
/**
 * Util class to encapsulate where to insert something in the editor, based
 * on its relation to the existing articles
 */
export declare class ArticleInsertPosition {
    private index;
    constructor(articleIndex: InsertSpec);
    /**
     * The insertion index as understood by the {@link insertMeasure} function
     * It expects the index of the article before which it will insert,
     * or undefined, which it interprets as after last
     */
    get insertMeasureIndex(): InsertMeasureIndex;
}
export declare const afterLastArticle: ArticleInsertPosition;
export declare const beforeFirstArticle: ArticleInsertPosition;
export {};
