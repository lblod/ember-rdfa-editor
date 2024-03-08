import { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import { rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import NumberEditor from '@lblod/ember-rdfa-editor/components/_private/number-editor';
import type { ComponentLike } from '@glint/template';
import { DEFAULT_ALIGNMENT, getAlignment } from '../../alignment';
import { HEADING_ELEMENTS } from '@lblod/ember-rdfa-editor/utils/_private/constants';
import { getHeadingLevel } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';

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
            class: 'say-editable',
          },
          content: 0,
        });
      } else {
        return [
          `h${(level as number).toString()}`,
          { ...baseAttrs, ...node.attrs },
          0,
        ];
      }
    },
  };
};

export const heading = headingWithConfig();
