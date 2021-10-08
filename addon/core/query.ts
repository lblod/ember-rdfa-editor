import {ImmutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";

export default abstract class Query<A extends unknown[], R> {
  protected model: ImmutableModel;

  constructor(model: ImmutableModel) {
    this.model = model;
  }

  abstract execute(executedBy: string, ...args: A): R;
}
