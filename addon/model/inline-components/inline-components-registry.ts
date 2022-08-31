import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { TagMatch } from '../mark';
import { tracked } from 'tracked-built-ins';
import MapUtils from '../util/map-utils';
import {
  InlineComponentSpec,
  ModelInlineComponent,
} from './model-inline-component';
import Controller from '../controller';
import { ComponentNotFoundError } from '@lblod/ember-rdfa-editor/utils/errors';
import InlineComponentController from './inline-component-controller';
export type ActiveComponentEntry = {
  emberComponentName: string;
  node: HTMLElement;
  componentController: InlineComponentController;
  editorController: Controller;
};
export default class InlineComponentsRegistry {
  private registeredComponents: Map<string, InlineComponentSpec> = new Map();
  private componentMatchMap: Map<TagMatch, InlineComponentSpec[]> = new Map<
    keyof HTMLElementTagNameMap,
    InlineComponentSpec[]
  >();

  activeComponents = tracked<ActiveComponentEntry>([]);

  matchInlineComponentSpec(node: Node): InlineComponentSpec | null {
    const potentialMatches =
      this.componentMatchMap.get(tagName(node) as TagMatch) || [];

    let result: InlineComponentSpec | null = null;

    for (const spec of potentialMatches) {
      if (spec.matcher.attributeBuilder) {
        const baseAttributesMatch = spec.matcher.attributeBuilder(node);
        if (baseAttributesMatch) {
          result = spec;
          break;
        }
      } else {
        result = spec;
      }
    }

    return result;
  }

  registerComponent(componentSpec: InlineComponentSpec) {
    this.registeredComponents.set(componentSpec.name, componentSpec);
    MapUtils.setOrPush(
      this.componentMatchMap,
      componentSpec.matcher.tag,
      componentSpec
    );
  }

  lookUpComponent(name: string) {
    return this.registeredComponents.get(name);
  }

  clearComponentInstances() {
    this.activeComponents.length = 0;
  }

  addComponentInstance(
    node: HTMLElement,
    emberComponentName: string,
    model: ModelInlineComponent
  ) {
    const componentSpec = this.lookUpComponent(emberComponentName);
    if (componentSpec) {
      const componentController = new InlineComponentController(model, node);
      this.activeComponents.push({
        emberComponentName,
        node,
        componentController,
        editorController: componentSpec.controller,
      });
    } else {
      throw new ComponentNotFoundError(
        `Component ${emberComponentName} not found`
      );
    }
  }

  get componentInstances() {
    return this.activeComponents;
  }

  getComponentInstances(filter?: { componentName: string }) {
    if (filter) {
      return tracked<ActiveComponentEntry>(
        this.activeComponents.filter(
          (entry) => entry.emberComponentName === filter.componentName
        )
      );
    } else {
      return this.activeComponents;
    }
  }
}
