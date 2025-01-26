import { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  isRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAware,
} from '#root/core/schema.ts';
import type SayNodeSpec from '../core/say-node-spec.ts';
import type { NodeView } from 'prosemirror-view';
import { RDF, SKOS } from '../utils/_private/namespaces.ts';
import { getRDFFragment } from '../utils/namespace.ts';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';

const FALLBACK_LABEL = 'Data-object';

type Config = {
  rdfaAware?: boolean;
};

export const blockRdfaWithConfig: (config?: Config) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    content: 'block+',
    group: 'block',
    attrs: {
      ...rdfaAttrSpec({ rdfaAware }),
      label: {
        default: undefined,
        editable: true,
      },
    },
    definingAsContext: true,
    editable: rdfaAware,
    isolating: rdfaAware,
    selectable: rdfaAware,
    classNames: ['say-block-rdfa'],
    parseDOM: [
      {
        tag: `p, div, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section`,
        // Default priority is 50, so this means a more specific definition matches before this one
        priority: 40,
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          const attrs = getRdfaAttrs(node, { rdfaAware });
          if (attrs) {
            return { ...attrs, label: node.dataset['label'] };
          }
          return false;
        },
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node: PNode) {
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'div',
          attrs: {
            class: `say-editable ${getClassnamesFromNode(node)}`,
            'data-label': node.attrs['label'] as string,
          },
          content: 0,
        });
      } else {
        const { label, ...attrs } = node.attrs;
        return [
          'div',
          {
            ...attrs,
            'data-label': label as string,
            class: getClassnamesFromNode(node),
          },
          0,
        ];
      }
    },
  };
};

export class BlockRDFaView implements NodeView {
  dom: HTMLElement;
  labelElement: HTMLElement;
  contentDOM: HTMLElement;
  node: PNode;
  constructor(node: PNode) {
    this.node = node;
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'say-block-rdfa');
    this.labelElement = this.dom.appendChild(document.createElement('span'));
    this.labelElement.contentEditable = 'false';
    this.labelElement.textContent = getBlockRDFaLabel(
      node,
      FALLBACK_LABEL,
    ).toUpperCase();
    this.labelElement.setAttribute('class', 'say-block-rdfa--label');
    this.contentDOM = this.dom.appendChild(document.createElement('div'));
  }

  update(node: PNode) {
    if (node.type != this.node.type) {
      return false;
    }
    this.node = node;
    this.labelElement.textContent = getBlockRDFaLabel(
      node,
      FALLBACK_LABEL,
    ).toUpperCase();
    return true;
  }
}

/**
 * Function that determines which label should be shown on the `block_rdfa` node
 * Priority:
 * 1. The `label` attribute
 * 2. Value of first encountered `skos:prefLabel` attribute (if resource node)
 * 3. Last part of the first encountered type/predicate URI
 * 4. The value of the `fallback` argument
 */
function getBlockRDFaLabel(node: PNode, fallback: string) {
  const { attrs } = node;
  if (attrs['label']) {
    return attrs['label'] as string;
  }
  // Node is not rdfa-aware
  if (!isRdfaAttrs(attrs)) {
    return 'Data-object';
  }

  const { rdfaNodeType } = attrs;
  if (rdfaNodeType === 'resource') {
    const { properties } = attrs;
    const prefLabelProps = properties.filter(
      (prop) =>
        prop.object.termType === 'Literal' &&
        SKOS('prefLabel').matches(prop.predicate),
    );
    if (prefLabelProps.length) {
      return prefLabelProps[0].object.value;
    } else {
      const typeProp = properties.find(
        (prop) =>
          prop.object.termType === 'NamedNode' &&
          RDF('type').matches(prop.predicate),
      );
      if (typeProp) {
        return getRDFFragment(typeProp.object.value);
      } else {
        return fallback;
      }
    }
  } else {
    const { backlinks } = attrs;
    if (backlinks.length) {
      return getRDFFragment(backlinks[0].predicate);
    } else {
      return fallback;
    }
  }
}

/**
 * @deprecated use `blockRdfaWithConfig` instead
 */
export const block_rdfa = blockRdfaWithConfig();
