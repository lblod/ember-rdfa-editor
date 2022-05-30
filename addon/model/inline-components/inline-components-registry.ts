import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { TagMatch } from '../mark';
import MapUtils from '../util/map-utils';
import { InlineComponent, Properties } from './model-inline-component';
export type ActiveComponentEntry = {
  node: Node;
  emberComponentName: string;
  props?: Properties;
};
export default class InlineComponentsRegistry {
  private registeredComponents: Map<string, InlineComponent> = new Map();
  private componentMatchMap: Map<TagMatch, InlineComponent[]> = new Map<
    keyof HTMLElementTagNameMap,
    InlineComponent[]
  >();

  @tracked
  activeComponents = A<ActiveComponentEntry>([]);

  matchInlineComponentSpec(node: Node): InlineComponent | null {
    const potentialMatches =
      this.componentMatchMap.get(tagName(node) as TagMatch) || [];

    let result: InlineComponent | null = null;

    for (const component of potentialMatches) {
      const baseAttributesMatch = component.baseMatcher.attributeBuilder!(node);
      if (baseAttributesMatch) {
        result = component;
        break;
      }
    }

    return result;
  }

  registerComponent(component: InlineComponent) {
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

  addComponentInstance(
    node: Node,
    emberComponentName: string,
    props: Properties = {}
  ) {
    this.activeComponents.pushObject({ node, emberComponentName, props });
  }

  get componentInstances() {
    return this.activeComponents;
  }
}
