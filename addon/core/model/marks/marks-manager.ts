import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
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

export type MarkInstanceEntry = {
  mark: Mark;
  node: ModelText;
};

export type VisualMarkGroup = MarkInstanceEntry[];

export default class MarksManager {
  /**
   * A map of mark owners onto the currently active marks created by the owner
   * @private
   */
  private markOwnerMapping: Map<string, Set<MarkInstanceEntry>> = new Map();

  private visualMarkGroups: Map<string, Array<VisualMarkGroup>> = new Map();

  getMarksByOwner(owner: string): Set<MarkInstanceEntry> {
    return this.markOwnerMapping.get(owner) || new Set();
  }

  getVisualMarkGroupsByMarkName(name: string): Array<VisualMarkGroup> {
    return this.visualMarkGroups.get(name) || [];
  }

  static fromDocument(document: ModelElement) {
    const markOwnerMapping = new Map<string, Set<MarkInstanceEntry>>();
    const visualMarkGroups = new Map<string, Array<VisualMarkGroup>>();
    const textModels: GenTreeWalker<ModelText> = GenTreeWalker.fromSubTree({
      root: document,
      filter: toFilterSkipFalse((node: ModelNode) =>
        ModelNode.isModelText(node)
      ),
    }) as GenTreeWalker<ModelText>;
    for (const textModel of textModels.nodes()) {
      for (const mark of textModel.marks) {
        const entry = {
          mark,
          node: textModel,
        };
        MapUtils.setOrAdd(
          markOwnerMapping,
          mark.attributes.setBy || CORE_OWNER,
          entry
        );

        if (visualMarkGroups.has(mark.name)) {
          const visualMarkGroupList = visualMarkGroups.get(mark.name)!;
          const lastVisualMarkGroup = ArrayUtils.lastItem(visualMarkGroupList)!;
          if (
            ArrayUtils.lastItem(lastVisualMarkGroup)?.node.nextSibling ===
            textModel
          ) {
            lastVisualMarkGroup.push(entry);
          } else {
            visualMarkGroupList.push([entry]);
          }
        } else {
          visualMarkGroups.set(mark.name, [[entry]]);
        }
      }
    }

    const manager = new MarksManager();
    manager.markOwnerMapping = markOwnerMapping;
    manager.visualMarkGroups = visualMarkGroups;
    return manager;
  }
}
