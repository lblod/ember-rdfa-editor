import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelElement from '../nodes/model-element';
import ModelNode from '../nodes/model-node';
import ModelText from '../nodes/model-text';
import { Mark } from './mark';

export type MarksManagerArgs = {
  store?: Map<string, Set<Mark>>;
  ownerMapping?: Map<string, Set<Mark>>;
};

export default class MarksManager {
  /**
   * A map of mark owners onto the currently active marks created by the owner
   * @private
   */
  private markOwnerMapping: Map<string, Set<Mark>>;

  /**
   * A map of unique mark types onto the currently active marks of that type
   * @private
   */
  private markStore: Map<string, Set<Mark>>;

  constructor(args?: MarksManagerArgs) {
    this.markStore = args?.store || new Map<string, Set<Mark>>();
    this.markOwnerMapping = args?.ownerMapping || new Map<string, Set<Mark>>();
  }

  getMarksByOwner(owner: string): Set<Mark> {
    return this.markOwnerMapping.get(owner) || new Set();
  }

  getMarksByMarkName(name: string): Set<Mark> {
    return this.markStore.get(name) || new Set();
  }

  static fromDocument(document: ModelElement) {
    const markStore = new Map<string, Set<Mark>>();
    const markOwnerMapping = new Map<string, Set<Mark>>();
    const textModels: GenTreeWalker<ModelText> = GenTreeWalker.fromSubTree({
      root: document,
      filter: toFilterSkipFalse((node: ModelNode) =>
        ModelNode.isModelText(node)
      ),
    }) as GenTreeWalker<ModelText>;

    for (const textModel of textModels.nodes()) {
      for (const mark of textModel.marks) {
        MapUtils.setOrAdd(markStore, mark.name, mark);
        MapUtils.setOrAdd(
          markOwnerMapping,
          mark.attributes.setBy || CORE_OWNER,
          mark
        );
      }
    }

    return new MarksManager({
      store: markStore,
      ownerMapping: markOwnerMapping,
    });
  }
}
