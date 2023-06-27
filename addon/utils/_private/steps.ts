import { Node, Schema } from 'prosemirror-model';
import { Step, StepResult } from 'prosemirror-transform';

//Based on https://discuss.prosemirror.net/t/changing-doc-attrs/784/22
export class SetDocAttributeStep extends Step {
  private prevValue: unknown;
  static ID = 'setDocAttribute';
  constructor(readonly key: string, readonly value: unknown) {
    super();
  }
  apply(doc: Node): StepResult {
    const newDoc = doc.copy(doc.content);
    this.prevValue = newDoc.attrs[this.key];
    //@ts-expect-error Nodes are normally immutable in prosemirror, this is an exception
    newDoc.attrs = {
      ...newDoc.attrs,
      [this.key]: this.value,
    };
    return StepResult.ok(newDoc);
  }
  invert(): Step {
    return new SetDocAttributeStep(this.key, this.prevValue);
  }
  map(): Step | null {
    return this;
  }
  toJSON() {
    return {
      stepType: SetDocAttributeStep.ID,
      key: this.key,
      value: this.value,
    };
  }

  static fromJSON(schema: Schema, json: Record<string, unknown>): Step {
    if (typeof json.key != 'string' || !json.value) {
      throw new Error('Invalid input for SetDocAttributeStep.fromJSON');
    }
    return new SetDocAttributeStep(json.key, json.value);
  }
}

Step.jsonID(SetDocAttributeStep.ID, SetDocAttributeStep);
