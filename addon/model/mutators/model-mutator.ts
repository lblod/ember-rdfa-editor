import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

/**
 * A mutator is the only publicly accessible way to change the model.
 * It is available through the {@link Model.change} or {@link Model.batchChange} methods.
 * It provides an interface on top of {@link Operation operations} for use mainly
 * inside commands.
 *
 * This construction allows for a rich api with all the access it needs
 * while still maintaining full encapsulation and enabling things like batch
 * operation processing
 */
export default abstract class ModelMutator<T> {

  /**
   * Set a {@link TextAttribute} on all text in a range.
   * @param range
   * @param key
   * @param value
   */
  abstract setTextProperty(range: ModelRange, key: TextAttribute, value: boolean): T;

  /**
   * Insert nodes into range, overwriting the previous content and splitting
   * where necessary
   * @param range
   * @param nodes
   */
  abstract insertNodes(range: ModelRange, ...nodes: ModelNode[]): T;

  /**
   * Moves the contents of a range into another range, overwriting the
   * content of the targetRange.
   * @param rangeToMove
   * @param targetPosition
   */
  abstract moveToPosition(rangeToMove: ModelRange, targetPosition: ModelPosition): T;

}
