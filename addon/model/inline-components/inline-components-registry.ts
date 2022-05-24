import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { TagMatch } from '../mark';
import MapUtils from '../util/map-utils';
import { InlineComponent, Properties } from './model-inline-component';

export default class InlineComponentsRegistry {
  private registeredComponents: Map<string, InlineComponent<Properties>> =
    new Map();
  private componentMatchMap: Map<TagMatch, InlineComponent<Properties>[]> =
    new Map<keyof HTMLElementTagNameMap, InlineComponent<Properties>[]>();
  matchInlineComponentSpec(node: Node): InlineComponent<Properties> | null {
    const potentialMatches =
      this.componentMatchMap.get(tagName(node) as TagMatch) || [];

    let result: InlineComponent<Properties> | null = null;

    for (const component of potentialMatches) {
      const baseAttributesMatch = component.baseMatcher.attributeBuilder!(node);
      if (baseAttributesMatch) {
        if (component.matchers) {
          for (const matcher of component.matchers) {
            if (matcher.attributeBuilder) {
              const attributes = matcher.attributeBuilder(node);
              if (attributes) {
                result = component;
              }
            } else {
              result = component;
            }
          }
        } else {
          result = component;
        }
      }
    }

    return result;
  }

  registerComponent(component: InlineComponent<Properties>) {
    this.registeredComponents.set(component.name, component);
    MapUtils.setOrPush(
      this.componentMatchMap,
      component.baseMatcher.tag,
      component
    );
  }

  lookUpComponent(name: string) {
    return this.registeredComponents.get(name);
  }
}
