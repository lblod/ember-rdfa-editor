/**
 * Inspired by `floating-ui` (https://github.com/floating-ui/floating-ui) integrations of
 * `ember-velcro` (https://github.com/CrowdStrike/ember-velcro) and
 * `@appuniversum/ember-appuniversum` (https://github.com/appuniversum/ember-appuniversum) .
 *
 * The MIT License (MIT)
 * Copyright (c) 2021
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { assert } from '@ember/debug';
import {
  type Middleware,
  type Placement,
  type ReferenceElement,
  type Strategy,
  autoUpdate,
  computePosition,
} from '@floating-ui/dom';
import { modifier, type FunctionBasedModifier } from 'ember-modifier';

export type FloatingUISignature = {
  Element: HTMLElement;
  Args: {
    Named: {
      referenceElement: ReferenceElement | string;
      placement?: Placement;
      strategy?: Strategy;
      useTransform?: boolean;
      middleware?: Middleware[];
    };
    Positional: [];
  };
};

const floatingUI: FunctionBasedModifier<FloatingUISignature> =
  modifier<FloatingUISignature>(
    (
      floatingElement,
      _positional,
      {
        strategy = 'absolute',
        referenceElement,
        placement,
        useTransform = true,
        middleware,
      },
    ) => {
      if (typeof referenceElement === 'string') {
        const refElement = document.querySelector(referenceElement);
        assert(
          `Reference element ${referenceElement} is undefined`,
          refElement instanceof HTMLElement,
        );
        referenceElement = refElement;
      }

      Object.assign(floatingElement.style, {
        position: strategy,
        top: '0',
        left: '0',
      });

      const update = () => {
        computePosition(referenceElement as ReferenceElement, floatingElement, {
          placement,
          strategy: strategy,
          middleware,
        })
          .then(({ x, y, middlewareData }) => {
            const visibility = middlewareData.hide?.referenceHidden
              ? 'hidden'
              : 'visible';
            const xVal = Math.round(x);
            const yVal = Math.round(y);
            if (useTransform) {
              Object.assign(floatingElement.style, {
                transform: `translate(${xVal}px, ${yVal}px)`,
                visibility,
              });
            } else {
              Object.assign(floatingElement.style, {
                top: `${y}px`,
                left: `${x}px`,
                visibility,
              });
            }
          })
          .catch((e) => {
            console.error(e);
          });
      };

      const cleanup = autoUpdate(referenceElement, floatingElement, update);
      return () => {
        cleanup();
      };
    },
    {
      eager: false,
    },
  );

export default floatingUI;
