import ModelTreeWalker, {ModelTreeWalkerConfig} from "@lblod/ember-rdfa-editor/util/model-tree-walker"
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default class FindNodesCommand extends Command<[ModelTreeWalkerConfig], Iterable<ModelNode>> {
  name = "find-nodes";

  constructor(model: EditorModel) {
    super(model);
  }

  execute(_executedBy: string, config: ModelTreeWalkerConfig): Iterable<ModelNode> {
    return new ModelTreeWalker(config);
  }

}
