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
export type RenderSpec = HtmlNodeSpec | string | SLOT;

export default function renderFromSpec(
  spec: RenderSpec,
  block?: Node
): Node | undefined {
  if (spec === SLOT) {
    return block;
  } else if (typeof spec === 'string') {
    return document.createTextNode(spec);
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
        const render = renderFromSpec(child, block);
        if (render) {
          result.appendChild(render);
        }
      }
    }

    return result;
  }
}

export function renderFromSpecMultipleChildren(
  spec: RenderSpec,
  nodes: Iterable<Node>
): Node {
  if (spec === SLOT) {
    const result = document.createElement('span');
    result.append(...nodes);
    return result;
  } else {
    let result: HTMLElement;
    if (typeof spec === 'string') {
      result = document.createElement(spec);
    } else {
      result = document.createElement(spec.tag);
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
            result.appendChild(renderFromSpecMultipleChildren(child, nodes));
          }
        }
      }
    }

    return result;
  }
}
