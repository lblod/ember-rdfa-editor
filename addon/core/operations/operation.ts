import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";

/**
 * Composable nuclear modification of {@link EditorModel} state.
 * Think of this as something like the addition and subtraction operations in mathematics,
 * which we can naturally combine to make multiplication, division and exponentiation operators.
 *
 * The goal is to have the set of operations to be as small as possible, since every operation needs to be able
 * to be composed with any other operation, complexity of composition grows exponentially with the amount
 * of operations.
 *
 * An example of this: you might be tempted to think of Insertion and Deletion as two separate basic operations.
 * But what if we define insertion of content into a range as overwriting any content that may already exist there?
 * Then we can simply implement Deletion as the Insertion of nothing.
 *
 * While minimalism is the general guideline, performance considerations will likely require pragmatism.
 * e.g.: a move operation could be considered as 2 Insertion operations,
 * (one to remove it from the original location, one to insert it at its destination), but implementing it
 * as a single operation might provide opportunities for optimization.
 * (think of CPU instruction sets as a possible analogy)
 */
export default abstract class Operation {
  private _range: ModelRange;
  private eventBus: EventBus;
  protected constructor(eventBus: EventBus, range: ModelRange) {
    this._range = range;
    this.eventBus = eventBus;
  }
  get range(): ModelRange {
    return this._range;
  }

  set range(value: ModelRange) {
    this._range = value;
  }
  canExecute(): boolean {
    return true;
  }
  abstract execute(): ModelRange;
}
