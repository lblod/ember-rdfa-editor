import SayController from '#root/core/say-controller.ts';
import { type PNode } from '#root/prosemirror-aliases.ts';
import type { EditorState } from 'prosemirror-state';
import { BESLUIT, RDF } from './constants.ts';
import { hasOutgoingNamedNodeTriple } from '#root/utils/namespace.ts';
import { type ElementPNode } from '#root/plugins/datastore/index.ts';
import { findAncestors } from '#root/utils/position-utils.ts';

export function getDecisionNodeLocation(controller: SayController) {
  const besluitRange = getCurrentBesluitRange(controller);
  if (!besluitRange) return;
  const decisionNodeLocation = {
    pos: besluitRange.from,
    node: besluitRange.node,
  };
  return decisionNodeLocation;
}

export const getCurrentBesluitRange = (
  controllerOrState: SayController | EditorState,
): ElementPNode | undefined => {
  const state =
    controllerOrState instanceof SayController
      ? controllerOrState.mainEditorState
      : controllerOrState;
  const selection = state.selection;
  let besluit;
  if (
    selection.$from.nodeAfter &&
    hasOutgoingNamedNodeTriple(
      selection.$from.nodeAfter.attrs,
      RDF('type'),
      BESLUIT('Besluit'),
    )
  ) {
    besluit = {
      node: selection.$from.nodeAfter,
      pos: selection.$from.pos,
    };
  } else {
    besluit =
      findAncestors(selection.$from, (node: PNode) => {
        return hasOutgoingNamedNodeTriple(
          node.attrs,
          RDF('type'),
          BESLUIT('Besluit'),
        );
      })[0] ?? null;
  }
  if (!besluit) {
    return undefined;
  }

  return {
    node: besluit.node,
    from: besluit.pos,
    to: besluit.pos + besluit.node.nodeSize,
  };
};

export const getCurrentBesluitURI = (
  controllerOrState: SayController | EditorState,
) => {
  const currentBesluitRange = getCurrentBesluitRange(controllerOrState);

  if (currentBesluitRange) {
    return currentBesluitRange.node.attrs['subject'] as string | undefined;
  }

  return;
};
