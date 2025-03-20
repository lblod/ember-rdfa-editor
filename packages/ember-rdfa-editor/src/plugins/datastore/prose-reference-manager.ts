import {
  isElement,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers.ts';
import { ReferenceManager } from '@lblod/ember-rdfa-editor/utils/_private/reference-manager.ts';
import type { DatastoreResolvedPNode } from './datastore-node-types.ts';
import { isElementPNode } from './datastore-node-types.ts';

export class ProseReferenceManager extends ReferenceManager<
  DatastoreResolvedPNode,
  DatastoreResolvedPNode
> {
  constructor() {
    super(
      (node: DatastoreResolvedPNode) => node,
      (bundle: DatastoreResolvedPNode) => {
        if (isElementPNode(bundle)) {
          const { from, to, node } = bundle;
          const name = node?.type.name || '';
          const attrs = JSON.stringify(node?.attrs);
          return `${from} - ${to} - ${name} - ${attrs}`;
        } else {
          const { from, to, domNode } = bundle;
          let domNodeTag = '';
          let domNodeAttrs = '';
          if (domNode) {
            domNodeTag = tagName(domNode);
            domNodeAttrs = isElement(domNode)
              ? JSON.stringify(domNode.attributes)
              : '';
          }
          return `${from} - ${to} - ${domNodeTag} - ${domNodeAttrs}`;
        }
      },
    );
  }
}
