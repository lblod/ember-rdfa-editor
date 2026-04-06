import { modifier } from 'ember-modifier';

export const autoFocus = modifier((element: HTMLElement) => element.focus());
