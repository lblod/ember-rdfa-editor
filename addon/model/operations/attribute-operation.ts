import ModelRange from "../model-range";

export default class AttributeOperation {

  private range: ModelRange;
  private key: string;
  private value: string;

  constructor(range: ModelRange, key: string, value: string) {
    this.range = range;
  }

  execute() {

  }
}
