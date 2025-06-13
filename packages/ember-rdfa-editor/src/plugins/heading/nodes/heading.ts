import { Fragment, Node as PNode } from 'prosemirror-model';
import { getRdfaAttrs, getRdfaContentElement } from '#root/core/schema.ts';
import { optionMapOr } from '#root/utils/_private/option.ts';
import type SayNodeSpec from '#root/core/say-node-spec.ts';
import NumberEditor from '#root/components/_private/utils/number-editor.gts';
import type { ComponentLike } from '@glint/template';
import { DEFAULT_ALIGNMENT, getAlignment } from '../../alignment/index.ts';
import { HEADING_ELEMENTS } from '#root/utils/_private/constants.ts';
import { getHeadingLevel } from '#root/utils/_private/html-utils.ts';
import getClassnamesFromNode from '#root/utils/get-classnames-from-node.ts';
import type { Schema } from 'prosemirror-model';
import { ProseParser } from '#root/prosemirror-aliases.ts';

export const headingWithConfig: () => SayNodeSpec = () => {
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
      return commonAttrs;
    },
    content: 'inline*',
    group: 'block',
    defining: true,
    editable: false,
    isolating: false,
    selectable: false,
    classNames: ['say-heading'],
    parseDOM: [
      {
        tag: HEADING_ELEMENTS.join(','),
        node: 'block_rdfa',
        getAttrs(node: string | HTMLElement) {
          if (!(node instanceof HTMLHeadingElement)) {
            return false;
          }
          const rdfaAttrs = getRdfaAttrs(node, { rdfaAware: true });
          if (!rdfaAttrs) {
            return false;
          }
          return rdfaAttrs;
        },
        getContent: (node: HTMLHeadingElement, schema: Schema) => {
          const headingAttrs = {
            level: getHeadingLevel(node),
            indentationLevel: optionMapOr(
              0,
              parseInt,
              node.dataset['indentationLevel'],
            ),
            alignment: getAlignment(node),
          };
          const parser = ProseParser.fromSchema(schema);
          const slice = parser.parseSlice(getRdfaContentElement(node));
          return Fragment.from(
            schema.nodes['heading'].create(headingAttrs, slice.content),
          );
        },
      },
      {
        tag: HEADING_ELEMENTS.join(','),
        getAttrs(node: string | HTMLElement) {
          if (!(node instanceof HTMLHeadingElement)) {
            return false;
          }
          const attrs = {
            level: getHeadingLevel(node),
            indentationLevel: optionMapOr(
              0,
              parseInt,
              node.dataset['indentationLevel'],
            ),
            alignment: getAlignment(node),
          };
          return attrs;
        },
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
      return [
        `h${(level as number).toString()}`,
        {
          ...baseAttrs,
          ...node.attrs,
          class: getClassnamesFromNode(node),
        },
        0,
      ];
    },
  };
};

/**
 * @deprecated use `headingWithConfig` instead
 */
export const heading = headingWithConfig();
