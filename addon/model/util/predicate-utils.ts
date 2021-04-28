import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/model/model-element";
export type Predicate<T> = (item: T) => boolean;

/**
 * Returns a predicate that returns true for any element with a type
 * that's included in the provided types array.
 * If no types are provided, the predicate always returns true.
 * @param types
 */
export const elementHasType = (...types: ElementType[]): Predicate<ModelElement> => {
  let predicate;
  if (types.length) {
    const typeSet = new Set(types);
    predicate = (elem: ModelElement) => typeSet.has(elem.type);
  } else {
    predicate = () => true;
  }
  return predicate;
};
