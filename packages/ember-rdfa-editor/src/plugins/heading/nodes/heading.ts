import { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema.ts';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option.ts';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec.ts';
import NumberEditor from '@lblod/ember-rdfa-editor/components/_private/number-editor/index.gts';
import type { ComponentLike } from '@glint/template';
import { DEFAULT_ALIGNMENT, getAlignment } from '../../alignment/index.ts';
import { HEADING_ELEMENTS } from '@lblod/ember-rdfa-editor/utils/_private/constants.ts';
import { getHeadingLevel } from '@lblod/ember-rdfa-editor/utils/_private/html-utils.ts';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node.ts';

type Config = {
  rdfaAware?: boolean;
};

export const headingWithConfig: (config?: Config) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    get attrs() {
      const commonAttrs = {
        level: {
          default: 1,
          editable: true,
          editor: NumberEditor as unknown as ComponentLike,
        },
        indentationLevel: {
          default: 0,
          editable: true,
          editor: NumberEditor as unknown as ComponentLike,
        },
        alignment: { default: DEFAULT_ALIGNMENT },
      };
      return { ...commonAttrs, ...rdfaAttrSpec({ rdfaAware }) };
    },
    content: 'inline*',
    group: 'block',
    defining: true,
    editable: rdfaAware,
    isolating: rdfaAware,
    selectable: rdfaAware,
    classNames: ['say-heading'],
    parseDOM: [
      {
        tag: HEADING_ELEMENTS.join(','),
        getAttrs(node: string | HTMLElement) {
          if (!(node instanceof HTMLHeadingElement)) {
            return false;
          }
          const level = getHeadingLevel(node);
          const baseAttrs = {
            level,
            indentationLevel: optionMapOr(
              0,
              parseInt,
              node.dataset['indentationLevel'],
            ),
            alignment: getAlignment(node),
          };
          return { ...baseAttrs, ...getRdfaAttrs(node, { rdfaAware }) };
        },
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node: PNode) {
      const { level, indentationLevel, alignment } = node.attrs;
      let style = '';
      if (alignment && alignment !== DEFAULT_ALIGNMENT) {
        style += `text-align: ${alignment}`;
      }
      const baseAttrs = {
        'data-indentation-level': indentationLevel as number,
        style,
      };
      if (rdfaAware) {
        return renderRdfaAware({
          tag: `h${(level as number).toString()}`,
          renderable: node,
          attrs: {
            ...baseAttrs,
            class: `say-editable ${getClassnamesFromNode(node)}`,
          },
          content: 0,
        });
      } else {
        return [
          `h${(level as number).toString()}`,
          {
            ...baseAttrs,
            ...node.attrs,
            class: getClassnamesFromNode(node),
          },
          0,
        ];
      }
    },
  };
};

/**
 * @deprecated use `headingWithConfig` instead
 */
export const heading = headingWithConfig();
