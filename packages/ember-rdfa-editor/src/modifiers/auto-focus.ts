import Modifier from 'ember-modifier';
/* eslint-disable  ember/no-runloop -- we inlined the addon, we'll try to keep the code as-is as long as possible */
import { next, scheduleOnce } from '@ember/runloop';

// This modifier is a copy of the `@zestia/ember-auto-focus` addon (v5.2.1): https://github.com/zestia/ember-auto-focus/blob/973e00749e6c4e9ab443b3bee08fbf7937a5bb4b/addon/modifiers/auto-focus.js
// We inline the implementation since they no longer publish to npm and the implementation is very small anyways.
// TODO: We should re-evaluate the usage of this since it has accessibility implications and we might not need this modifier in the future.

interface Signature {
  Element: HTMLElement;
  Args: {
    Positional: [selector?: string];
    Named: {
      disabled?: boolean;
    } & FocusOptions;
  };
}

export default class AutoFocusModifier extends Modifier<Signature> {
  didSetup = false;

  modify(
    element: Signature['Element'],
    positional: Signature['Args']['Positional'],
    named: Signature['Args']['Named'],
  ) {
    let targetElement: HTMLElement | null = element;
    if (this.didSetup) {
      return;
    }

    this.didSetup = true;

    const { disabled } = named;

    if (disabled) {
      return;
    }

    const [selector] = positional;

    if (selector) {
      targetElement = element.querySelector(selector);
    }

    if (!targetElement) {
      return;
    }

    scheduleOnce('afterRender', this, afterRender, targetElement, named);
  }
}

function afterRender(element: HTMLElement, options?: FocusOptions) {
  if (element.contains(document.activeElement)) {
    return;
  }

  focus(element, options);
}

function focus(element: HTMLElement, options?: FocusOptions) {
  element.dataset['programmaticallyFocused'] = 'true';
  element.focus(options);
  next(() => delete element.dataset['programmaticallyFocused']);
}
