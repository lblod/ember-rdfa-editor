import type { PNode } from '#root/prosemirror-aliases.ts';
import { expectOneOrZero } from '#root/utils/_private/array-utils.ts';
import { AssertionError } from '#root/utils/_private/errors.ts';
import { EditorState } from '../../index.ts';
import { getKb } from '../../plugins/knowledgebase/knowledgebase-plugin.ts';
import type { SayId } from './say-id.ts';

export function getOutgoingPropsMS(state: EditorState, node: PNode) {
  const kb = getKb(state)?.knowledgeBase;
  if (!kb) {
    throw new AssertionError(
      'could not get knowledgebase from state, is the plugin active?',
    );
  }

  const nodeQuads = kb.quadsForSayId(node.attrs['sayId'] as SayId);
  return nodeQuads;
}
export function getBacklinks(state: EditorState, node: PNode) {
}
export function getOutgoingProps(state: EditorState, node: PNode) {
  return expectOneOrZero(getOutgoingPropsMS(state, node));
}
