import { HtmlTag } from './types';

export interface Serializable {
  toString(): string;
}

export type AttributeSpec = { setBy?: string } & Record<string, Serializable>;

export const SLOT: SLOT = 0;
type SLOT = 0;
type HtmlNodeSpec =
  | HtmlTag
  | { tag: HtmlTag; attributes: Record<string, Serializable> };
export type RenderSpec = [HtmlNodeSpec, RenderSpec[]] | SLOT;

export default function renderFromSpec(
  spec: RenderSpec,
  block: Node | null = null
): Node | null {
  if (spec === SLOT) {
    return block;
  } else {
    const [nodeSpec, children] = spec;
    let result: HTMLElement;
    if (typeof nodeSpec === 'string') {
      result = document.createElement(nodeSpec);
    } else {
      result = document.createElement(nodeSpec.tag);
      for (const [key, val] of Object.entries(nodeSpec.attributes)) {
        if (val !== undefined) {
          result.setAttribute(key, val.toString());
        }
      }
    }

    for (const child of children) {
      const render = renderFromSpec(child, block);
      if (render) {
        result.appendChild(render);
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
    const [, children] = spec;
    let result: Node | null = null;
    children.forEach((child, i) => {
      result = extractChild(child, element.childNodes[i]);
      if (result) {
        return;
      }
    });
    return result;
  }
}
