import {ImmutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";

/**
 * Second half of the {@link https://en.wikipedia.org/wiki/Command%E2%80%93query_separation CQS} pattern.
 * Encapsulates a "question" you can ask the {@link EditorModel}. Cannot modify the model.
 */
export default abstract class Query<A extends unknown[], R> {
  abstract name: string;
  protected model: ImmutableModel;

  constructor(model: ImmutableModel) {
    this.model = model;
  }

  abstract execute(executedBy: string, ...args: A): R;
}
