export interface Model {
  /**
   * Change the model by providing a callback that will receive an {@link ImmediateModelMutator immediate mutator}.
   * The model gets written out automatically after the callback finishes.
   *
   * @param callback
   * @param writeBack
   */
  change(executedBy: string, callback: (mutator: ImmediateModelMutator) => ModelElement | void, writeBack): void;
}
