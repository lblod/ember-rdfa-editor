import {Manipulation} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";

abstract class CustomError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Utility error for when you want to define an API but not yet the implementation
 */
export class NotImplementedError extends CustomError {
}

/**
 * The selection is not in a state we expect
 */
export class SelectionError extends CustomError {
}

export class MisbehavedSelectionError extends SelectionError {
  constructor() {
    super("Unexpected selection without anchor or focus");
  }
}

export class NoTopSelectionError extends SelectionError {
  constructor() {
    super("Unable to find commonAncestor children that are part of the selection");
  }

}

/**
 * A domelement is not in a state we expect
 */
export class DomElementError extends CustomError {
}

/**
 * Something went wrong while converting the DOM to the model
 */
export class ReaderError extends CustomError {
}

/**
 * Something went wrong while converting the model back to the DOM
 */
export class WriterError extends CustomError {
}


export class ModelError extends CustomError {
}

export class OutsideRootError extends ModelError {
  constructor() {
    super("Operating on elements outside of the root tree are not allowed");
  }
}

export class NoParentError extends ModelError {
  constructor() {
    super("Trying to access the parent of a node without parent");
  }
}

export class PositionError extends CustomError {
}

/**
 * Error to throw in tests when asserting something you also want
 * typescript to know about
 * This is a workaround for qunit assertions not informing typescript about their result
 */
export class AssertionError extends CustomError {
}

export class IndexOutOfRangeError extends CustomError {
}

export class OffsetOutOfRangeError extends CustomError {
  constructor(offset: number, maxOffset: number) {
    super(`Offset ${offset} out of range [0, ${maxOffset}]`);
  }
}

export class ModelRangeError extends SelectionError {
}

export class UnconfinedRangeError extends ModelRangeError {
  constructor() {
    super("Range is not confined to a single parent");
  }
}


export class OperationError extends CustomError {
}

export class ParseError extends CustomError {}

/*
 * Thrown when a method is invoked with an argument which it can not reasonably deal with
 */
export class IllegalArgumentError extends CustomError {}

export class UnsupportedManipulationError extends CustomError {
  constructor(manipulation: Manipulation) {
    super(`Manipulation with type ${manipulation.type} not supported here.`);
  }
}

/**
 * Thrown when an object or map does not have the expected key
 */
export class KeyError extends CustomError {
  constructor(key?: unknown) {
    super(`Missing key ${String(key) || ""}`);
  }
}
