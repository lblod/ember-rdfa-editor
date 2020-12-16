import Model from "@lblod/ember-rdfa-editor/model/model";

export default abstract class Command {
  abstract name: string;
  protected model: Model;
  constructor(model: Model) {
    this.model = model;
  }
  abstract execute(...args: any[]): void;
}
