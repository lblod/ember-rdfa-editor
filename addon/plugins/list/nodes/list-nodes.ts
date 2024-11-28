import type { Node as PNode, ParseRule } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
} from '@lblod/ember-rdfa-editor/core/schema';
import {
  optionMapOr,
  unwrap,
} from '@lblod/ember-rdfa-editor/utils/_private/option';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import { tagName } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

export type OrderListStyle =
  | 'decimal'
  | 'upper-roman'
  | 'lower-alpha'
  | 'upper-alpha';

const getListStyleFromDomElement = (dom: HTMLElement) => {
  const { listStyleType } = dom.style;

  // Falling back to dataset for back-compatability
  return (listStyleType || dom.dataset['listStyle']) as
    | OrderListStyle
    | undefined;
};

type Config = {
  enableHierarchicalList?: boolean;
};

export const orderedListWithConfig: (options?: Config) => SayNodeSpec = ({
  enableHierarchicalList = false,
} = {}) => {
  return {
    get attrs() {
      const baseAttrs: Record<string, { default: unknown }> = {
        order: { default: 1 },
        style: { default: null },
      };
      if (enableHierarchicalList) {
        baseAttrs['hierarchical'] = { default: null };
      }
      return baseAttrs;
    },
    content: 'list_item+',
    group: 'block list',
    classNames: ['say-ordered-list'],
    parseDOM: [
      {
        tag: 'ol',
        getAttrs(dom: string | HTMLElement) {
          if (typeof dom === 'string') {
            return false;
          }
          const start = dom.getAttribute('start');
          const baseAttrs: Record<string, unknown> = {
            order: optionMapOr(1, (val) => Number(val), start),
            style: getListStyleFromDomElement(dom),
          };
          if (enableHierarchicalList) {
            baseAttrs['hierarchical'] = dom.dataset['hierarchical']
              ? dom.dataset['hierarchical'] !== 'false'
              : null;
          }
          return baseAttrs;
        },
        consuming: false,
      },
    ],
    toDOM(node) {
      const { style, order, hierarchical, ...attrs } = node.attrs;
      const baseAttrs = {
        ...(order !== 1 && { start: order }),
        ...(style && {
          style: `list-style-type: ${style};`,
        }),
      };
      if (enableHierarchicalList) {
        baseAttrs['data-hierarchical'] = hierarchical;
      }
      return [
        'ol',
        {
          ...baseAttrs,
          ...attrs,
          class: getClassnamesFromNode(node),
        },
        0,
      ];
    },
  };
};

/**
 * @deprecated use `orderedListWithConfig` instead
 */
export const ordered_list = orderedListWithConfig();

export const bulletListWithConfig: (options?: Config) => SayNodeSpec = () => {
  return {
    content: 'list_item+',
    group: 'block list',
    attrs: {
      style: { default: 'unordered' },
      hierarchical: { default: false },
    },
    classNames: ['say-bullet-list'],
    parseDOM: [
      {
        tag: 'ul',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          return { ...getRdfaAttrs(node, { rdfaAware: false }) };
        },
        consuming: false,
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node: PNode) {
      return [
        'ul',
        {
          ...node.attrs,
          class: getClassnamesFromNode(node),
        },
        0,
      ];
    },
  };
};

/**
 * @deprecated use `bulletListWithConfig` instead
 */
export const bullet_list = bulletListWithConfig();

