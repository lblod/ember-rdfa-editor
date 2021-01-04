abstract class CustomError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
/**
 * Utility error for when you want to define an API but not yet the implementation
 */
export class NotImplementedError extends CustomError {}

/**
 * The selection is not in a state we expect
 */
export class SelectionError extends CustomError {}

/**
 * A domelement is not in a state we expect
 */
export class DomElementError extends CustomError {}

/**
 * Something went wrong while converting the DOM to the model
 */
export class ReaderError extends CustomError {}

/**
 * Something went wrong while converting the model back to the DOM
 */
export class WriterError extends CustomError{}


export class ModelError extends CustomError{}
