import Query from "@lblod/ember-rdfa-editor/core/query";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {ImmutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";

export type ContentType = "xml" | "modelNode" | "html";

export default class GetContentQuery extends Query<[ContentType, ModelRange], Element | ModelNode | null> {
  name = "get-content";

  constructor(model: ImmutableModel) {
    super(model);
  }

  execute(executedBy: string, contentType: ContentType, range: ModelRange): Element | ModelNode | null {
    return this.model.query(executedBy, (inspector => {
      return inspector.getContent(contentType, range);
    }));
  }

}