export const listItemWithConfig: (options?: Config) => SayNodeSpec = ({
  enableHierarchicalList = false,
} = {}) => {
  return {
    // The `+` requirement is taken from the Prosemirror provided list schema nodes.
    // It's likely that we may want to drop this in the future but it may require increasing the
    // complexity of the commands to operate on lists.
    // See https://github.com/ProseMirror/prosemirror-schema-list/blob/master/src/schema-list.ts
    content: 'paragraphGroup+ block*',
    defining: true,
    attrs: enableHierarchicalList ? { listPath: { default: [] } } : undefined,
    classNames: ['say-list-item'],
    parseDOM: [
      {
        tag: 'li',
        getAttrs(node: HTMLElement | string) {
          if (typeof node === 'string') {
            return false;
          }
          if (enableHierarchicalList) {
            const mapping = getListItemMapping(this);
            const listPath = calculateListItemPath(node, mapping);
            return { ...getRdfaAttrs(node, { rdfaAware: false }), listPath };
          }
          return { ...getRdfaAttrs(node, { rdfaAware: false }) };
        },
        sayListItemMapping: enableHierarchicalList
          ? new WeakMap<Node, number[]>()
          : undefined,
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node: PNode) {
      const attributes: { [key: string]: string } = {
        class: getClassnamesFromNode(node),
      };
      if (enableHierarchicalList) {
        attributes['data-list-marker'] = renderListMarker(
          node.attrs['listPath'],
        );
      }
      return ['li', attributes, 0];
    },
  };
};
export interface ListPathEntry {
  pos: number;
  style: string;
  hierarchical: boolean;
}
type ListItemMapping = WeakMap<Node, ListPathEntry[]>;
/**
 * a utility to conveniently get the list mapping out of a parseRule in a typesafe way
 */
function getListItemMapping(
  parseRule: ParseRule & { sayListItemMapping?: ListItemMapping },
): ListItemMapping {
  const mapping = parseRule.sayListItemMapping;
  if (mapping) {
    return mapping;
  } else {
    throw new Error('no list item mapping found on parserule');
  }
}

/**
 * Use dynamic programming to efficiently determine the hierarchy of a given <li> node
 */
function calculateListItemPath(
  node: Node,
  mapping: ListItemMapping,
): ListPathEntry[] {
  if (tagName(node) !== 'li') {
    throw new Error('Tried to calculate the list path of a non-li node');
  }
  const cached = mapping.get(node);
  if (cached) {
    return cached;
  }
  // first, get the path of the li higher up the tree, if there is one
  let basePath: ListPathEntry[] = [];
  let parent = unwrap(node.parentNode) as HTMLElement;
  // skip contentContainer divs if rdfaAware
  if (parent.dataset['contentContainer']) {
    parent = parent.parentElement as HTMLElement;
  }

  let grandParent = parent.parentElement as HTMLElement | null;
  // skip contentContainer divs if rdfaAware
  if (grandParent?.dataset['contentContainer']) {
    grandParent = grandParent.parentElement as HTMLElement | null;
  }
  if (grandParent && tagName(grandParent) === 'li') {
    basePath = calculateListItemPath(grandParent, mapping);
  }

  // then we calculate our index relative to the previous li items at our level
  // we specifically skip all non-li siblings. Technically these should not exist, but
  // out-of-spec html is extremely common
  let prevSiblingLi = node.previousSibling;
  while (prevSiblingLi && tagName(prevSiblingLi) !== 'li') {
    prevSiblingLi = prevSiblingLi.previousSibling;
  }

  let index = 0;
  if (prevSiblingLi) {
    const prevSiblingPath = calculateListItemPath(prevSiblingLi, mapping);
    index = prevSiblingPath[prevSiblingPath.length - 1].pos + 1;
  }

  // then we calculate the style and hierarchy of this level
  // if we have a parent OL that has style and hierarchy, we use it (treating ULs as style=unordered and not hierarchical)
  // if not, we copy over the styles from the grandparent LI, or use a default

  let style = 'decimal';
  let hierarchical = false;
  if (tagName(parent) === 'ul') {
    style = 'unordered';
  } else if (tagName(parent) === 'ol') {
    style =
      getListStyleFromDomElement(parent) ??
      basePath[basePath.length - 1]?.style ??
      style;
    if (parent.dataset['hierarchical']) {
      hierarchical = parent.dataset['hierarchical'] !== 'false';
    } else {
      hierarchical =
        basePath[basePath.length - 1]?.hierarchical ?? hierarchical;
    }
  } else {
    throw new Error('li with non-list parent');
  }

  // the result is simply the path of our ancestor li concatenated with our index
  const resultPath: ListPathEntry[] = [
    ...basePath,
    { pos: index, hierarchical, style },
  ];
  // and we store the result so we don't fibonnacci ourselves into exponential complexity
  mapping.set(node, resultPath);
  return resultPath;
}

const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];

function romanize(num: number) {
  const lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = '';
  for (const [i, value] of Object.entries(lookup)) {
    while (num >= value) {
      roman += i;
      num -= value;
    }
  }
  return roman;
}
/**
 * Turns index into a base 26 number and maps it onto the alphabet, resulting
 * in "aa" for index 26, "ab" for 27, "ba" for 52, etc
 */
function indexToAlpha(index: number): string {
  let cur = index;
  const result = [];
  result.push(cur % 26);
  while (cur > 25) {
    // -1 here cause we're 0-based
    cur = Math.floor(cur / 26) - 1;
    result.push(cur % 26);
  }
  result.reverse();
  return result.map((index) => alphabet[index]).join('');
}
/**
 * Given a path and a style, render a human-readable representation which the css rule can
 * simply render without extra processing
 */
function renderListMarker(path: ListPathEntry[]): string {
  const length = path.length;
  const lastIndex = length - 1;
  const lastEntry = path[lastIndex];
  if (lastEntry.hierarchical) {
    return `${path.map(renderEntry).join('.')}. `;
  } else {
    return `${renderEntry(lastEntry)}. `;
  }
}
function renderEntry(entry: ListPathEntry) {
  const { style, pos } = entry;
  if (style === 'lower-alpha') {
    return indexToAlpha(pos);
  } else if (style === 'upper-alpha') {
    return indexToAlpha(pos).toUpperCase();
  } else if (style === 'upper-roman') {
    return romanize(pos + 1);
  } else {
    return pos + 1;
  }
}
/**
 * @deprecated use `listItemWithConfig` instead
 */
export const list_item = listItemWithConfig();
