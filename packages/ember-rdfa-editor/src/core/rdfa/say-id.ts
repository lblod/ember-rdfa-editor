import type { PNode } from '#root/prosemirror-aliases.ts';
import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { AssertionError } from '#root/utils/_private/errors.ts';
import { v4 as uuidv4 } from 'uuid';
export type SayId = `[say]-${string}`;

export function makeSayId(): SayId {
  return `[say]-${uuidv4()}`;
}

export function isSayId(str: unknown): str is SayId {
  if (typeof str === 'string') {
    return str.startsWith('[say]');
  }
  return false;
}
export function getSayId(node: PNode | HTMLElement): SayId | null {
  let id: string | undefined;
  if ('nodeType' in node && isElement(node)) {
    id = node.dataset['sayId'];
  } else {
    id = node.attrs['sayId'] as string | undefined;
  }
  if (!isSayId(id)) {
    return null;
  }
  return id;
}

export function expectSayId(node: PNode | HTMLElement): SayId {
  const id = getSayId(node);
  if (!id) {
    throw new AssertionError(`Id "${id}" is not a valid id`);
  }
  return id;
}
