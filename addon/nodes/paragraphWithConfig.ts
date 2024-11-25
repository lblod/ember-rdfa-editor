import { getRdfaAttrs, type NodeSpec } from '@lblod/ember-rdfa-editor';
import { NON_BLOCK_NODES } from '@lblod/ember-rdfa-editor/utils/_private/constants';
import { optionMapOr } from '../utils/_private/option';
import { DEFAULT_ALIGNMENT, getAlignment } from '../plugins/alignment';
import getClassnamesFromNode from '../utils/get-classnames-from-node';

export type ParagraphDataAttributes = {
  'data-indentation-level'?: number;
  'data-sub-type'?: string;
  style?: string;
  class: string;
};

export type ParagraphNodeSpec = NodeSpec & { subType: string };

const DEFAULT_INDENTATION = 0;
const BLOCK_SELECTOR = `:not(${NON_BLOCK_NODES.join(', ')})`;
const BASE_PARAGRAPH_TYPE = 'paragraph';
const matchingSubType = (node: HTMLElement, subType: string) => {
  // basic paragraph has no subtype in its dataset and an empty subType
  const isBasicParagraph =
    node.dataset['subType'] === undefined && subType === '';
  return isBasicParagraph || node.dataset['subType'] === subType;
};

export interface ParagraphConfig {
  content?: string;
  marks?: string;
  group?: string;
  /* A mandatory subType name to separate different kinds of paragraphs in toDom functions.
  For the basic paragraph this is the empty string and will not be added to dataset */
  subType: string;
}

export const paragraphWithConfig: (
  config: ParagraphConfig,
) => ParagraphNodeSpec = (config) => {
  const name = config.subType !== '' ? config.subType : BASE_PARAGRAPH_TYPE;
  return {
    name: name,
    content: config?.content || 'inline*',
    group: config?.group || 'block paragraphGroup',
    subType: config.subType,
    defining: true,
    attrs: {
      alignment: {
        default: DEFAULT_ALIGNMENT,
      },
      indentationLevel: {
        default: DEFAULT_INDENTATION,
      },
    },
    classNames: ['say-paragraph'],
    parseDOM: [
      {
        tag: 'p',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          const blockNode = node.querySelector(BLOCK_SELECTOR);
          if (blockNode && matchingSubType(node, config.subType)) {
            // NOTE This parse rule is used to avoid parsing `<p>` tags which contain block tags,
            // hence the `skip: true` option. It's therefore not necessary to actually return
            // anything but an empty object.
            return {};
          }
          return false;
        },
        // If this rule matches (a paragraph with block node content),
        // the paragraph element itself is skipped (but it's content is still parsed).
        // Paragraphs with block content are not allowed in the HTML spec.
        //
        // This rule is mainly added in order to support older document which might contain
        // important block-node information inside `p` tags.
        // If this rule is not present, the block content of these paragraphs may not be parsed
        // correctly (it would just be parsed as flat text).
        skip: true,
      },
      {
        tag: 'p',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          const myAttrs = getRdfaAttrs(node, { rdfaAware: false });
          if (myAttrs) {
            return false;
          }

          if (!matchingSubType(node, config.subType)) return false;
          return {
            indentationLevel: optionMapOr(
              DEFAULT_INDENTATION,
              parseInt,
              node.dataset['indentationLevel'],
            ),
            alignment: getAlignment(node),
          };
        },
        consuming: false,
      },
    ],
    toDOM(node) {
      const { alignment, indentationLevel } = node.attrs;
      const attrs: ParagraphDataAttributes = {
        class: getClassnamesFromNode(node),
      };
      if (alignment && alignment !== DEFAULT_ALIGNMENT) {
        attrs.style = `text-align: ${alignment}`;
      }
      if (
        Number.isInteger(indentationLevel) &&
        indentationLevel !== DEFAULT_INDENTATION
      ) {
        attrs['data-indentation-level'] = indentationLevel as number;
      }
      const subType = (node.type.spec as ParagraphNodeSpec).subType;
      if (subType) {
        attrs['data-sub-type'] = subType;
      }
      return ['p', attrs, 0];
    },
  };
};
