import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelTreeWalker, {ModelTreeWalkerConfig} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class FindNodesCommand extends Command<[ModelTreeWalkerConfig], Iterable<ModelNode>> {
  name = "find-nodes";

  constructor(model: Model) {
    super(model);
  }

  execute(_executedBy: string, config: ModelTreeWalkerConfig): Iterable<ModelNode> {
    return new ModelTreeWalker(config);
  }

}
