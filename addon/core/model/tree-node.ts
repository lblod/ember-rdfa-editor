import {AttributeContainer} from "@lblod/ember-rdfa-editor/core/model/attributes";

export default interface TreeNode extends AttributeContainer<string, string> {
  get parent(): TreeNode | null;

  get root(): TreeNode;

  get type(): string;

}
