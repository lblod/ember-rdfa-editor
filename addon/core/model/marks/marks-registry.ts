import {
  MarkSpec,
  TagMatch,
} from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';
import { isElement, tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import HashSet from '@lblod/ember-rdfa-editor/utils/hash-set';
import { AttributeSpec } from '../../../utils/render-spec';

export interface SpecAttributes {
  spec: MarkSpec;
  attributes: AttributeSpec;
}

export default class MarksRegistry {
  /**
   * A map of html element tagnames onto the markspecs that
   * match on them.
   * @private
   */
  private markMatchMap: Map<TagMatch, MarkSpec[]> = new Map<
    keyof HTMLElementTagNameMap,
    MarkSpec[]
  >();
  /**
   * A registry of the currently supported markSpecs in the document
   * @private
   */
  private registeredMarks: Map<string, MarkSpec> = new Map<string, MarkSpec>();

  matchMarkSpec(node: Node): Set<SpecAttributes> {
    const setBy = isElement(node)
      ? node.dataset['__setBy'] || CORE_OWNER
      : CORE_OWNER;

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
            result.add({ spec, attributes: { setBy, ...attributes } });
          }
        } else {
          result.add({ spec, attributes: { setBy } });
        }
      }
    }
    return result;
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
}
