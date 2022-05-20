import { HtmlTag } from './types';

export interface Serializable {
  toString(): string;
}

export type AttributeSpec = { setBy?: string } & Record<string, Serializable>;

export const SLOT: SLOT = 0;
type SLOT = 0;
type HtmlNodeSpec = {
  tag: HtmlTag;
  attributes?: Record<string, Serializable>;
  content?: string;
  children?: RenderSpec[];
};
export type RenderSpec = HtmlNodeSpec | SLOT;

export default function renderFromSpec(
  spec: RenderSpec,
  block: Node | null = null
): Node | null {
  if (spec === SLOT) {
    return block;
  } else {
    const result = document.createElement(spec.tag);
    if (spec.attributes) {
      for (const [key, val] of Object.entries(spec.attributes)) {
        if (val !== undefined) {
          result.setAttribute(key, val.toString());
        }
      }
    }

    if (spec.content) {
      result.innerText = spec.content;
    }
    if (spec.children) {
      for (const child of spec.children) {
        const render = renderFromSpec(child, block);
        if (render) {
          result.appendChild(render);
        }
      }
    }

    return result;
  }
}

export function extractChild(
  spec: RenderSpec,
  element: ChildNode
): Node | null {
  if (spec === SLOT) {
    return element;
  } else {
    let result: Node | null = null;
    if (spec.children) {
      spec.children.forEach((child, i) => {
        result = extractChild(child, element.childNodes[i]);
        if (result) {
          return;
        }
      });
    }

    return result;
  }
}
