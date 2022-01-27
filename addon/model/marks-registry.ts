import {
  AttributeSpec,
  Mark,
  MarkSpec,
  TagMatch,
} from '@lblod/ember-rdfa-editor/model/mark';
import MapUtils from '@lblod/ember-rdfa-editor/model/util/map-utils';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/model/util/constants';
import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';

export interface SpecAttributes {
  spec: MarkSpec;
  attributes: AttributeSpec;
}

export default class MarksRegistry {
  private _eventBus?: EventBus;

  constructor(eventBus?: EventBus) {
    this._eventBus = eventBus;
    if (this._eventBus) {
      this._eventBus.on('contentChanged', this.updateMarks);
    }
  }

  private markStore: Map<string, Set<ModelText>> = new Map<
    string,
    Set<ModelText>
  >();
  private markMatchMap: Map<TagMatch, MarkSpec[]> = new Map<
    keyof HTMLElementTagNameMap,
    MarkSpec[]
  >();
  private registeredMarks: Map<string, MarkSpec> = new Map<string, MarkSpec>();

  updateMarks = (event: ContentChangedEvent) => {
    const { owner, payload } = event;
    if (payload.type === 'insert') {
      const { overwrittenNodes, insertedNodes, _markCheckNodes } = payload;
      this.updateMarksForNodes(owner, insertedNodes);
      this.updateMarksForNodes(owner, _markCheckNodes);
      this.removeMarksForNodes(owner, overwrittenNodes);
    } else if (payload.type === 'move') {
      const { insertedNodes, _markCheckNodes } = payload;
      this.updateMarksForNodes(owner, insertedNodes);
      this.updateMarksForNodes(owner, _markCheckNodes);
    }
  };

  private updateMarksForNodes(owner: string, nodes: ModelNode[]) {
    for (const node of nodes) {
      const walker = GenTreeWalker.fromSubTree({
        root: node,
        filter: toFilterSkipFalse(ModelNode.isModelText),
      });
      for (const textNode of walker.nodes() as Generator<ModelText>) {
        const ownerNodes = this.markStore.get(owner);
        if (ownerNodes) {
          if (textNode.marks.size) {
            ownerNodes.add(textNode);
          } else {
            ownerNodes.delete(textNode);
          }
        } else {
          this.markStore.set(owner, new Set([textNode]));
        }
      }
    }
  }

  private removeMarksForNodes(owner: string, nodes: ModelNode[]) {
    for (const node of nodes) {
      const walker = GenTreeWalker.fromSubTree({
        root: node,
        filter: toFilterSkipFalse(ModelNode.isModelText),
      });
      for (const textNode of walker.nodes() as Generator<ModelText>) {
        const ownerNodes = this.markStore.get(owner);
        if (ownerNodes) {
          ownerNodes.delete(textNode);
        }
      }
    }
  }

  matchMarkSpec(node: Node): Set<SpecAttributes> {
    const potentialMatches =
      this.markMatchMap.get(tagName(node) as TagMatch) || [];
    const defaultMatches = this.markMatchMap.get('*') || [];

    const result = new HashSet<SpecAttributes>({
      hashFunc: (specAttr) =>
        specAttr.spec.name + JSON.stringify(specAttr.attributes),
    });
    potentialMatches.concat(defaultMatches);
    for (const spec of potentialMatches) {
      for (const matcher of spec.matchers) {
        if (matcher.attributeBuilder) {
          const attributes = matcher.attributeBuilder(node);
          if (attributes) {
            result.add({ spec, attributes });
          }
        } else {
          result.add({ spec, attributes: {} });
        }
      }
    }
    return result;
  }

  addMark<A extends AttributeSpec>(
    node: ModelText,
    spec: MarkSpec<A>,
    attributes: A
  ) {
    const mark = new Mark(spec, attributes, node);
    node.addMark(mark);
    MapUtils.setOrAdd(
      this.markStore,
      attributes.setBy ?? CORE_OWNER,
      mark.node
    );
  }

  removeMarkByName(node: ModelText, markName: string) {
    node.removeMarkByName(markName);
    const mark = node.marks.lookupHash(markName);
    if (mark) {
      const marks = this.markStore.get(mark.attributes.setBy ?? CORE_OWNER);
      if (marks) {
        marks.delete(mark.node);
      }
    }
  }

  lookupMark(name: string): MarkSpec | null {
    return this.registeredMarks.get(name) || null;
  }

  registerMark(mark: MarkSpec) {
    this.registeredMarks.set(mark.name, mark);
    for (const matcher of mark.matchers) {
      MapUtils.setOrPush(this.markMatchMap, matcher.tag, mark);
    }
  }

  clear() {
    this.markStore.clear();
  }
}
