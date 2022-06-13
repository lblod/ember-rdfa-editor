import { HtmlTag } from './types';

export interface Serializable {
  toString(): string;
}

export type AttributeSpec = { setBy?: string } & Record<string, Serializable>;

export const SLOT: SLOT = 0;
type SLOT = 0;
type HtmlNodeSpec = {
  tag: HtmlTag;
  attributes?: Record<string, Serializable | undefined>;
  children?: RenderSpec[];
};
export type RenderSpec = HtmlNodeSpec | SLOT;

export default function renderFromSpec(
  spec: RenderSpec,
  ...nodes: Node[]
): HTMLElement {
  if (spec === SLOT) {
    const result = document.createElement('span');
    result.append(...nodes);
    return result;
  } else {
    const result = document.createElement(spec.tag);
    if (spec.attributes) {
      for (const [key, val] of Object.entries(spec.attributes)) {
        if (val !== undefined) {
          result.setAttribute(key, val.toString());
        }
      }
    }
    if (spec.children) {
      for (const child of spec.children) {
        if (child === SLOT) {
          result.append(...nodes);
        } else {
          result.appendChild(renderFromSpec(child, ...nodes));
        }
      }
    }

    return result;
  }
}
