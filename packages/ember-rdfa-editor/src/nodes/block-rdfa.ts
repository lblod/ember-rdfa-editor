import { selectNodeByRdfaId } from '#root/commands/_private/rdfa-commands/select-node-by-rdfa-id.ts';
import {
  isRdfaAttrs,
  type ModelMigrationGenerator,
} from '#root/core/rdfa-types.ts';
import { getOutgoingProps } from '#root/core/rdfa/get-outgoing-props.ts';
import { expectSayId } from '#root/core/rdfa/say-id.ts';
import { serializeNodeWithId } from '#root/core/rdfa/serialize-rdfa-node.ts';
import { triplesWithElementContentAsValue } from '#root/core/rdfa/triples-with-element-content-as-value.ts';
import type SayController from '#root/core/say-controller.ts';
import { contentElementWithMigrations } from '#root/core/schema/_private/migrations.ts';
import { knownledgeBaseKey } from '#root/plugins/knowledgebase/knowledgebase-plugin.ts';
import { conciseToRdfjs } from '#root/utils/_private/concise-term-string.ts';
import { AssertionError } from '#root/utils/_private/errors.ts';
import { Node as PNode } from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';
import type { NodeView, NodeViewConstructor } from 'prosemirror-view';
import type SayNodeSpec from '../core/say-node-spec.ts';
import { SKOS } from '../utils/_private/namespaces.ts';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';
import { getRDFFragment } from '../utils/namespace.ts';

const FALLBACK_LABEL = 'Data-object';

type Config = {
  rdfaAware?: boolean;
  /**
   * Migrations to apply to nodes parsed as block-rdfa, to modify the data model.
   * @returns false to use the default parsing or an object to define overrides
   **/
  modelMigrations?: ModelMigrationGenerator[];
};

export const blockRdfaWithConfig: (config?: Config) => SayNodeSpec = ({
  rdfaAware = false,
  modelMigrations = [],
} = {}) => {
  return {
    content: 'block+',
    group: 'block',
    attrs: {
      sayId: {
        default: undefined,
        editable: false,
      },
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
        getAttrs(element: string | HTMLElement) {
          if (typeof element === 'string') {
            return false;
          }
          const trips = triplesWithElementContentAsValue(element);
          if (!trips.isEmpty()) {
            const attrs = {
              sayId: expectSayId(element),
              label: [...trips][0].predicate.value ?? element.dataset['label'],
            };
            return attrs;
          }
          return false;
        },
        contentElement: (element) => {
          return contentElementWithMigrations(
            modelMigrations,
            rdfaAware,
            element,
          );
        },
      },
    ],
    toDOM(node, state) {
      if (!state) {
        throw new AssertionError('didnt get state');
      }
      const kb = knownledgeBaseKey.getState(state)?.knowledgeBase;
      if (kb) {
        return serializeNodeWithId({
          knowledgeBase: kb,
          nodeId: node.attrs['sayId'] as string,
          tag: 'div',
          extraDataAttributes: { label: node.attrs['label'] as string },
          extraHtmlAttributes: {
            class: `say-editable ${getClassnamesFromNode(node)}`,
          },
        });
      } else {
        throw new AssertionError('couldnt get kb state');
      }
    },
  } satisfies SayNodeSpec;
};

export class BlockRDFaView implements NodeView {
  dom: HTMLElement;
  labelElement: HTMLElement;
  contentDOM: HTMLElement;
  node: PNode;
  controller?: SayController;
  onClickRef: () => void;

  /**
   * @deprecated The SayController should now be passed to this nodeview to allow focusing nodes on
   * label clicks
   */
  constructor(node: PNode);
  constructor(
    nodeViewArgs: Parameters<NodeViewConstructor>,
    controller: SayController,
  );
  constructor(
    nodeViewArgs: Parameters<NodeViewConstructor> | PNode,
    controller?: SayController,
  ) {
    this.node = Array.isArray(nodeViewArgs) ? nodeViewArgs[0] : nodeViewArgs;
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'say-block-rdfa');
    this.labelElement = this.dom.appendChild(document.createElement('span'));
    this.labelElement.contentEditable = 'false';
    this.labelElement.textContent = getBlockRDFaLabel(
      this.node,
      FALLBACK_LABEL,
      controller?.activeEditorState,
    ).toUpperCase();

    this.labelElement.setAttribute('class', 'say-block-rdfa--label');
    // Save a ref to an arrow function as we can't use class methods directly here
    this.onClickRef = () => this.onClick();
    this.labelElement.addEventListener('click', this.onClickRef);
    this.controller = controller;
    this.contentDOM = this.dom.appendChild(document.createElement('div'));
  }

  destroy() {
    removeEventListener('click', this.onClickRef);
  }

  onClick() {
    if (this.controller) {
      this.controller.doCommand(
        selectNodeByRdfaId({
          rdfaId: this.node.attrs['__rdfaId'] as string,
          dontScroll: true,
        }),
        {
          view: this.controller.mainEditorView,
        },
      );
    }
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
function getBlockRDFaLabel(node: PNode, fallback: string, state?: EditorState) {
  const { attrs } = node;
  if (attrs['label']) {
    return attrs['label'] as string;
  }
  // Node is not rdfa-aware
  if (!isRdfaAttrs(attrs)) {
    return 'Data-object';
  }

  if (state) {
    const props = getOutgoingProps(state, node);
    if (props) {
      const prefLabelProps = props.otherQuads.match(
        null,
        SKOS('prefLabel').namedNode,
      );

      if (prefLabelProps.size) {
        return [...prefLabelProps][0].object.value;
      } else {
        const typeProp = props.otherQuads.match(null, conciseToRdfjs('a'));
        if (typeProp.size) {
          return getRDFFragment([...typeProp][0].object.value);
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
  return fallback;
}

/**
 * @deprecated use `blockRdfaWithConfig` instead
 */
export const block_rdfa = blockRdfaWithConfig();
